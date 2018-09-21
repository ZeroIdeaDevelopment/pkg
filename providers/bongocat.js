const Provider = require('../Provider')

module.exports = class extends Provider {
    constructor() {
        super();
        this.name = 'Bongo Cat'
        this.logo = null;
    }

    execute(msg, args) {
        msg.channel.createMessage(`the bongo cat bongoes at ${args.join(' ')}`);
    }
}
