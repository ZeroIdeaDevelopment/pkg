const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Provider = require('../Provider');

module.exports = class extends Provider {
    constructor() {
        super();
        this.name = 'Arch User Repository';
        this.logo = fs.readFileSync(path.resolve('./img/aur.png'));
    }

    async execute(msg, args) {
        let results = await fetch('https://aur.archlinux.org/rpc/?v=5&type=search&by=name&arg=' + args.map(a => encodeURIComponent(a)).join('+'));
        let json = await results.json();
        if (!json) {
            await msg.channel.createMessage('<:icerror:435574504522121216>  |  API error! :(');
        } else {
            if (json.resultcount < 1) {
                await msg.channel.createMessage('<:icerror:435574504522121216>  |  No packages found.');
            } else {
                let basic = json.results[0];
                let extendedInfo = await fetch('https://aur.archlinux.org/rpc/?v=5&type=info&arg[]=' + basic.Name);
                let infoJson = await extendedInfo.json();
                let pkg = infoJson.results[0];
                await msg.channel.createMessage({
                    embed: {
                        title: pkg.Name,
                        url: 'https://aur.archlinux.org/packages/' + pkg.Name,
                        description: pkg.Description,
                        fields: [
                            {
                                name: 'Latest Version',
                                value: pkg.Version,
                                inline: true
                            },
                            {
                                name: 'Maintainer',
                                value: pkg.Maintainer,
                                inline: true
                            },
                            {
                                name: 'Votes',
                                value: pkg.NumVotes,
                                inline: true
                            },
                            {
                                name: 'Depends On',
                                value: pkg.Depends.join('\n'),
                                inline: true
                            }
                        ],
                        color: 0x1793D1,
                        thumbnail: { url: 'attachment://logo.png' }
                    }
                }, { file: this.logo, name: 'logo.png' });
            }
        }
    }
}