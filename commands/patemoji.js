import GifEncoder from 'gifencoder';
import { readdirSync } from 'node:fs';

const {
  default: {
    Util: { escapeMarkdown }
  }
} = await import('discord.js');
const {
  default: { createCanvas, loadImage }
} = await import('canvas');

const allFrames = await Promise.all(
  readdirSync('./')
    .filter((file) => file.startsWith('patEmojiHand'))
    .map((file) => loadImage(`./${file}`))
);
const framesLen = allFrames.length;
const width = 150;
const height = 150;

export default {
  data: {
    name: 'patemoji',
    description: "Pet pets a user's avatar.",
    options: [
      {
        name: 'user',
        description: 'The user to pet pet.',
        required: false,
        type: 'USER'
      }
    ]
  },
  category: 'fun',
  async execute(interaction) {
    await interaction.deferReply();

    const user = interaction.options.getUser('user') ?? interaction.user;
    const image = await loadImage(
      user.displayAvatarURL({
        size: 2048,
        format: 'png'
      })
    );
    const gifEncoder = new GifEncoder(width, height);

    gifEncoder.transparent = '#000000';
    gifEncoder.start();
    gifEncoder.setRepeat(0);
    gifEncoder.setDelay(15);
    gifEncoder.setQuality(10);

    const ctx = createCanvas(width, height).getContext('2d');

    let squishWidth = 0,
      squishHeight = 0,
      squishOffset = 0;

    for (let i = 0; i < framesLen; i++) {
      ctx.drawImage(
        image,
        25 + squishOffset,
        37.5 + squishHeight,
        107.5 + squishWidth,
        107.5 - squishHeight
      );
      ctx.drawImage(allFrames[i], 0, 7.5, 125, 125);

      gifEncoder.addFrame(ctx);

      ctx.clearRect(0, 0, width, height);

      const isHigher = i > 5;

      squishWidth += isHigher ? -4.75 : 4.75;
      squishHeight += isHigher ? -1.75 : 1.75;
      squishOffset += isHigher ? 2.25 : -2.25;
    }

    gifEncoder.finish();

    await interaction.followUp({
      content: `Pet pet of ${escapeMarkdown(user.tag)}'s avatar`,
      files: [
        {
          attachment: gifEncoder.out.getData(),
          name: 'patemoji.gif'
        }
      ]
    });
  }
};
