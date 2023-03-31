import { MessageEmbed } from 'discord.js';
import { fillTextWithTwemoji } from 'node-canvas-with-twemoji-and-discord-emoji';
import moment from 'moment';

const {
  default: { createCanvas, loadImage }
} = await import('canvas');

async function wordWrap(
  ctx,
  text,
  fontSize = 5,
  fontColor = 'white',
  fontFamily = 'sans-serif',
  x,
  y
) {
  const maxWidth = ctx.canvas.width - 300;
  const lines = [];

  let result,
    width = 0,
    i,
    j;

  ctx.font = `${fontSize}px ${fontFamily}`;

  while (text.length) {
    i = text.length;

    while (ctx.measureText(text.slice(0, i)).width > maxWidth) i--;

    result = text.slice(0, i);

    if (i !== text.length) {
      j = 0;

      let r;

      while ((r = result.indexOf(' ', j)) !== -1) j = r + 1;
    }

    lines.push(text.slice(0, j || result.length));

    width = Math.max(width, ctx.measureText(lines[lines.length - 1]).width);
    text = text.substr(lines[lines.length - 1].length, text.length);
  }

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = fontColor;

  for (i = 0, j = lines.length; i < j; ++i)
    await fillTextWithTwemoji(
      ctx,
      lines[i],
      x,
      y + fontSize + (fontSize + 5) * i
    );

  return lines;
}

function discordText(string) {
  return typeof string === 'string'
    ? string.replace(/([TYV])([a-z])/g, `$1${String.fromCharCode(8202)}$2`)
    : '';
}

let verifiedBotTag;
let nonVerifiedBotTag;

export default {
  data: {
    name: 'fakequote',
    description: 'Fakequotes a user.',
    options: [
      {
        name: 'text',
        description: 'The text to be fake quoted.',
        required: true,
        type: 'STRING'
      },
      {
        name: 'user',
        description: 'The user to fake quote.',
        required: false,
        type: 'USER'
      }
    ]
  },
  category: 'fun',
  async execute(interaction) {
    await interaction.deferReply();

    const member = interaction.options.getMember('user') ?? interaction.member;
    const text = interaction.options.getString('text');

    const lines = await wordWrap(
      createCanvas(1500, 700).getContext('2d'),
      discordText(text),
      50,
      'white',
      'WhitneyBook',
      259,
      169
    );

    const botTag = member.user.bot
      ? member.user.flags?.has('VERIFIED_BOT')
        ? {
            type: 'verified',
            image:
              verifiedBotTag ??
              (verifiedBotTag = await loadImage(
                'https://cdn.discordapp.com/emojis/730717381445419028.png'
              ))
          }
        : {
            type: 'not verified',
            image:
              nonVerifiedBotTag ??
              (nonVerifiedBotTag = await loadImage(
                'https://cdn.discordapp.com/emojis/746023547465629796.png'
              ))
          }
      : null;

    const ctx = createCanvas(1500, 300 + 45 * (lines.length - 1)).getContext(
      '2d'
    );

    ctx.fillStyle = '#36393E';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    ctx.beginPath();
    ctx.arc(135, 150, 79, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      await loadImage(
        member.user.displayAvatarURL({
          size: 2048,
          format: 'png'
        })
      ),
      55,
      71,
      160,
      160
    );
    ctx.restore();
    ctx.font = '61px WhitneyMedium';
    ctx.fillStyle =
      member.displayHexColor === '#000000' ? '#ffffff' : member.displayHexColor;

    await fillTextWithTwemoji(ctx, discordText(member.displayName), 259, 139);

    const measuredName = ctx.measureText(discordText(member.displayName));

    if (botTag)
      if (botTag.type === 'verified')
        ctx.drawImage(botTag.image, 279 + measuredName.width, 95);
      else ctx.drawImage(botTag.image, 279 + measuredName.width, 91, 111, 50);

    ctx.font = '45px WhitneyMedium';
    ctx.fillStyle = '#7a7c80';
    ctx.fillText(
      discordText(`Today at ${moment.utc(Date.now()).format('hh:mm')}`),
      279 +
        measuredName.width +
        (botTag && botTag.type === 'verified'
          ? 150
          : botTag && botTag.type === 'not verified'
          ? 135
          : 0),
      135
    );

    await wordWrap(
      ctx,
      discordText(text),
      50,
      'white',
      'WhitneyBook',
      259,
      169
    );

    const embed = new MessageEmbed()
      .setColor(0x0033ff)
      .setTitle(`Fakequoted ${member.user.tag}`)
      .setImage('attachment://fakequote.png');

    await interaction.followUp({
      embeds: [embed],
      files: [
        {
          attachment: ctx.canvas.toBuffer(),
          name: 'fakequote.png'
        }
      ]
    });
  }
};
