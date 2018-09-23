const Eris = require('eris');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const bot = new Eris(config.token);
const prefixes = config.prefixes || ['pkg '];
const fetch = require('node-fetch');

const shortcutRegex = /^(\w+)\/(\S+)/
const altShortcut = /(\S+)@(\w+)/
// first is prov/arg
// second is arg@prov
var providers = Object.create(null);

fs.readdirSync(path.resolve('./providers')).forEach(provider => {
    let Provider = require(path.resolve('./providers', provider));
    let p = new Provider();
    providers[provider.substring(0, provider.length - 3)] = p;
    console.log('loaded provider ' + provider);
});

bot.on('messageCreate', async msg => {
    if (msg.author.bot) return;
    let cprefix = prefixes.find(a => msg.content.startsWith(a));

    if (!cprefix && !config.disableShortcuts) {
        let provider, pak;
        let re = shortcutRegex.exec(msg.content);
        if (!re) {
            re = altShortcut.exec(msg.content);
            if (!re) return
            provider = re[2]
            pak = re[1]
        } else {
            provider = re[1];
            pak = re[2];
        }
        let thing = [pak];
        if (providers[provider]) {
            console.log(`searching ${provider} for ${pak} via shortcut`)
            await providers[provider].execute(msg, thing);
        }
        return;
    }
    if (!cprefix && config.disableShortcuts) return

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
        desc += '\n\nProviders can be accessed via `provider/query`, `query@provider` or through `pkg provider query`, e.g. `npm/eris`, `eris@npm` or `pkg npm eris`. This only works at the start of your message EXCEPT for `query@provider`. If you wanted, you can say `The best library is eris@npm` and pkg will link it for you.'
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
    await postStats();
});

bot.connect();

async function postStats() {
    let dblEndpoint = 'https://discordbots.org/api/bots/' + bot.user.id + '/stats';
    let dbotsEndpoint = 'https://bots.discord.pw/api/bots/' + bot.user.id + '/stats';

    let obj = {
        server_count: bot.guilds.filter(a => true).length
    }

    let res = await fetch(dbotsEndpoint, {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: { Authorization: config.apiKeys.dbots, 'Content-Type': 'application/json' }
    });

    res = await fetch(dblEndpoint, {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: { Authorization: config.apiKeys.dbl, 'Content-Type': 'application/json' }
    });

    console.log(await res.json());

    console.log('stats posted');
}