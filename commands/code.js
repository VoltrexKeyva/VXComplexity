import { MessageEmbed } from 'discord.js';
import tio from 'tio.js';

const {
  default: { toChunks }
} = await import('string-toolkit');

let languages;

tio.setDefaultTimeout(19000);

export default {
  data: {
    name: 'code',
    description: 'The code den.',
    options: [
      {
        name: 'execute',
        description: 'Executes code with 600+ languages.',
        type: 'SUB_COMMAND',
        options: [
          {
            name: 'language',
            description: 'The programming language to execute the code in.',
            required: true,
            type: 'STRING'
          },
          {
            name: 'code',
            description: 'The code to execute.',
            required: true,
            type: 'STRING'
          }
        ]
      },
      {
        name: 'list',
        description:
          'Displays all of the available programming languages to choose from.',
        type: 'SUB_COMMAND'
      }
    ]
  },
  usage: 'code <list | <programming language>> <code>',
  category: 'fun',
  async execute(interaction, client) {
    if (languages === undefined) languages = await tio.languages();

    const sub = interaction.options.getSubcommand();

    if (sub === 'list')
      return void (await client.tools.paginate(interaction, {
        type: 'embed',
        messages: Array.from(
          {
            length: Math.ceil(languages.length / 15)
          },
          (_, i) => languages.slice(i * 15, i * 15 + 15).map((l) => `\`${l}\``)
        ).map((l) =>
          new MessageEmbed()
            .setColor('#0033ff')
            .setTitle('All supported programming languages')
            .setDescription(l.join(', '))
        ),
        time: 360000
      }));

    let language = interaction.options.getString('language').toLowerCase();

    if (language.endsWith(' ')) language = language.slice(0, -1);

    if (!languages.includes(language)) {
      const closestMatches = languages.filter((x) => x.includes(language));

      return void (await interaction.reply({
        content:
          closestMatches.length !== 0
            ? `Invalid programming language provided. Several closest matches found: ${closestMatches
                .slice(0, 15)
                .map((c) => `\`${c}\``)
                .join(', ')}`
            : 'Invalid programming language provided.\nPlease use `/code options list` for a list of supported programming languages.',
        ephemeral: true
      }));
    }

    const code = interaction.options.getString('code');

    await interaction.deferReply();

    let { output, realTime } = await tio(code, language);

    const lang = client.tools.toProperCase(language);

    if (output == undefined) output = 'No output.';

    const timeTaken = `Took: ${realTime} ms`;

    await client.tools.paginate(interaction, {
      type: 'embed',
      messages: toChunks(output, 4096).map((o) =>
        new MessageEmbed()
          .setColor('#0033ff')
          .setTitle(`Code Execution Result (${lang})`)
          .setDescription(`\`\`\`${lang}\n${o}\n\`\`\``)
          .setFooter(timeTaken)
      ),
      time: 360000
    });
  }
};
