import { MessageEmbed } from 'discord.js';

const {
  default: { createCanvas, loadImage }
} = await import('canvas');

let gayFlagImage;

export default {
  data: {
    name: 'gay',
    description: 'Applies the gay flag overlay on an image.',
    options: [
      {
        name: 'user',
        description: 'The user to apply the overlay on their avatar.',
        required: false,
        type: 'USER'
      }
    ]
  },
  category: 'fun',
  async execute(interaction) {
    const user = interaction.options.getUser('user') ?? interaction.user;

    const image = await loadImage(
      user.displayAvatarURL({
        size: 2048,
        format: 'png'
      })
    );

    const ctx = createCanvas(image.width, image.height).getContext('2d');

    ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalAlpha = 0.5;
    ctx.drawImage(
      (gayFlagImage ??= await loadImage(
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Gay_Pride_Flag.svg/640px-Gay_Pride_Flag.svg.png'
      )),
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    );

    const embed = new MessageEmbed()
      .setColor(0x0033ff)
      .setTitle(`Gay avatar of ${user.tag}`)
      .setImage('attachment://gay.png');

    await interaction.reply({
      embeds: [embed],
      files: [
        {
          attachment: ctx.canvas.toBuffer(),
          name: 'gay.png'
        }
      ]
    });
  }
};
