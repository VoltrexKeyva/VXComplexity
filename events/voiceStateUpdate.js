export default {
  name: 'voiceStateUpdate',
  once: false,
  async execute(client, oldState, newState) {
    if (newState.member.id !== client.user.id) return;

    const queue = client.queue.get(newState.guild.id);

    if (
      oldState.channel !== null &&
      newState.channel === null &&
      queue !== undefined
    ) {
      queue.playing = false;
      queue.songs = [];
      await queue.connection.dispatcher.end();
      client.queue.delete(newState.guild.id);
    }
  }
};
