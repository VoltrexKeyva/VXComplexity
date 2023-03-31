import moment from 'moment';
import getImageColors from 'get-image-colors';
import fetch from 'node-fetch';

const {
  default: {
    Util: { escapeMarkdown }
  }
} = await import('discord.js');
const {
  default: { createCanvas, loadImage }
} = await import('canvas');
const {
  default: { shorten }
} = await import('string-toolkit');

const formatter = new Intl.ListFormat('en');

function changeColor(image, hex) {
  const ctx = createCanvas(image.width, image.height).getContext('2d');

  ctx.drawImage(image, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  return loadImage(ctx.canvas.toBuffer());
}

function normalize(text) {
  return text.replace(/([VTY])([a-z])/g, `$1${String.fromCharCode(8203)}$2`);
}

let spotifyLogo;

export default {
  data: {
    name: 'spotify',
    description: 'Shows Spotify activity card of a user.',
    options: [
      {
        name: 'user',
        description: 'The user to show the Spotify activity card of.',
        required: false,
        type: 'USER'
      }
    ]
  },
  category: 'general',
  async execute(interaction) {
    let member = interaction.options.getMember('user') ?? interaction.member;

    if (!member.presence) member = await member.fetch();

    const activity = member.presence?.activities.find(
      (a) => a.type === 'LISTENING'
    );

    if (!activity || activity.name !== 'Spotify')
      return void (await interaction.reply({
        content:
          member.user.id === interaction.user.id
            ? "You don't have a Spotify activity."
            : `${member.user.tag} doesn't have a Spotify activity.`,
        ephemeral: true
      }));

    await interaction.deferReply();

    const {
      timestamps: { start, end },
      assets,
      details,
      state
    } = activity;

    const coverArtBuffer = await fetch(
      assets.largeImageURL({
        size: 2048,
        format: 'jpg'
      }) ??
        member.user.displayAvatarURL({
          size: 2048,
          format: 'jpg'
        })
    ).then((res) => res.buffer());
    const coverArt = await loadImage(coverArtBuffer);

    const ctx = createCanvas(1000, 500).getContext('2d');

    const [dominantColor, detailColor] = (
      await getImageColors(coverArtBuffer, 'image/jpg')
    )
      .slice(0, 2)
      .map((color) => color.hex());

    ctx.fillStyle = dominantColor;
    ctx.roundRect(0, 0, ctx.canvas.width, ctx.canvas.height, 50).fill();
    ctx.drawImage(
      await changeColor(
        spotifyLogo ??
          (spotifyLogo = await loadImage(
            'https://cdn.discordapp.com/attachments/702754293387886602/726905918717034566/1200px-Spotify_logo_without_text.svg.png'
          )),
        detailColor
      ),
      60,
      45,
      50,
      50
    );
    ctx.font = '30px WhitneyBold';
    ctx.fillStyle = detailColor;
    ctx.fillText(
      `Spotify • ${shorten(normalize(assets.largeText), 50)}`,
      125,
      80
    );
    ctx.strokeStyle = 'black';
    ctx.roundRect(60, 136, 175, 175, 50).stroke();
    ctx.save();
    ctx.clip();
    ctx.drawImage(coverArt, 60, 134, 178, 178);
    ctx.restore();
    ctx.font = '47px WhitneyBold';
    ctx.fillText(shorten(normalize(details), 34), 267, 210);
    ctx.font = '43px WhitneyLight';
    ctx.fillText(
      formatter.format(shorten(normalize(state), 33).split('; ')),
      267,
      275
    );
    const elap = Date.now() - start;
    const total = end - start;
    const cal = (elap / total) * 883;
    const filler = cal > 883 ? 883 : cal;
    const allTotal = moment
      .utc(Date.now() - start + new Date(end).getTime() - Date.now())
      .format('mm:ss');
    ctx.font = '23px WhitneyLight';
    ctx.fillText(
      cal > 883 ? allTotal : moment.utc(Date.now() - start).format('mm:ss'),
      60,
      460
    );
    ctx.fillText(allTotal, 885, 460);
    ctx.strokeStyle = ctx.fillStyle;
    ctx.roundRect(60, 400, 883, 15, 70).stroke();
    ctx.save();
    ctx.clip();
    ctx.fillRect(60, 400, filler, 50);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(filler + 45, 407, 25, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    await interaction.followUp({
      content: `${escapeMarkdown(member.user.tag)}'s Spotify activity card`,
      files: [
        {
          attachment: ctx.canvas.toBuffer(),
          name: 'spotify.png'
        }
      ]
    });
  }
};
