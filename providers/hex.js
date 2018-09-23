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
        let results = await fetch('https://hex.pm/api/packages/' + args.map(a => encodeURIComponent(a)).join('+'));
        let json = await results.json();
        if (!json) {
            await msg.channel.createMessage('<:icerror:435574504522121216>  |  API error! :(');
        } else {
            if (json.status === 404) {
                await msg.channel.createMessage('<:icerror:435574504522121216>  |  No packages found.');
            } else {
                let pkg = json;
                let maintainers = '';
                let owners = '';
                pkg.meta.maintainers.forEach(maintainer => {
                    maintainers += maintainer;
                    maintainers += '\n';
                });
                if (maintainers === '') maintainers = 'No maintainers.'; 
                pkg.owners.forEach(owner => {
                    owners += owner.username;
                    owners += ' (';
                    owners += owner.email
                    owners += ')\n';
                });
                await msg.channel.createMessage({
                    embed: {
                        title: pkg.name,
                        url: pkg.html_url,
                        description: pkg.meta.description,
                        fields: [
                            {
                                name: 'Latest Version',
                                value: pkg.releases[0].version,
                                inline: true
                            },
                            {
                                name: 'Owners',
                                value: owners,
                                inline: true
                            },
                            {
                                name: 'Maintainers',
                                value: maintainers,
                                inline: true
                            },
                            {
                                name: 'Total Downloads',
                                value: pkg.downloads.all,
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