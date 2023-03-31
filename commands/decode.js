import { MessageEmbed } from 'discord.js';

const {
  default: { toChunks }
} = await import('string-toolkit');

export default {
  data: {
    name: 'decode',
    description: 'Decode base64 or binary to text.',
    options: [
      {
        name: 'type',
        description: 'The type of input to decode.',
        required: true,
        choices: [
          {
            name: 'base64',
            value: 'base64'
          },
          {
            name: 'binary',
            value: 'binary'
          }
        ],
        type: 'STRING'
      },
      {
        name: 'input',
        description: 'The input to decode.',
        required: true,
        type: 'STRING'
      }
    ]
  },
  usage: 'decode <base64 or binary> <--base64|--binary>',
  category: 'fun',
  async execute(interaction, client) {
    const type = interaction.options.getString('type');
    const input = interaction.options.getString('input');

    const title = `${client.tools.toProperCase(type)} to text`;

    await client.tools.paginate(interaction, {
      type: 'embed',
      messages: toChunks(
        type === 'base64'
          ? Buffer.from(input, 'base64').toString('ascii')
          : toChunks(input, 8)
              .map((T) => String.fromCharCode(parseInt(T, 2)))
              .join(''),
        1500
      ).map((chunk) =>
        new MessageEmbed()
          .setColor('#0033ff')
          .setTitle(title)
          .setDescription(chunk)
      ),
      time: 180000
    });
  }
};
