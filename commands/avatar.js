import { MessageEmbed } from 'discord.js';

const sizes = [128, 256, 512, 1024, 2048, 4096];

export default {
  data: {
    name: 'avatar',
    description: 'Shows the avatar of a user.',
    options: [
      {
        name: 'user',
        description: 'The user to show the avatar of.',
        required: false,
        type: 'USER'
      }
    ]
  },
  usage: 'avatar [user]',
  category: 'general',
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') ?? interaction.user;
    const extensions = ['png', 'jpeg', 'jpg', 'webp'];

    if (user.avatar?.startsWith('a_')) extensions.unshift('gif');

    await client.tools.paginate(interaction, {
      type: 'embed',
      messages: extensions.map((extension) =>
        new MessageEmbed()
          .setColor('#0033ff')
          .setTitle(`${user.tag}'s avatar`)
          .addField(
            extension.toUpperCase(),
            sizes
              .map(
                (size) =>
                  `[${size}x](${user.displayAvatarURL({
                    dynamic: extension === 'gif',
                    size: size,
                    format: extension
                  })})`
              )
              .join(' | ')
          )
          .setImage(
            user.displayAvatarURL({
              dynamic: extension === 'gif',
              size: 2048,
              format: extension
            })
          )
      ),
      time: 60000
    });
  }
};
