async function postStats(client) {
  await client.tools.topgg
    .postStats({
      serverCount: client.guilds.cache.size,
      shardCount: client.options.shardCount
    })
    .then(() => console.log('[@top-gg/sdk] Stats posted!'))
    .catch((err) =>
      console.error(
        `[@top-gg/sdk] An error occured while trying to post stats: ${err}`
      )
    );
}

async function updateSupportServerStats(client) {
  await client.channels.cache
    .get('746815605717598428')
    .setName(`Total servers: ${client.guilds.cache.size.toLocaleString()}`)
    .catch(() => null);

  await client.channels.cache
    .get('746815699250577531')
    .setName(
      `Total users: ${client.guilds.cache
        .filter((g) => g.available)
        .reduce((T, g) => T + g.memberCount, 0)
        .toLocaleString()}`
    )
    .catch(() => null);
}

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    await client.application.commands.set(client.commands.map((c) => c.data));

    await client.db.connect((err) => {
      if (err)
        return console.error(
          `Failed to connect to the MongoDB cluster due to an error: ${err}`
        );

      client.db = client.db.db('bot');

      console.log('Connected to the MongoDB cluster!');
    });

    await postStats(client);

    setInterval(() => postStats(client), 1_800_000);

    await updateSupportServerStats(client);

    setInterval(() => updateSupportServerStats(client), 900_000);

    client.user.setActivity('/ commands :^)', {
      type: 'LISTENING'
    });

    const guildCount = client.guilds.cache.size;
    const userCount = client.guilds.cache
      .filter((g) => g.available)
      .reduce((all, g) => all + g.memberCount, 0);

    console.log(
      `[${this.name}] ${
        client.user.tag
      } is ready with ${guildCount.toLocaleString()} server${
        guildCount === 1 ? '' : 's'
      } and ${userCount.toLocaleString()} user${userCount === 1 ? '' : 's'}`
    );
  }
};
