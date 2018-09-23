const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Provider = require('../Provider');

module.exports = class extends Provider {
    constructor() {
        super();
        this.name = 'JCenter';
        this.logo = fs.readFileSync(path.resolve('./img/jcenter.png'));
    }

    async execute(msg, args) {
        let results = await fetch('https://bintray.com/api/v1/search/packages/maven?a=*' + args.map(a => encodeURIComponent(a)).join('+') + '*&repo=jcenter');
        let json = await results.json();
        if (!json) {
            await msg.channel.createMessage('<:icerror:435574504522121216>  |  API error! :(');
        } else {
            if (json.length < 1) {
                await msg.channel.createMessage('<:icerror:435574504522121216>  |  No packages found. (This is very broken!)');
            } else {
                let pkg = json[0];
                await msg.channel.createMessage({ content: 'Apparently this is very broken, don\'t use kthx.',
                    embed: {
                        title: pkg.name,
                        description: pkg.description,
                        fields: [
                            {
                                name: 'Latest Version',
                                value: pkg.latest_version,
                                inline: true
                            },
                            {
                                name: 'Owner',
                                value: pkg.owner,
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