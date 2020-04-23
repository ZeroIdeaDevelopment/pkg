const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Provider = require('../Provider');

module.exports = class extends Provider {
    constructor() {
        super();
        this.name = 'Pub';
        this.logo = fs.readFileSync(path.resolve('./img/pub.png'));
    }
    
    async execute(msg, args) {
        let json;
        try {
            let results = await fetch('https://pub.dev/api/packages/' + args.map(a => encodeURIComponent(a)).join('+'));
            json = await results.json();
        } catch (e) {
            await msg.channel.createMessage('<:icerror:435574504522121216>  |  No packages found.');
            return;
        }
        let pkg = json;
        let author = 'Unknown';
        
        if (pkg.latest.pubspec.author) {
            author = pkg.latest.pubspec.author
        } else if (pkg.latest.pubspec.authors) {
            author = '';
            pkg.latest.pubspec.authors.forEach(author1 => {
                author += author1;
                author += '\n';
            });
        }
        
        await msg.channel.createMessage({
            embed: {
                title: pkg.name,
                url: 'https://pub.dev/packages/' + pkg.name,
                description: pkg.latest.pubspec.description,
                fields: [
                    {
                        name: 'Latest Version',
                        value: pkg.latest.version,
                        inline: true
                    },
                    {
                        name: 'Author',
                        value: author,
                        inline: true
                    }
                ],
                color: 0x3479AF,
                thumbnail: { url: 'attachment://logo.png' }
            }
        }, { file: this.logo, name: 'logo.png' });
    }
}   
