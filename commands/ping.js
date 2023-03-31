import { MessageEmbed } from 'discord.js';

export default {
  data: {
    name: 'ping',
    description:
      'Checks the latency of the websocket, message and the database.'
  },
  usage: 'ping',
  category: 'general',
  async execute(interaction, client) {
    const interactionMessage = await interaction.reply({
      content: 'Pinging...',
      fetchReply: true
    });

    let time = Date.now();
    await client.db.collection('PingCall').findOne();
    time = Date.now() - time;

    const embed = new MessageEmbed()
      .setColor('#0033ff')
      .setTitle('🏓 Pong!')
      .addField(
        'Message',
        `\`${
          interactionMessage.createdTimestamp - interaction.createdTimestamp
        }\`ms`,
        true
      )
      .addField('Websocket', `\`${client.ws.ping}\`ms`, true)
      .addField('Database (MongoDB)', `\`${time}\`ms`, true);

    await interaction.editReply({
      content: null,
      embeds: [embed]
    });
  }
};
