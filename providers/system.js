const Provider = require('../Provider')
const fs = require('fs')
let twl = fs.readFileSync('whitelist.txt')
const whitelist = twl.toString().split(' ')

module.exports = class extends Provider {
    constructor() {
        super();
        this.name = 'system commands'
        this.logo = null;
    }

    async execute(msg, args) {
        if (!whitelist.includes(msg.author.id)) {
            await msg.channel.createMessage('<:icerror:435574504522121216> | You are unauthorized to perform these actions.')
            return
        }
        let thing = args[0]
        if (thing === 'reboot') {
            await msg.channel.createMessage('<:iccheck:435574370107129867> | Now restarting.')
            process.exit(128)
        }
    }
}
