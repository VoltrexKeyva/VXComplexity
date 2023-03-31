import { MessageEmbed } from 'discord.js';
import { eightBallAnswers } from '../constants.js';

export default {
  data: {
    name: '8ball',
    description: '8ball awaits for your question, ask away!',
    options: [
      {
        name: 'question',
        description: 'The question to ask.',
        required: true,
        type: 'STRING'
      }
    ]
  },
  usage: '8ball <question>',
  category: 'fun',
  async execute(interaction) {
    const question = interaction.options.getString('question');

    const embed = new MessageEmbed()
      .setColor('#0033ff')
      .setTitle(this.data.name)
      .addField(
        'Question',
        question.length > 1024 ? `${question.slice(0, 1021)}...` : question,
        false
      )
      .addField(
        "🎱 8ball's answer",
        eightBallAnswers[Math.floor(Math.random() * eightBallAnswers.length)],
        false
      );

    await interaction.reply({
      embeds: [embed]
    });
  }
};
