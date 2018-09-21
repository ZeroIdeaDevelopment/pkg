const Eris = require('eris');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const bot = new Eris(config.token, { maxShards: 'auto' });
const prefixes = config.prefixes || 'pkg ';

const shortcutRegex = /^(\w+)\/(\S+)/

var providers = {};

fs.readdirSync(path.resolve('./providers')).forEach(provider => {
    let Provider = require(path.resolve('./providers', provider));
    let p = new Provider();
    providers[p.name] = p;
});

bot.on('messageCreate', async msg => {

    let cprefix = prefixes.filter(a => msg.content.startsWith(a))[0];

    if (!cprefix && (config.enableShortcuts || true)) {
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
        let desc = 'Commands:';
        Object.keys(providers).forEach(prov => {
            desc += '\n**';
            desc += prov;
            desc += '** - Searches ';
            desc += providers[prov].name;
        });
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

bot.on('connect', async () => {
    console.log('connected');
    await bot.editStatus('online', {
        type: 0,
        game: `with packages | ${prefixes[0]}help`
    })
});

bot.connect();