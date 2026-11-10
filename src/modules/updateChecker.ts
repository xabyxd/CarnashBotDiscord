import type { Client } from 'discord.js';
import kleur from 'kleur';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { log } from "../utils/logger.js";

// Discord user ID that receives the DM (set it in .env as OWNER_USER_ID)
const OWNER_ID = process.env.OWNER_USER_ID;
const ENVIRONMENT = process.env.NODE_ENV;

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // every 24 hours
const INITIAL_DELAY_MS = 30 * 1000;            // 30s after startup
const CONCURRENCY = 8;                         // simultaneous requests to the npm registry
const MESSAGE_LIMIT = 1900;                    // Discord allows 2000 characters

// Module tag shown after the log level, e.g. "[INFO]  [updates] ..."
const TAG = kleur.magenta("[updates]");

interface PackageJson {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
}

type ChangeType = 'major' | 'minor' | 'patch' | 'other';

interface PackageUpdate {
    name: string;
    current: string;
    latest: string;
    type: ChangeType;
    dev: boolean;
}

let lastSignature = '';

function parseVersion(v: string): [number, number, number] | null {
    const m = /^(\d+)\.(\d+)\.(\d+)/.exec(v);
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

function compareVersions(current: string, latest: string): ChangeType | null {
    const c = parseVersion(current);
    const l = parseVersion(latest);
    if (!c || !l) return current !== latest ? 'other' : null;

    if (l[0] !== c[0]) return l[0] > c[0] ? 'major' : null;
    if (l[1] !== c[1]) return l[1] > c[1] ? 'minor' : null;
    if (l[2] !== c[2]) return l[2] > c[2] ? 'patch' : null;
    return null;
}

// Skips dependencies that don't come from the npm registry (git, file, workspace, aliases...)
function isRegistryDependency(spec: string): boolean {
    return !/^(git|http|https|file|link|workspace|github|npm):/.test(spec) && !spec.includes('/');
}

// Tries to read the version actually installed; falls back to the range in package.json
async function installedVersion(root: string, name: string, range: string): Promise<string> {
    try {
        const file = path.join(root, 'node_modules', name, 'package.json');
        const pkg = JSON.parse(await readFile(file, 'utf8')) as { version: string };
        return pkg.version;
    } catch {
        return range.replace(/^[\^~>=<\s]+/, '');
    }
}

async function latestVersion(name: string): Promise<string> {
    const url = `https://registry.npmjs.org/${name.replace('/', '%2F')}/latest`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { version: string };
    return data.version;
}

export async function findUpdates(root = process.cwd()): Promise<PackageUpdate[]> {
    const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')) as PackageJson;

    const deps = [
        ...Object.entries(pkg.dependencies ?? {}).map(([n, r]) => ({ name: n, range: r, dev: false })),
        ...Object.entries(pkg.devDependencies ?? {}).map(([n, r]) => ({ name: n, range: r, dev: true })),
    ].filter((d) => isRegistryDependency(d.range));

    const result: PackageUpdate[] = [];

    for (let i = 0; i < deps.length; i += CONCURRENCY) {
        const batch = deps.slice(i, i + CONCURRENCY);

        const responses = await Promise.allSettled(
            batch.map(async (d) => {
                const [current, latest] = await Promise.all([
                    installedVersion(root, d.name, d.range),
                    latestVersion(d.name),
                ]);
                return { ...d, current, latest };
            }),
        );

        responses.forEach((r, idx) => {
            if (r.status === 'rejected') {
                log.warn(TAG, `Could not check ${batch[idx]?.name ?? 'unknown'}:`, r.reason);
                return;
            }
            const { name, current, latest, dev } = r.value;
            const type = compareVersions(current, latest);
            if (type) result.push({ name, current, latest, type, dev });
        });
    }

    const order: Record<ChangeType, number> = { major: 0, minor: 1, patch: 2, other: 3 };
    return result.sort((a, b) => order[a.type] - order[b.type] || a.name.localeCompare(b.name));
}

function buildMessages(list: PackageUpdate[]): string[] {
    const nameWidth = Math.max(...list.map((u) => u.name.length + (u.dev ? 4 : 0)));
    const currentWidth = Math.max(...list.map((u) => u.current.length));

    const lines = list.map((u) => {
        const name = (u.name + (u.dev ? ' (d)' : '')).padEnd(nameWidth);
        return `${name}  ${u.current.padEnd(currentWidth)} → ${u.latest}  [${u.type}]`;
    });

    const header = `📦 **Updates available** (${list.length}) in ${ENVIRONMENT} environment\n`;
    const footer = '\n(d) = devDependency';

    const messages: string[] = [];
    let block: string[] = [];
    let length = 0;

    const flush = () => {
        if (block.length === 0) return;
        messages.push('```\n' + block.join('\n') + '\n```');
        block = [];
        length = 0;
    };

    for (const line of lines) {
        if (length + line.length + 1 > MESSAGE_LIMIT - 200) flush();
        block.push(line);
        length += line.length + 1;
    }
    flush();

    messages[0] = header + messages[0];
    messages[messages.length - 1] += footer;
    return messages;
}

export async function checkUpdates(client: Client, force = false): Promise<void> {
    // Also narrows OWNER_ID from 'string | undefined' to 'string'
    if (!OWNER_ID) {
        log.warn(TAG, 'OWNER_USER_ID is not set in .env, skipping check');
        return;
    }

    try {
        const list = await findUpdates();

        if (list.length === 0) {
            log.ok(TAG, 'All dependencies are up to date');
            lastSignature = '';
            return;
        }

        // Avoids sending the same notification every day if nothing changed
        const signature = list.map((u) => `${u.name}@${u.latest}`).join('|');
        if (!force && signature === lastSignature) {
            log.info(TAG, 'Nothing new since the last notification');
            return;
        }

        const user = await client.users.fetch(OWNER_ID);
        for (const message of buildMessages(list)) {
            await user.send(message);
        }

        lastSignature = signature;
        log.ok(TAG, `DM sent: ${list.length} updates`);
    } catch (error) {
        // E.g. DMs closed, no shared server, no network...
        log.error(TAG, 'Error while checking/sending updates:', error);
    }
}

export function startUpdateChecker(client: Client): void {
    if (!OWNER_ID) {
        log.warn(TAG, 'OWNER_USER_ID is not set in .env, update checker disabled');
        return;
    }

    setTimeout(() => void checkUpdates(client), INITIAL_DELAY_MS);
    setInterval(() => void checkUpdates(client), CHECK_INTERVAL_MS);
}