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
        let results = await fetch('https://api.npms.io/v2/search?q=' + args.map(a => encodeURIComponent(a)).join('+'));
        let json = await results.json();
        if (!json) {
            await msg.channel.createMessage('<:icerror:435574504522121216>  |  API error! :(');
        } else {
            if (json.total < 1) {
                await msg.channel.createMessage('<:icerror:435574504522121216>  |  No packages found.');
            } else {
                let pkg = json.crates[0];
                let maintainers = '';
                pkg.maintainers.forEach(maintainer => {
                    maintainers += maintainer.username;
                    maintainers += ' (';
                    maintainers += maintainer.email;
                    maintainers += ')';
                    maintainers += '\n';
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
                                name: 'Maintainers',
                                value: maintainers,
                                inline: true
                            },
                            {
                                name: 'Total Downloads',
                                value: pkg.downloads
                            }
                        ],
                        color: 0xCB0000,
                        thumbnail: { url: 'attachment://logo.png' }
                    }
                }, { file: this.logo, name: 'logo.png' });
            }
        }
    }
}