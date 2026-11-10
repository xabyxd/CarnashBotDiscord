# CarnashBot

Bot de Discord de uso personal de CarnashGG / 6X6 Dev Team. Hecho con TypeScript y [discord.js](https://discord.js.org) v14.

## Requisitos

- Node.js 22 o superior
- Una aplicación de Discord con su bot (token y client ID desde el [Developer Portal](https://discord.com/developers/applications))

## Instalación

```bash
npm install
cp .env.example .env
```

Rellena el `.env`:

| Variable | Descripción |
| --- | --- |
| `DISCORD_TOKEN` | Token del bot |
| `DISCORD_CLIENT_ID` | ID de la aplicación |
| `DISCORD_GUILD_ID` | (Opcional) ID de un servidor. Con él los comandos se registran al instante; sin él, de forma global (puede tardar) |
| `BOT_NAME` | Nombre que se muestra en los logs |
| `BOT_VERSION` | Versión que se muestra en el estado del bot |

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Arranca con recarga automática (tsx) |
| `npm run typecheck` | Comprueba los tipos sin compilar |
| `npm run build` | Compila a `dist/` |
| `npm start` | Ejecuta la versión compilada |

## Comandos

| Comando | Descripción |
| --- | --- |
| `/hello` | Saluda |
| `/ping` | Muestra la latencia del bot y de la API |
| `/info` | Información del bot (servidores, uptime...) |
| `/lolrank` | Muestra información del rango de un invocador de LoL |

### Añadir un comando nuevo

Crea un archivo en `src/commands/` que exporte por defecto un objeto con `data` y `execute`:

```typescript
import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types/command.js";

const command: Command = {
    data: new SlashCommandBuilder()
    .setName("ejemplo")
    .setDescription("Un comando de ejemplo."),
    async execute(interaction) {
        await interaction.reply("Funciona!");
    },
};

export default command;
```

Se carga y se registra solo al arrancar el bot.

## Despliegue con PM2

```bash
npm ci
npm run build
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
```

## Estructura

```
src/
├── bot.ts              # Punto de entrada
├── commands/           # Un archivo por comando
├── handlers/           # Carga y registro de comandos
├── types/              # Tipos compartidos
└── utils/              # Logger y utilidades de fecha
```

## Licencia

[Apache-2.0](LICENSE)
