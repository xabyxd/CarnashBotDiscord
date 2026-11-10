const API_BASE_URL = "https://xabyserver.ddns.net";
const API_ENDPOINT = "/lol/v4/rank.php";

export interface LolRank {
    summoner: string;
    region: string;
    tier?: string;
    rank?: string;
    lp?: number;
    wins?: number;
    losses?: number;
    winrate?: string;
}

export class LolApiError extends Error {
    constructor(message: string, public readonly status?: number) {
        super(message);
        this.name = "LolApiError";
    }
}

export async function fetchLolRank(summoner: string, tag: string, region: string): Promise<LolRank> {
    const params = new URLSearchParams({
        name: summoner,
        tag,
        r: region,
        lang: "en"
    });

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}?${params}`, {
        signal: AbortSignal.timeout(10_000)
    });

    if (!response.ok) {
        throw new LolApiError(`API responded with status ${response.status}`, response.status);
    }

    return (await response.json()) as LolRank;
}