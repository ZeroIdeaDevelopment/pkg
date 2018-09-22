const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Provider = require('../Provider');

module.exports = class extends Provider {
    constructor() {
        super();
        this.name = 'NuGet';
        this.logo = fs.readFileSync(path.resolve('./img/nuget.png'));
    }

    async execute(msg, args) {
        let results = await fetch('https://api-v2v3search-0.nuget.org/query?q=' + args.map(a => encodeURIComponent(a)).join('.'));
        let json = await results.json();
        if (json.totalHits < 1) {
            await msg.channel.createMessage('<:icerror:435574504522121216>  |  No packages found.');
        } else {
            let pkg = json.data[0];
            let authors = '';
            pkg.authors.forEach(author => {
                authors += author;
                authors += '\n';
            });
            await msg.channel.createMessage({
                embed: {
                    title: pkg.title,
                    url: 'https://nuget.org/packages/' + pkg.id + '/',
                    description: pkg.description,
                    fields: [
                        {
                            name: 'Latest Version',
                            value: pkg.version,
                            inline: true
                        },
                        {
                            name: 'Authors',
                            value: authors,
                            inline: true
                        },
                        {
                            name: 'Total Downloads',
                            value: pkg.totalDownloads,
                            inline: true
                        }
                    ],
                    color: 0x004681,
                    thumbnail: { url: 'attachment://logo.png' }
                }
            }, { file: this.logo, name: 'logo.png' });
        }
    }
}