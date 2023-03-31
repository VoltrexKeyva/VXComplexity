import { MessageEmbed } from 'discord.js';
import { exec } from 'node:child_process';

const {
  default: { toChunks }
} = await import('string-toolkit');

export default {
  data: {
    name: 'exec',
    description: 'Executes commands in bash.',
    options: [
      {
        name: 'command-line',
        description: 'The command line to execute.',
        required: true,
        type: 'STRING'
      }
    ]
  },
  usage: 'exec <command line>',
  category: 'owner',
  async execute(interaction, client) {
    if (!client.ownerIds.includes(interaction.user.id))
      return void (await interaction.reply({
        content: 'This is an owner only command.',
        ephemeral: true
      }));

    await interaction.deferReply();

    const commandLine = interaction.options.getString('command-line');

    let timer = performance.now();

    exec(commandLine, async (err, stdout, stderr) => {
      timer = performance.now() - timer;

      const output =
        err?.toString() ??
        `${stderr ? `${stderr}\n\n` : ''}${stdout || 'No output.'}`;

      await client.tools.paginate(interaction, {
        type: 'embed',
        messages: toChunks(output, 4000).map((chunk) =>
          new MessageEmbed()
            .setColor(0x0033ff)
            .setTitle('Execution Result')
            .setDescription(`\`\`\`bash\n${chunk}\n\`\`\``)
            .addField('Took', `\`\`\`js\n${timer} ms\n\`\`\``)
        ),
        time: 60000
      });
    });
  }
};
