const { MessageEmbed, MessageAttachment } = require('discord.js');
const { Command } = require('discord.js-commando');
const moment = require('moment');
var fs = require('fs');

async function fetchMore(msg, channel_id, limit = 250) {
    if (!msg) { throw new Error(`No message attached.`); }
    if (limit <= 100) { return await msg.guild.channels.cache.get(channel_id).messages.fetch({ limit: limit }); }
  
    let messageData = []
    let tempFetch = []
    let lastId = null;
    let options = {};
    let remaining = limit;
  
    while (remaining > 0) {
        options.limit = remaining > 100 ? 100 : remaining;
        remaining = remaining > 100 ? remaining - 100 : 0;
      
        if (lastId) { options.before = lastId; }
        let messages = await msg.guild.channels.cache.get(channel_id).messages.fetch(options);
  
        if (!messages.last()) {break;}
  
        // Concat and Delete
        
        tempFetch.push(Array.from(messages));

        lastId = messages.last().id;
    }
    
    let prevElement;
    tempFetch.forEach(element => {
        if (!prevElement) { prevElement = element }
        else { prevElement = prevElement.concat(element) }
    });
    messageData = prevElement;
    messageData.reverse();
    return messageData;
}

module.exports = class ChannelLogCommand extends Command {
    constructor (client) {
        super(client, {
            name: 'logchannel',
            group: 'util',
            memberName: 'logchannel',
            description: 'Logs all messages of the channel that the command is used in.',
            throttling: {
                usages: 5,
                duration: 10
            },
            args: [
                {
                    key: 'limit',
                    prompt: 'How many messages do you want to log?',
                    type: 'integer',
                    min: 1,
                },
                {
                    key: 'exporttofile',
                    prompt: 'Do you want to export them to a file/a hastebin document (Do not know what to use yet.)',
                    type: 'boolean',
                },
                {
                    key: 'exportfilename',
                    type: 'string',
                    prompt: 'you aren\'t supposed to see this.',
                    default: 'log_chat.txt'
                }
            ]
        })
    }

    async run (msg, { limit, exporttofile, exportfilename }) {
        const currentChannel = await msg.channel.id;  
        const fetchResult = await fetchMore(msg, currentChannel, limit);
        const fetchedMessageArray = []

        for (const [k, v] of fetchResult) {
            let regex = /<@(!:?)[0-9]+>/gmis;
            let author = v.author.username;
            let botBool = v.author.bot;
            let temp = v.content;

            let message = temp.replace(regex, "<MENTION>")
            console.log(message, regex.test(message));

            let timestamp = new Date(v.createdTimestamp);

            if (message === '') { message = "[EMPTY] (Possibly was a RichEmbed)" }
            
            if (botBool) { fetchedMessageArray.push(`<${timestamp.toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}> [BOT] ${author}: ${message}`) }
            else { fetchedMessageArray.push(`<${timestamp.toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}> ${author}: ${message}`) }  
        }
        
        if (exporttofile) {
            var file = fs.createWriteStream("./logs/" + exportfilename);
            file.on('error', function(err) { console.log(err) });
            fetchedMessageArray.forEach(element => { file.write(element + '\n'); });
            file.end();

            return msg.channel.send("Done. File deployed here.", { files: ["./logs/" + exportfilename] })
        } else {
            return msg.channel.send("Logged to console.")
        }    
    }
}
