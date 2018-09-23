const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Provider = require('../Provider');

module.exports = class extends Provider {
    constructor() {
        super();
        this.name = 'Hackage'
        this.logo = fs.readFileSync(path.resolve('./img/hackage.png'));
    }

    async execute(msg, args) {
        let search = await fetch('https://hackage.haskell.org/packages/search?terms=' + args.map(a => encodeURIComponent(a)).join('+'), {
            headers: {
                'Accept': 'application/json'
            }
        });
        let json = await search.json();
        if (json.length < 1) {
            await msg.channel.createMessage('<:icerror:435574504522121216>  |  No packages found.');
        } else {
            let pkgToFind = json[0].name;
            let maintainerResults = await fetch('https://hackage.haskell.org/package/' + pkgToFind + '/maintainers', {
                headers: {
                    'Accept': 'application/json'
                }
            });
            let jsonMaintainers = await maintainerResults.json();
            let maintainers = '';
            jsonMaintainers.members.forEach(maintainer => {
                maintainers += maintainer.username;
                maintainers += '\n';
            });
            let versionResults = await fetch('https://hackage.haskell.org/package/' + pkgToFind + '/preferred', {
                headers: {
                    'Accept': 'application/json'
                }
            });
            let jsonVersions = await versionResults.json();
            let latestVersion = jsonVersions['normal-version'][0];
            let cabalResults = await fetch('https://hackage.haskell.org/package/' + pkgToFind + '-' + latestVersion + '/' + pkgToFind + '.cabal');
            let cabal = await cabalResults.text();
            let raw = cabal.split('\n');
            let description = '';
            raw.forEach(str => {
                if (str.toLowerCase().startsWith('synopsis:')) {
                    str = str.substring(9);
                    str = str.trim();
                    description = str;
                }
            });
            await msg.channel.createMessage({
                embed: {
                    title: pkgToFind,
                    url: 'https://hackage.haskell.org/package/' + pkgToFind,
                    description,
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
                        }
                    ],
                    color: 0x999999,
                    thumbnail: { url: 'attachment://logo.png' }
                }
            }, { file: this.logo, name: 'logo.png' });
        }
    }
}
