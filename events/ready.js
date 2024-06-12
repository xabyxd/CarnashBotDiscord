module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Bot is online as: ${client.user.tag}`);
    
    
        // Update bot activity status
        console.log('--- BOT DETAILS ---');
        console.log(`Username: ${client.user.username}`);
        console.log(`ID: ${client.user.id}`);
        console.log(`Servers: ${client.guilds.cache.size}`);
        console.log('-------------------');

        // List all the servers the bot is connected to
        client.guilds.cache.forEach((guild) => {
            console.log(`Connected to server: ${guild.name} (ID: ${guild.id})`);
        });
    }
};
