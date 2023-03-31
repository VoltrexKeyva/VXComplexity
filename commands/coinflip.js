export default {
  data: {
    name: 'coinflip',
    description: 'Flips a coin.',
    options: [
      {
        name: 'side',
        description: "The side of the coin you're aiming for.",
        required: true,
        choices: [
          {
            name: 'heads',
            value: 'heads'
          },
          {
            name: 'tails',
            value: 'tails'
          }
        ],
        type: 'STRING'
      }
    ]
  },
  usage: 'coinflip <heads|tails>',
  category: 'fun',
  async execute(interaction) {
    const side = interaction.options.getString('side');

    const index = Math.floor(Math.random() * 2);
    const m = await interaction.reply({
      content: 'Flipping a coin...',
      fetchReply: true
    });

    setTimeout(async () => {
      await m
        .edit({
          content:
            side === 'heads'
              ? index === 0
                ? 'Congrats, it was heads!'
                : 'Rip, it was tails.'
              : index === 1
              ? 'Congrats, it was tails!'
              : 'Rip, it was heads.'
        })
        .catch(() => null);
    }, 5000);
  }
};
