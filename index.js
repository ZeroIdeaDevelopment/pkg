const Eris = require('eris');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const bot = new Eris(config.token);
const prefixes = config.prefixes || ['pkg '];

const shortcutRegex = /^(\w+)\/(\S+)/

var providers = Object.create(null);

fs.readdirSync(path.resolve('./providers')).forEach(provider => {
    let Provider = require(path.resolve('./providers', provider));
    let p = new Provider();
    providers[provider.substring(0, provider.length - 3)] = p;
});

bot.on('messageCreate', async msg => {
    if (msg.author.bot) return;
    let cprefix = prefixes.find(a => msg.content.startsWith(a));

    if (!cprefix) {
        let re = shortcutRegex.exec(msg.content);
        if (!re) return;
        let provider = re[1];
        let package = re[2];
        let thing = [package];
        if (providers[provider]) {
            console.log(`searching ${provider} for ${package} via shortcut`)
            await providers[provider].execute(msg, thing);
        }
        return;
    }

    let raw = msg.content.slice(cprefix.length).split(' ');
    let provider = raw[0];
    raw.shift();
    let args = raw;
    
    if (provider === 'help') {
        let desc = 'Providers:';
        Object.keys(providers).forEach(prov => {
            desc += '\n**';
            desc += prov;
            desc += '** - Searches ';
            desc += providers[prov].name;
        });
        desc += '\n\nProviders can be accessed via `provider/query` or through `pkg provider query`, e.g. `npm/eris` or `pkg npm eris`. This only works at the start of your message.'
        await msg.channel.createMessage({embed: {
            title: 'pkg Help',
            description: desc,
            color: 0xDBB551
        }});
    } else {
        if (providers[provider]) {
            console.log('searching ' + provider + ' for ' + args);
            await providers[provider].execute(msg, args);
        }
    }
});

bot.on('connect', () => {
    console.log('connected');
});

bot.on('ready', async () => {
    console.log('ready');
    await bot.editStatus('idle', {
        type: 0,
        name: `with packages | ${prefixes[0]}help`
    });
});

bot.connect();