module.exports = class Provider {
    constructor() {
        this.name = 'Provider Template'
        this.logo = null;
    }

    execute(msg, args) {
        msg.channel.createMessage('<:icerror:435574504522121216>  |  This isn\'t the provider you\'re looking for.');
    }
}