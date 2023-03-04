const {Client, Collection, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField} = require('discord.js');
require('dotenv').config();
const collection = new Map();
require('colors');

// Initialzing Client
const client = new Client({
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ],
    allowedMentions:{
        repliedUser: false,
        parse: ['users','roles','everyone']
    },
    presence: {
        activities: [{name: `/help | Raiden ChatBot`, type: 0}],
        status: "idle"
    },
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

let prompt = `The following is a conversation with a Discord bot Raiden. Raiden is creative, clever, helpful and very friendly.\n\

You: Hello, who are you?
AI: Hey, I am Raiden. I was created by Elitex, he is cool programmer. I was made on 21 Novemeber, 2021. My Support Server and Community Server Link: https://discord.gg/raidenbot . My website link: https://raidenbot.xyz

You: Who is Elitex?
AI: Elitex is a my developer. He solely developes my each and every feature. He has some public repo's at https://github.com/Elitex07. He works alone on me, he has team of bug testers to test or confirm Bugs.
`;

client.on('messageCreate', async message => {
    if(message.author.bot) return;
    try{
        if(message.channel.id == '1034783293859704844') { // Channel ID in Discord
                collection.forEach((value, key) => {
                    let l = value[value.length - 1]
                    if(Date.now() - l[0] >= 60*1000) collection.delete(key)
                });
                if(!message.channel.permissionsFor(client.user.id).has(PermissionsBitField.Flags.SendMessages)) return;
                if(message.type != 0 || ![0 , 5, 10, 11, 12].includes(message.channel.type)) return; //Ignores other types of message and replies
                message.channel.sendTyping();

                if(!collection.has(message.author.id)){
                    collection.set(message.author.id, []);
                }

                let userm = collection.get(message.author.id);
                if(!userm || !Array.isArray(userm)) userm = [];
                userm = userm.filter(d => 60*1000 - (Date.now() - d[0]) >= 0);

                let prev = '';
                await userm.forEach(async d => {
                    let userline = `${message.member.displayName}: ${d[1]}\n\ `;
                    let botline = userline.concat(`AI: ${d[2]}\n\n\ `);
                    prev = prev.concat(botline);
                });

                let b = prompt.concat(prev).concat(`${message.member.displayName}: ${message.cleanContent}\n\ `).replace(/You/g,`${message.member.displayName}`);
                console.log(b)
                
                const openai = new OpenAIApi(configuration);
                var err = false;
                const response = await openai.createCompletion({
                    model: "text-davinci-002",
                    prompt: b,
                    temperature: 0.1,
                    max_tokens: 250,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0.6,
                }).catch(e => {
                    console.log(`${e}`.red);
                    err = true
                });

                if(err) return;

                let reply = response.data.choices[0].text;
                if(reply.includes('AI:')) reply = reply.split('AI:')[1];
                if(reply.endsWith(`${message.member.displayName}`)) reply = reply.slice(-message.member.displayName.length, 0);

                message.reply({content: reply, allowedMentions: {repliedUser: false}, flags:MessageFlagsBitField.Flags.SuppressEmbeds})
                .catch(async e => {
                    err = true
                });

                if(err) return;

                 userm.push([Date.now(), message.cleanContent.slice(0, 100), `${reply}`]);
                collection.set(message.author.id, userm);                
                return;
        }
    } catch(e){
        console.log(`[AI-Chat] ${e}`.red);
    }
});

// Logging in Discord
client.login(process.env.token);
