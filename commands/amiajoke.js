import { MessageEmbed } from 'discord.js';

const {
  default: { createCanvas, loadImage }
} = await import('canvas');

const doublePi = 2 * Math.PI;
let image;

export default {
  data: {
    name: 'amiajoke',
    description:
      "Shows the 'am i a joke?' meme with the given image being the guy's face.",
    options: [
      {
        name: 'user',
        description: 'Is this user a joke?',
        required: false,
        type: 'USER'
      }
    ]
  },
  usage: 'amiajoke [user]',
  aliases: [],
  category: 'fun',
  async execute(interaction) {
    const user = interaction.options.getUser('user') ?? interaction.user;
    const ctx = createCanvas(700, 329).getContext('2d');

    ctx.drawImage(
      (image ??= await loadImage(
        'https://wompampsupport.azureedge.net/fetchimage?siteId=7575&v=2&jpgQuality=100&width=700&url=https%3A%2F%2Fi.kym-cdn.com%2Fentries%2Ficons%2Ffacebook%2F000%2F027%2F424%2Fjoke.jpg'
      )),
      0,
      0,
      700,
      329
    );

    ctx.save();
    ctx.beginPath();
    ctx.arc(437, 129, 128, 0, doublePi);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      await loadImage(
        user.displayAvatarURL({
          size: 2048,
          format: 'png'
        })
      ),
      309,
      2,
      255,
      255
    );
    ctx.restore();
    ctx.font = '30px bold Menlo';
    ctx.fillStyle = 'white';
    ctx.fillText('Am i a joke to you?', 257, 315, 198, 198);

    const embed = new MessageEmbed()
      .setColor('#0033ff')
      .setTitle(`Is ${user.tag} a joke to you?`)
      .setImage('attachment://amIAJoke.png');

    await interaction.reply({
      embeds: [embed],
      files: [
        {
          attachment: ctx.canvas.toBuffer(),
          name: 'amIAJoke.png'
        }
      ]
    });
  }
};
