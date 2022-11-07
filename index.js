const {Client, Collection, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField} = require('discord.js');
require('dotenv').config();

// Initialzing Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.Reaction,
        Partials.ThreadMember,
        Partials.User
    ],
    presence: {
        activities: [{name: `Raiden Chat Bot`, type: 0}],
        status: "online"
    },
    allowedMentions:{
        repliedUser: false,
        parse: ['users','roles','everyone']
    }
});

// Crash - Prevention
process.on('unhandledRejection', async (err, cause) => {
    console.log(`[Uncaught Rejection]: ${err}`.bold.red);
    console.log(cause);
});

process.on('uncaughtException', async err => {
    console.log(`[Uncaught Exception] ${err}`.bold.red);
});

client.on('ready', async client => {
    const stringlength = 69;
    console.log(`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`.magenta)
    console.log(`┃ `.magenta+ " ".repeat(-1+(stringlength-` ┃ `.length-`[Events] ${client.user.tag} is online!`.length)/2) + `[Events] ${client.user.tag} is online!`.green.bold + " ".repeat((stringlength-` ┃ `.length-`[Events] ${client.user.tag} is online!`.length)/2)+ "┃".magenta)
    console.log(`┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`.magenta);
});

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

let prompt = `Raiden is a utility bot which can perform various taks:\n\
You: What does HTML stand for?\n\
Raiden: Hypertext Markup Language.\n\
You: When did the first airplane fly?\n\
Raiden: On December 17, 1903, Wilbur and Orville Wright made the first flights.\n\
You: What is the meaning of life?\n\
Raiden: I'm not sure. You should ask my friend Google.\n\
You: hey whats up?\n\
Raiden: Nothing much. You?\n\
`;

client.on('messageCreate', async message => {
    if(message.author.bot) return;
    try{
        if(message.channel.id == 'channel-id') { // Channel ID in Discord
                collection.forEach((value, key) => {
                    let l = value[value.length - 1]
                    if(Date.now() - l[0] >= 60*1000) collection.delete(key)
                });
                if(!message.channel.permissionsFor(client.user.id).has(PermissionsBitField.Flags.SendMessages)) return;
                message.channel.sendTyping();

                if(!collection.has(message.author.id)){
                    collection.set(message.author.id, []);
                }

                let userm = collection.get(message.author.id);
                if(!userm || !Array.isArray(userm)) userm = [];
                userm = userm.filter(d => 60*1000 - (Date.now() - d[0]) >= 0);

                let prev = '';
                await userm.forEach(async d => {
                    let userline = `You: ${d[1]}\n\ `;
                    let botline = userline.concat(`Raiden: ${d[2]}\n\n\ `);
                    prev = prev.concat(botline);
                });

                let b = prompt.concat(prev).concat(`You: ${message.cleanContent}\n\ `);
                
    
                const openai = new OpenAIApi(configuration);
                const response = await openai.createCompletion({
                    model: "text-davinci-002",
                    prompt: b,
                    temperature: 0.1,
                    max_tokens: 60,
                    top_p: 0.3,
                    frequency_penalty: 0.5,
                    presence_penalty: 0.0,
                }).catch(e => console.log(`${e}`.red));

                message.reply({content: `${response.data.choices[0].text.split(':')[1]?response.data.choices[0].text.split(':')[1]:response.data.choices[0].text}`, allowedMentions: {repliedUser: false}}).catch(e => message.reply(`_ _`).catch(e => null));
                
                userm.push([Date.now(), message.cleanContent.slice(0, 1020), `${response.data.choices[0].text.split(':')[1]?response.data.choices[0].text.split(':')[1]:response.data.choices[0].text}`]);
                collection.set(message.author.id, userm);
                
                return;
        }
    } catch(e){
        console.log(`[AI-Chat] ${e}`.red);
        message.channel.send('API is down.');
    }
});

// Logging in Discord
client.login(process.env.token);
