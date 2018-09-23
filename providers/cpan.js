const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Provider = require('../Provider');

module.exports = class extends Provider {
    constructor() {
        super();
        this.name = 'metacpan';
        this.logo = fs.readFileSync(path.resolve('./img/cpan.png'));
    }

    async execute(msg, args) {
        let results = await fetch('https://fastapi.metacpan.org/module/_search?q=' + args.map(a => encodeURIComponent(a)).join('+'));
        let json = await results.json();
        if (!json) {
            await msg.channel.createMessage('<:icerror:435574504522121216>  |  API error! :(');
        } else {
            if (json.hits.total < 1) {
                await msg.channel.createMessage('<:icerror:435574504522121216>  |  No packages found.');
            } else {
                let pkg = json.hits.hits[0]._source;
                await msg.channel.createMessage({ content: 'CPAN is really broken at the moment, please don\'t trust the data here!',
                    embed: {
                        title: pkg.documentation,
                        url: 'https://metacpan.org/pod/' + pkg.documentation,
                        description: pkg.abstract,
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
                        color: 0xDB3737,
                        thumbnail: { url: 'attachment://logo.png' }
                    }
                }, { file: this.logo, name: 'logo.png' });
            }
        }
    }
}