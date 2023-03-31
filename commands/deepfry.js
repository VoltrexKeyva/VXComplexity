import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

const {
  default: { alexflipnoteToken }
} = await import('../config.json', { assert: { type: 'json' } });

export default {
  data: {
    name: 'deepfry',
    description: "Deep fries a user's avatar.",
    options: [
      {
        name: 'user',
        description: 'The user to deep fry the avatar of.',
        required: false,
        type: 'USER'
      }
    ]
  },
  usage: 'deepfry [user|image|URL|unicode emoji|custom emoji]',
  category: 'fun',
  async execute(interaction) {
    const user = interaction.options.getUser('user') ?? interaction.user;
    const url = user.displayAvatarURL({
      size: 2048,
      format: 'png'
    });

    const deepFried = await fetch(
      `https://api.alexflipnote.dev/filter/deepfry?image=${url}`,
      {
        headers: {
          Authorization: alexflipnoteToken
        }
      }
    )
      .then((res) => res.buffer())
      .catch(() => null);

    if (!deepFried)
      return void (await interaction.reply({
        content: 'Seems like something went wrong, try again later.',
        ephemeral: true
      }));

    const embed = new MessageEmbed()
      .setColor('#0033ff')
      .setTitle(`Deep fried avatar of ${user.tag}`)
      .setImage('attachment://deepFried.png');

    await interaction.reply({
      embeds: [embed],
      files: [
        {
          attachment: deepFried,
          name: 'deepFried.png'
        }
      ]
    });
  }
};
