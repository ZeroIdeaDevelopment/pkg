const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Provider = require('../Provider');

module.exports = class extends Provider {
    constructor() {
        super();
        this.name = 'npm';
        this.logo = fs.readFileSync(path.resolve('./img/npm.png'));
    }

    async execute(msg, args) {
        let results = await fetch('https://www.npmjs.com/search/suggestions?q=' + args.map(a => encodeURIComponent(a)).join('+'));
        let json = await results.json();
        if (json.code) {
            await msg.channel.createMessage('<:icerror:435574504522121216>  |  API error! :(');
        } else {
            if (json.length < 1) {
                await msg.channel.createMessage('<:icerror:435574504522121216>  |  No packages found.');
            } else {
                let pkg = json[0];
                let maintainers = '';
                pkg.maintainers.some(maintainer => {
                    let maintainersTmp = '';
                    maintainersTmp += maintainer.username;
                    maintainersTmp += ' (';
                    maintainersTmp += maintainer.email;
                    maintainersTmp += ')';
                    maintainersTmp += '\n';
                    if ((maintainers + maintainersTmp).length > 1024) {
                        maintainers += '...';
                        return true; // break
                    }
                    maintainers += maintainersTmp;
                    return false;
                });
                await msg.channel.createMessage({
                    embed: {
                        title: pkg.name,
                        url: pkg.links.npm,
                        description: pkg.description,
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
                        color: 0xCB0000,
                        thumbnail: { url: 'attachment://logo.png' }
                    }
                }, { file: this.logo, name: 'logo.png' });
            }
        }
    }
}
