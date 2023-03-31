import { MessageEmbed } from 'discord.js';

const {
  default: { toChunks }
} = await import('string-toolkit');

const allRegex = /[\s\S]/g;

export default {
  data: {
    name: 'encode',
    description: 'Encode given input to base64 or binary.',
    options: [
      {
        name: 'type',
        description: 'The type to encode the input to.',
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
        description: 'The input to encode.',
        required: true,
        type: 'STRING'
      }
    ]
  },
  usage: 'encode <text> <--base64|--binary>',
  category: 'fun',
  async execute(interaction, client) {
    const type = interaction.options.getString('type');
    const input = interaction.options.getString('input');

    const title = `Text to ${type}`;

    await client.tools.paginate(interaction, {
      type: 'embed',
      messages: toChunks(
        type === 'base64'
          ? Buffer.from(input).toString('base64')
          : input.replace(allRegex, (str) => {
              const strParse = str.charCodeAt().toString(2);

              return `${'00000000'.slice(String(strParse).length)}${strParse}`;
            }),
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
