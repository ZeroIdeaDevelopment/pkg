const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Provider = require('../Provider');

module.exports = class extends Provider {
    constructor() {
        super();
        this.name = 'crates';
        this.logo = fs.readFileSync(path.resolve('./img/crates.png'));
    }

    async execute(msg, args) {
        let results = await fetch('https://crates.io/api/v1/crates?q=' + args.map(a => encodeURIComponent(a)).join('+'));
        let json = await results.json();
        if (!json) {
            await msg.channel.createMessage('<:icerror:435574504522121216>  |  API error! :(');
        } else {
            if (json.total < 1) {
                await msg.channel.createMessage('<:icerror:435574504522121216>  |  No packages found.');
            } else {
                let pkg = json.crates[0];
                let ownersRaw = await fetch('https://crates.io' + pkg.links.owners);
                let ownersData = await ownersRaw.json();
                let owners = '';
                ownersData.users.forEach(user => {
                    owners += '[';
                    owners += user.name;
                    owners += '](';
                    owners += user.url;
                    owners += ')';
                });
                await msg.channel.createMessage({
                    embed: {
                        title: pkg.name,
                        url: 'https://crates.io/crates/' + pkg.name,
                        description: pkg.description,
                        fields: [
                            {
                                name: 'Latest Version',
                                value: pkg.max_version,
                                inline: true
                            },
                            {
                                name: 'Owners',
                                value: owners,
                                inline: true
                            },
                            {
                                name: 'Total Downloads',
                                value: pkg.downloads
                            }
                        ],
                        color: 0xE7AB39,
                        thumbnail: { url: 'attachment://logo.png' }
                    }
                }, { file: this.logo, name: 'logo.png' });
            }
        }
    }
}