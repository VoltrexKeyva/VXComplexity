import { MessageEmbed } from 'discord.js';
import { fillTextWithTwemoji } from 'node-canvas-with-twemoji-and-discord-emoji';

const {
  default: { createCanvas, loadImage }
} = await import('canvas');

let image;

export default {
  data: {
    name: 'didyoumean',
    description: 'The google "Did you mean" section replacement.',
    options: [
      {
        name: 'top',
        description: 'The text in the search bar.',
        required: true,
        type: 'STRING'
      },
      {
        name: 'bottom',
        description: 'The text in the "Did you mean" field.',
        required: true,
        type: 'STRING'
      }
    ]
  },
  usage: 'didyoumean <text 1> | <text 2>',
  category: 'fun',
  async execute(interaction) {
    const top = interaction.options.getString('top');
    const bottom = interaction.options.getString('bottom');

    if (!image)
      image = await loadImage(
        'https://cdn.discordapp.com/attachments/702754293387886602/792190881792262144/PicsArt_12-26-04.13.06.jpg'
      );

    const ctx = createCanvas(image.width, image.height).getContext('2d');

    ctx.drawImage(image, 0, 0);
    ctx.font = '25px NotoSans';
    await fillTextWithTwemoji(
      ctx,
      `${top.slice(0, 66)}${top.length > 66 ? '...' : ''}`,
      300,
      87
    );
    ctx.fillStyle = 'blue';
    ctx.font = 'italic bold 31px NotoSans';
    await fillTextWithTwemoji(
      ctx,
      `${bottom.slice(0, 54)}${bottom.length > 54 ? '...' : ''}`,
      489,
      333
    );

    const embed = new MessageEmbed()
      .setColor('#0033ff')
      .setImage('attachment://didYouMean.png');

    await interaction.reply({
      embeds: [embed],
      files: [
        {
          attachment: ctx.canvas.toBuffer(),
          name: 'didYouMean.png'
        }
      ]
    });
  }
};
