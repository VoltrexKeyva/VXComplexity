const {
  default: {
    MessageEmbed,
    Util: { escapeMarkdown },
    Permissions: {
      FLAGS: { BAN_MEMBERS }
    }
  }
} = await import('discord.js');

export default {
  data: {
    name: 'ban',
    description: 'Bans a member.',
    options: [
      {
        name: 'member',
        description: 'The member to ban from this server.',
        required: true,
        type: 'USER'
      },
      {
        name: 'reason',
        description: 'The reason this member is getting banned.',
        required: false,
        type: 'STRING'
      }
    ]
  },
  usage: 'ban <reason> | <member>',
  category: 'moderation',
  permissions: [BAN_MEMBERS],
  myPermissions: [BAN_MEMBERS],
  async execute(interaction, client) {
    const member = interaction.options.getMember('member');
    const reason =
      interaction.options.getString('reason') ?? 'No reason provided.';

    switch (member.user.id) {
      case interaction.user.id:
        return void (await interaction.reply({
          content: 'Choose someone else to ban, not gonna ban yourself.',
          ephemeral: true
        }));
      case client.user.id:
        return void (await interaction.reply({
          content: 'Not gonna ban myself, thanks.',
          ephemeral: true
        }));
      case interaction.guild.ownerID:
        return void (await interaction.reply({
          content: 'How am I supposed to ban the server owner? 0head.',
          ephemeral: true
        }));
    }

    if (!member.bannable)
      return void (await interaction.reply({
        content:
          "I can't ban a member who has a role with a position higher or equal to the position of my highest role.",
        ephemeral: true
      }));

    const ban = await interaction.guild.bans
      .fetch(member.user.id)
      .catch(() => null);

    if (ban !== null)
      return void (await interaction.reply({
        content:
          'How am i supposed to ban someone who has already been banned?',
        ephemeral: true
      }));

    {
      const embed = new MessageEmbed()
        .setColor('#0033ff')
        .setAuthor(
          'You were banned',
          interaction.guild.iconURL({
            dynamic: true,
            size: 1024,
            format: 'png'
          })
        )
        .setDescription(
          `Hello **${escapeMarkdown(
            member.user.tag
          )}**, you were banned from **${escapeMarkdown(
            interaction.guild.name
          )}** by **${escapeMarkdown(
            interaction.user.tag
          )}** for the following reason: ${reason.slice(0, 1024)}`
        );

      await member.send({ embeds: [embed] }).catch(() => undefined);
    }

    await member.ban({ reason });

    const embed = new MessageEmbed()
      .setColor('#0033ff')
      .setThumbnail(
        member.user.displayAvatarURL({
          dynamic: true,
          size: 1024,
          format: 'png'
        })
      )
      .setTitle('Banned!')
      .setDescription(
        `Successfully banned **${escapeMarkdown(
          member.user.tag
        )}** for the following reason: ${reason.slice(0, 1024)}`
      );

    await interaction.reply({
      embeds: [embed]
    });
  }
};
