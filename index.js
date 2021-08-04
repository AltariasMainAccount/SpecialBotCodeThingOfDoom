const { CommandoClient, SQLiteProvider } = require('discord.js-commando');
const dotenv = require('dotenv').config();
const path = require('path');

const client = new CommandoClient({
	commandPrefix: '>',
	owner: '461937919339528213',
	invite: 'https://discord.gg/PsvUUbN',
});

client.registry
	.registerDefaultTypes()
	.registerGroups([
        ['util', 'Utility Tools for e.g. Discord Chat Backlogging'],
	])
	.registerDefaultGroups()
	.registerDefaultCommands({
        unknownCommand: false,
    })
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
        // Required for you, the user.
        console.log(`Utility Bot Online, Logged in as ${client.user.tag}! (${client.user.id}).`);
        client.user.setActivity('Utility Tool online');
});

// Top it off with error logging

client.on('error', console.error);

// Give the bot live!

client.login(process.env.TOKEN); // IT'S ALIVEEEEEEE!!!