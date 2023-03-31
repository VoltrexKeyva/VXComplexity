import { MessageEmbed } from 'discord.js';
import { inspect } from 'node:util';
import { Type } from '@sapphire/type';

const {
  default: { toChunks }
} = await import('string-toolkit');

const charCode_8203 = String.fromCharCode(8203);

export default {
  data: {
    name: 'eval',
    description: 'Evaluates code.',
    options: [
      {
        name: 'code',
        description: 'The code to evaluate.',
        required: true,
        type: 'STRING'
      },
      {
        name: 'depth',
        description: 'Inspect the code with a specific depth.',
        required: false,
        type: 'NUMBER'
      },
      {
        name: 'show-hidden',
        description:
          'Whether to show the non-enumerable symbols and properties.',
        required: false,
        type: 'BOOLEAN'
      },
      {
        name: 'colors',
        description: 'Whether to style the output with ANSI color codes.',
        required: false,
        type: 'BOOLEAN'
      },
      {
        name: 'custom-inspect',
        description:
          'Whether to invoke `[util.inspect.custom](...)` functions.',
        required: false,
        type: 'BOOLEAN'
      },
      {
        name: 'show-proxy',
        description:
          'Whether to include the `target` and `handler` objects in `Proxy` inspection.',
        required: false,
        type: 'BOOLEAN'
      },
      {
        name: 'max-array-length',
        description: 'The max number of array elements to show in inspection.',
        required: false,
        type: 'INTEGER'
      },
      {
        name: 'max-string-length',
        description: 'The max number of string chars to show in inspection.',
        required: false,
        type: 'INTEGER'
      },
      {
        name: 'break-length',
        description:
          'The length at which input values are split across multiple lines.',
        required: false,
        type: 'INTEGER'
      },
      {
        name: 'compact',
        description:
          'Unite specified amount of inner elements on a single line.',
        required: false,
        type: 'INTEGER'
      },
      {
        name: 'sorted',
        description: 'Whether to sort all properties of an object.',
        required: false,
        type: 'BOOLEAN'
      },
      {
        name: 'getters',
        description: 'Whether to inspect `getters` and `setters`.',
        required: false,
        type: 'BOOLEAN'
      }
    ]
  },
  usage: 'eval <code>',
  category: 'owner',
  async execute(interaction, client) {
    if (!client.ownerIds.includes(interaction.user.id))
      return void (await interaction.reply({
        content: 'This is an owner only command.',
        ephemeral: true
      }));

    await interaction.deferReply();

    const code = interaction.options.getString('code');

    let evaled, type, timer;
    try {
      timer = performance.now();

      evaled = eval(code);

      if (evaled instanceof Promise) evaled = await evaled;

      timer = performance.now() - timer;

      type = new Type(evaled).toString();

      if (typeof evaled !== 'string')
        evaled = inspect(evaled, {
          showHidden: interaction.options.getBoolean('show-hidden') ?? false,
          depth: interaction.options.getNumber('depth') ?? 2,
          colors: interaction.options.getBoolean('colors') ?? false,
          customInspect:
            interaction.options.getBoolean('custom-inspect') ?? true,
          showProxy: interaction.options.getBoolean('show-proxy') ?? false,
          maxArrayLength:
            interaction.options.getInteger('max-array-length') ?? 100,
          maxStringLength:
            interaction.options.getInteger('max-string-length') ?? 10000,
          breakLength: interaction.options.getInteger('break-length') ?? 80,
          compact: interaction.options.getInteger('compact') ?? 3,
          sorted: interaction.options.getBoolean('sorted') ?? false,
          getters: interaction.options.getBoolean('getters') ?? false
        });

      evaled = evaled
        .replaceAll('`', `\`${charCode_8203}`)
        .replaceAll('@', `@${charCode_8203}`)
        .replaceAll(client.token, '[AMOGUS]');
    } catch (err) {
      timer = performance.now() - timer;
      evaled = inspect(err);
      type = new Type(err).toString();
    }

    await client.tools.paginate(interaction, {
      type: 'embed',
      messages: toChunks(evaled, 4000).map((chunk) =>
        new MessageEmbed()
          .setColor('#0033ff')
          .setTitle('Evaluation Output')
          .setDescription(`\`\`\`js\n${chunk}\n\`\`\``)
          .addField('Type', `\`\`\`js\n${type}\n\`\`\``)
          .addField('Took', `\`\`\`js\n${timer} ms\n\`\`\``)
      ),
      time: 300000
    });
  }
};
