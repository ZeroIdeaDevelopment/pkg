const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Provider = require('../Provider');

module.exports = class npm extends Provider {
    constructor() {
        super();
        this.name = 'npm';
        this.logo = fs.readFileSync(path.resolve('./img/npm.png'));
    }

    async execute(msg, args) {
        let results = await fetch('https://api.npms.io/v2/search?q=' + args.map(a => encodeURIComponent(a)).join('+'));
        let json = await results.json();
        if (json.code) {
            await msg.channel.createMessage('<:icerror:435574504522121216>  |  API error! :(');
        } else {
            if (json.total < 1) {
                await msg.channel.createMessage('<:icerror:435574504522121216>  |  No packages found.');
            } else {
                let pkg = json.results[0].package;
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
                        url: pkg.links.npm,
                        description: package.description,
                        fields: [
                            {
                                name: 'Latest Version',
                                value: pkg.version,
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
                }, { file: this.logo, name: 'logo.png' });
            }
        }
    }
}