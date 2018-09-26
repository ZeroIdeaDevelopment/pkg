# pkg
The package search bot for Discord.

![img](https://pantsu.review/895077.png)
# self-hosting
**Please, for the love of god, if you're going to self-host this, do NOT try and put it on any public bot lists.**

First off, `git clone` the repository.

Second, create a `config.json` file with the following contents:

```js
{
  "token": "BOT TOKEN" // bot token
}
```

That basic config will get the bot up and running with the default prefix and shortcuts enabled. If you want more control, we provide it.

```js
{
  "token": "BOT TOKEN", // bot token
  "prefixes": ["mycustomprefix ", "owo ", "whats ", "this "], // custom prefixes
  "disableShortcuts": true // disable shortcuts?
}
```

Third, run it. We use [`pm2`](https://github.com/Unitech/pm2) in production, and we know it works with pkg. Just run `npm i -g pm2` and you're ready to start the bot. Run the command `pm2 start index.js --name=pkg` (`--name` names the process in `pm2 list`) and you're ready. If you try and run the bot without `config.json` present, it will crash.

We recommend that you don't just host vanilla pkg and that you add more providers. If you want your providers in the main bot, make a PR!

**Again, do not list the bot on any public bot lists. They will know it's a clone.**
