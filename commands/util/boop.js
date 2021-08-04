const { MessageEmbed } = require('discord.js')
const { Command } = require('discord.js-commando')

module.exports = class BoopCommand extends Command {
    constructor (client) {
        super(client, {
              name: 'boop',
              group: 'util',
              memberName: 'boop',
              description: 'Checks the bot\'s ping to the Discord server.',
              throttling: {
                usages: 5,
                duration: 10
            }
        })
    }

    async run (msg) {
        const ping = await msg.reply('Pinging...')

        const embed = new MessageEmbed()
            .setTitle('Boop!')
            .setAuthor(msg.author.username, msg.author.displayAvatarURL)
            .setColor('#5122e6')
            .addField('The message round-trip took:', `${ping.createdTimestamp - msg.createdTimestamp}ms`, false)
            .setTimestamp()

        if (this.client.ping) { embed.addField('The heartbeat ping is:', `${Math.round(this.client.ping)}ms`, false) }

        return ping.edit('', { embed })
    }
}
