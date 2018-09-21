const Eris = require('eris');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const util = require('util');
const config = require('./config');
const bot = new Eris(config.token, { maxShards: 'auto' });
const prefixes = config.prefixes || 'pkg ';
const parseXml = util.promisify(require('xml2js').parseString);

const providers = {
    npm: {
        for: 'npm',
        logo: fs.readFileSync(path.resolve('./img/npm.png')),
        async execute(msg, args) {
            let results = await fetch('https://api.npms.io/v2/search?q=' + args.map(a => encodeURIComponent(a)).join('+'));
            let json = await results.json();
            if (json.code) {
                await msg.channel.createMessage('<:icerror:435574504522121216>  |  API error! :(');
            } else {
                if (json.total < 1) {
                    await msg.channel.createMessage('<:icerror:435574504522121216>  |  No packages found.');
                } else {
                    let package = json.results[0].package;
                    let maintainers = '';
                    package.maintainers.forEach(maintainer => {
                        maintainers += maintainer.username;
                        maintainers += ' (';
                        maintainers += maintainer.email;
                        maintainers += ')';
                        maintainers += '\n';
                    });
                    await msg.channel.createMessage({
                        embed: {
                            title: package.name,
                            url: package.links.npm,
                            description: package.description,
                            fields: [
                                {
                                    name: 'Latest Version',
                                    value: package.version,
                                    inline: true
                                },
                                {
                                    name: 'Maintainers',
                                    value: maintainers,
                                    inline: true
                                }
                            ],
                            color: 0xC1393B,
                            thumbnail: { url: 'attachment://logo.png' }
                        }
                    }, { file: providers.npm.logo, name: 'logo.png' });
                }
            }
        }
    },
    nuget: {
        for: 'NuGet',
        logo: fs.readFileSync(path.resolve('./img/nuget.png')),
        async execute(msg, args) {
            let results = await fetch('https://api-v2v3search-0.nuget.org/query?q=' + args.map(a => encodeURIComponent(a)).join('.'));
            let json = await results.json();
            if (json.totalHits < 1) {
                await msg.channel.createMessage('<:icerror:435574504522121216>  |  No packages found.');
            } else {
                let package = json.data[0];
                let authors = '';
                package.authors.forEach(author => {
                    authors += author;
                    authors += '\n';
                });
                await msg.channel.createMessage({
                    embed: {
                        title: package.title,
                        url: 'https://nuget.org/packages/' + package.title + '/',
                        description: package.description,
                        fields: [
                            {
                                name: 'Latest Version',
                                value: package.version,
                                inline: true
                            },
                            {
                                name: 'Authors',
                                value: authors,
                                inline: true
                            },
                            {
                                name: 'Total Downloads',
                                value: package.totalDownloads,
                                inline: true
                            }
                        ],
                        color: 0x004681,
                        thumbnail: { url: 'attachment://logo.png' }
                    }
                }, { file: providers.nuget.logo, name: 'logo.png' });
            }
        }
    }
};

const shortcutRegex = /^(\w+)\/(\S+)/

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
    };
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
            desc += providers[prov].for;
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