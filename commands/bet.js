const {
  default: {
    MessageEmbed,
    Util: { escapeMarkdown }
  }
} = await import('discord.js');

let coins;

export default {
  data: {
    name: 'bet',
    description: 'Gamble and win double the amount of the bet you placed.',
    options: [
      {
        name: 'amount',
        description: 'The amount of coins to bet.',
        required: true,
        type: 'INTEGER'
      }
    ]
  },
  usage: 'bet <coins>',
  category: 'economy',
  async execute(interaction, client) {
    const bet = interaction.options.getInteger('amount');

    if (bet <= 0)
      return void (await interaction.reply({
        content:
          "What are you trying to do? you can't bet zero or negative coins, dum dum.",
        ephemeral: true
      }));

    if (bet > 100000)
      return void (await interaction.reply({
        content:
          'Woah there, speedrunning to get bankrupt? place a bet lesser or equal to 100k coins.',
        ephemeral: true
      }));

    if (coins === undefined) coins = client.db.collection('coins');

    const balance =
      (
        await coins.findOne({
          'details.id': interaction.user.id
        })
      )?.details.coins ?? 0;

    if (bet > balance)
      return void (await interaction.reply({
        content: `Sorry ${escapeMarkdown(
          interaction.user.tag
        )}, you don't have that many coins, come back when you're a little, mmmmmm, richer!`,
        ephemeral: true
      }));

    const random = Math.random() > 0.5;

    await coins.findOneAndUpdate(
      {
        'details.id': interaction.user.id
      },
      {
        $inc: {
          'details.coins': random ? -bet : bet
        }
      }
    );

    const embed = new MessageEmbed()
      .setColor(random ? '#ff0000' : '#00ff00')
      .setTitle(random ? 'Lose' : 'Win')
      .setDescription(
        random
          ? `You gambled **${bet.toLocaleString()}** coins and lost, better luck next time!`
          : `You gambled **${bet.toLocaleString()}** coins and won **${(
              bet * 2
            ).toLocaleString()}** coins!`
      )
      .addField(
        'New balance',
        (random ? balance - bet : balance + bet).toLocaleString(),
        true
      );

    await interaction.reply({ embeds: [embed] });
  }
};
