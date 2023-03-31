let coins;

export default {
  data: {
    name: 'daily',
    description: 'Gives you a specified amount of coins everyday on usage'
  },
  usage: 'daily',
  category: 'economy',
  cooldown: 86400000,
  async execute(interaction, client) {
    if (!coins) coins = client.db.collection('coins');

    const balance = await coins.findOne({
      'details.id': interaction.user.id
    });

    if (!balance)
      await coins.insertOne({
        details: {
          id: interaction.user.id,
          coins: 3000
        }
      });
    else
      await coins.findOneAndUpdate(
        {
          'details.id': interaction.user.id
        },
        {
          $inc: {
            'details.coins': 3000
          }
        }
      );

    await interaction.reply('💰 3,000 coins has been added to your balance.');
  }
};
