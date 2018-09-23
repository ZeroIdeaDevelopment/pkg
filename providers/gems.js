const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Provider = require('../Provider');

module.exports = class extends Provider {
    constructor() {
        super();
        this.name = 'Ruby Gems';
        this.logo = fs.readFileSync(path.resolve('./img/gems.png'));
    }

    async execute(msg, args) {
        let results = await fetch('https://rubygems.org/api/v1/search.json?query=' + args.map(a => encodeURIComponent(a)).join('+'));
        let json = await results.json();
        if (!json) {
            await msg.channel.createMessage('<:icerror:435574504522121216>  |  API error! :(');
        } else {
            if (json.length < 1) {
                await msg.channel.createMessage('<:icerror:435574504522121216>  |  No packages found.');
            } else {
                let pkg = json[0];
                await msg.channel.createMessage({
                    embed: {
                        title: pkg.name,
                        url: pkg.project_uri,
                        description: pkg.info,
                        fields: [
                            {
                                name: 'Latest Version',
                                value: pkg.version,
                                inline: true
                            },
                            {
                                name: 'Authors',
                                value: pkg.authors,
                                inline: true
                            },
                            {
                                name: 'Total Downloads',
                                value: pkg.downloads,
                                inline: true
                            }
                        ],
                        color: 0xD34231,
                        thumbnail: { url: 'attachment://logo.png' }
                    }
                }, { file: this.logo, name: 'logo.png' });
            }
        }
    }
}