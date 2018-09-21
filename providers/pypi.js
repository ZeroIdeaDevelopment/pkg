const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Provider = require('../Provider');

module.exports = class extends Provider {
    constructor() {
        super();
        this.name = 'PyPI';
        this.logo = fs.readFileSync(path.resolve('./img/pypi.png'));
    }
    
    async execute(msg, args) {
        let results = await fetch('https://pypi.org/pypi/' + args[0] + '/json');
        let json = await results.json();
        if (!json.info) {
            await msg.channel.createMessage('<:icerror:435574504522121216>  |  No packages found.');
        } else {
            let pkg = json.info;
            await msg.channel.createMessage({
                embed: {
                    title: pkg.name,
                    url: pkg.package_url,
                    description: pkg.summary,
                    fields: [
                        {
                            name: 'Latest Version',
                            value: pkg.version,
                            inline: true
                        },
                        {
                            name: 'Author',
                            value: pkg.author,
                            inline: true
                        }
                    ],
                    color: 0xFFD242,
                    thumbnail: { url: 'attachment://logo.png' }
                }
            }, { file: this.logo, name: 'logo.png' });
        }
    }
}   
