import { MessageEmbed } from 'discord.js';

const {
  default: { getAsync }
} = await import('animality');

export default {
  data: {
    name: 'cat',
    description: 'Shows a random cat image/gif.'
  },
  usage: 'cat',
  category: 'fun',
  async execute(interaction) {
    await interaction.deferReply();

    const cat = await getAsync('cat')
      .then((obj) => obj.image)
      .catch(() => null);

    if (cat === null)
      return void (await interaction.followUp({
        content:
          "The random cat API doesn't seem to be working currently, try again later.",
        ephemeral: true
      }));

    const embed = new MessageEmbed()
      .setColor('#0033ff')
      .setTitle('Random Cat')
      .setImage(cat);

    await interaction.followUp({ embeds: [embed] });
  }
};
