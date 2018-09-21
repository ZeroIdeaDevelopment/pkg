const Provider = require('../Provider')

module.exports = class extends Provider {
    constructor() {
        super();
        this.name = 'the almighty bongo cat'
        this.logo = null;
    }

    execute(msg, args) {
        msg.channel.createMessage('<a:bongocat:492818212187144214>');
    }
}
