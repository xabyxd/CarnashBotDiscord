module.exports = {
    apps: [
        {
            name: 'carnashbot',
            script: 'dist/bot.js',
            cwd: __dirname,
            node_args: '--enable-source-maps',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,

            // Reinicios: evita bucles rápidos si el bot crashea al arrancar
            min_uptime: '10s',
            max_restarts: 10,
            exp_backoff_restart_delay: 200,

            // Parada limpia (tiempo para cerrar el cliente de Discord)
            kill_timeout: 5000,

            // Logs con timestamp
            time: true,
            merge_logs: true,

            max_memory_restart: '256M',
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
}
