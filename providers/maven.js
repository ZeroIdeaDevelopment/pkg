const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Provider = require('../Provider');

module.exports = class extends Provider {
    constructor() {
        super();
        this.name = 'Maven Central';
        this.logo = fs.readFileSync(path.resolve('./img/maven.png'));
    }

    async execute(msg, args) {
        let results = await fetch('https://search.maven.org/solrsearch/select?q=' + args.map(a => encodeURIComponent(a)).join('+') + '&wt=json');
        let json = await results.json();
        if (json.responseHeader.status !== 0) {
            await msg.channel.createMessage('<:icerror:435574504522121216>  |  API error! :(');
        } else {
            if (json.response.numFound < 1) {
                await msg.channel.createMessage('<:icerror:435574504522121216>  |  No packages found.');
            } else {
                let pkg = json.response.docs[0];
                await msg.channel.createMessage({
                    embed: {
                        title: pkg.a,
                        url: 'https://search.maven.org/artifact/' + pkg.g + '/' + pkg.a,
                        fields: [
                            {
                                name: 'Latest Version',
                                value: pkg.latestVersion,
                                inline: true
                            }
                        ],
                        color: 0x842777,
                        thumbnail: { url: 'attachment://logo.png' }
                    }
                }, { file: this.logo, name: 'logo.png' });
            }
        }
    }
}