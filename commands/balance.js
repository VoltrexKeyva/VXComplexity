import { MessageEmbed } from 'discord.js';

let coins;

export default {
  data: {
    name: 'balance',
    description: 'Shows the amount of coins a user has.',
    options: [
      {
        name: 'user',
        description: 'The balance of the user to show.',
        required: false,
        type: 'USER'
      }
    ]
  },
  usage: 'balance [user]',
  category: 'economy',
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') ?? interaction.user;

    if (user.bot)
      return void (await interaction.reply('Why would a bot have coins?'));

    if (coins === undefined) coins = client.db.collection('coins');

    const balance =
      (
        await coins.findOne({
          'details.id': user.id
        })
      )?.details.coins ?? 0;

    const embed = new MessageEmbed()
      .setColor('#0033ff')
      .setAuthor(
        `${user.tag}'s coins`,
        user.displayAvatarURL({
          dynamic: true,
          size: 1024,
          format: 'png'
        })
      )
      .setDescription(`**${balance.toLocaleString()}** coins`);

    await interaction.reply({
      embeds: [embed]
    });
  }
};
