const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Provider = require('../Provider');

module.exports = class extends Provider {
    constructor() {
        super();
        this.name = 'Packagist';
        this.logo = fs.readFileSync(path.resolve('./img/packagist.png'));
    }

    async execute(msg, args) {
        let results = await fetch('https://packagist.org/search.json?q=' + args.map(a => encodeURIComponent(a)).join('+'));
        let json = await results.json();
        if (!json) {
            await msg.channel.createMessage('<:icerror:435574504522121216>  |  API error! :(');
        } else {
            if (json.total < 1) {
                await msg.channel.createMessage('<:icerror:435574504522121216>  |  No packages found.');
            } else {
                let pkgResults = await fetch('https://packagist.org/packages/' + json.results[0].name + '.json');
                let pkgData = await pkgResults.json();
                let pkg = pkgData.package;
                let maintainers = '';
                pkg.maintainers.forEach(maintainer => {
                    maintainers += maintainer.name;
                    maintainers += '\n';
                });
                let versions = Object.keys(pkg.versions);
                let latestVersion = versions[1] || versions[0]; // versions is an array of versions, 0 is always dev-master and 1 is the latest, but if 1 isn't set fall back to dev-master
                await msg.channel.createMessage({ content: 'Latest version may be wrong. Please check Packagist first.',
                    embed: {
                        title: pkg.name,
                        url: 'https://packagist.org/packages/' + pkg.name,
                        description: pkg.description,
                        fields: [
                            {
                                name: 'Latest Version',
                                value: latestVersion,
                                inline: true
                            },
                            {
                                name: 'Maintainers',
                                value: maintainers,
                                inline: true
                            },
                            {
                                name: 'Total Downloads',
                                value: pkg.downloads.total,
                                inline: true
                            }
                        ],
                        color: 0xD9E0F3,
                        thumbnail: { url: 'attachment://logo.png' }
                    }
                }, { file: this.logo, name: 'logo.png' });
            }
        }
    }
}