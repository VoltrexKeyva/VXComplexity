const {
  default: {
    MessageEmbed,
    Util: { escapeMarkdown },
    Permissions: {
      FLAGS: { KICK_MEMBERS }
    }
  }
} = await import('discord.js');

export default {
  data: {
    name: 'kick',
    description: 'Kicks a member.',
    options: [
      {
        name: 'member',
        description: 'The member to kick from this server.',
        required: true,
        type: 'USER'
      },
      {
        name: 'reason',
        description: 'The reason this member is getting kicked.',
        required: false,
        type: 'STRING'
      }
    ]
  },
  usage: 'kick <reason> | <member>',
  category: 'moderation',
  permissions: [KICK_MEMBERS],
  myPermissions: [KICK_MEMBERS],
  async execute(interaction, client) {
    const member = interaction.options.getMember('member');
    const reason =
      interaction.options.getString('reason') ?? 'No reason provided.';

    switch (member.user.id) {
      case interaction.user.id:
        return void (await interaction.reply({
          content: 'Choose someone else to kick, not gonna kick yourself.',
          ephemeral: true
        }));
      case client.user.id:
        return void (await interaction.reply({
          content: 'Not gonna kick myself, thanks.',
          ephemeral: true
        }));
      case interaction.guild.ownerID:
        return void (await interaction.reply({
          content: 'How am I supposed to kick the server owner? 0head.',
          ephemeral: true
        }));
    }

    if (!member.kickable)
      return void (await interaction.reply({
        content:
          "I can't kick a member who has a role with a position higher or equal to the position of my highest role.",
        ephemeral: true
      }));

    {
      const embed = new MessageEmbed()
        .setColor('#0033ff')
        .setAuthor(
          'You were kicked',
          interaction.guild.iconURL({
            dynamic: true,
            size: 1024,
            format: 'png'
          })
        )
        .setDescription(
          `Hello **${escapeMarkdown(
            member.user.tag
          )}**, you were kicked from **${escapeMarkdown(
            interaction.guild.name
          )}** by **${escapeMarkdown(
            interaction.user.tag
          )}** for the following reason: ${reason.slice(0, 1024)}`
        );

      await member.send({ embeds: [embed] }).catch(() => {});
    }

    await member.kick(reason);

    const embed = new MessageEmbed()
      .setColor('#0033ff')
      .setThumbnail(
        member.user.displayAvatarURL({
          dynamic: true,
          size: 1024,
          format: 'png'
        })
      )
      .setTitle('Kicked!')
      .setDescription(
        `Successfully kicked **${escapeMarkdown(
          member.user.tag
        )}** for the following reason: ${reason.slice(0, 1024)}`
      );

    await interaction.reply({
      embeds: [embed]
    });
  }
};
