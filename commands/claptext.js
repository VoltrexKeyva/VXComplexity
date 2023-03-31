export default {
  data: {
    name: 'claptext',
    description: '👏 Claps 👏 Text 👏',
    options: [
      {
        name: 'text',
        description: 'Text to clapify.',
        required: true,
        type: 'STRING'
      }
    ]
  },
  usage: 'claptext <text>',
  category: 'fun',
  async execute(interaction) {
    const text = interaction.options.getString('text');

    await interaction.reply({
      content: `${text.replaceAll(' ', ' 👏 ')} 👏`.slice(0, 2000),
      allowedMentions: { parse: [] }
    });
  }
};
