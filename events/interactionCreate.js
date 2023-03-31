const {
  Util: { escapeMarkdown },
  MessageEmbed
} = await import('discord.js');

export default {
  name: 'interactionCreate',
  once: false,
  async execute(client, interaction) {
    if (
      interaction.isButton() &&
      interaction.guild.id === '688373853889495044' &&
      interaction.customId === 'moyai_verification'
    ) {
      await interaction.member.roles
        .add('704088104327315557')
        .catch(() => null);

      return void (await interaction.reply({
        content:
          'You are now verified! I hope you would enjoy the server! Have fun :)',
        ephemeral: true
      }));
    } else if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    if (command.myPermissions?.length) {
      const bitfield = command.myPermissions.reduce((t, v) => t | v, 0n);

      const missing = (
        interaction.channel.permissionsFor(client.user.id) ??
        interaction.guild.me.permissions
      ).missing(bitfield);

      if (missing.length) {
        const embed = new MessageEmbed()
          .setColor('#0033ff')
          .setTitle('Insufficient Permissions')
          .setDescription(
            `I need the following permissions to execute this command:\n${missing
              .map(
                (p) =>
                  `• \`${client.tools.toProperCase(
                    p.replaceAll('_', ' ').toLowerCase()
                  )}\``
              )
              .join('\n')}`
          );

        return void (await interaction.reply({
          embeds: [embed],
          ephemeral: true
        }));
      }
    }

    if (command.permissions?.length) {
      const bitfield = command.permissions.reduce((t, v) => t | v, 0n);

      const missing = (
        interaction.channel.permissionsFor(interaction.user.id) ??
        interaction.member.permissions
      ).missing(bitfield);

      if (missing.length) {
        const embed = new MessageEmbed()
          .setColor('#0033ff')
          .setTitle('Insufficient Permissions')
          .setDescription(
            `You need the following permissions to use this command:\n${missing
              .map(
                (p) =>
                  `• \`${client.tools.toProperCase(
                    p.replaceAll('_', ' ').toLowerCase()
                  )}\``
              )
              .join('\n')}`
          );

        return void (await interaction.reply({
          embeds: [embed],
          ephemeral: true
        }));
      }
    }

    let hasCooldown = false;
    let isInCooldown = false;

    if (command.cooldown) {
      hasCooldown = true;

      const cooldown = await client.db
        .collection(`${command.data.name}Cooldowns`)
        .findOne({
          id: interaction.user.id
        });

      if (cooldown) isInCooldown = true;

      const time = command.cooldown - (Date.now() - cooldown?.cooldown);

      const embed = new MessageEmbed()
        .setColor('#0033ff')
        .setTitle('Cooldown')
        .setDescription(
          `Please wait **${client.tools.parseTimeFromMs(
            time
          )}** before using the **${escapeMarkdown(
            command.data.name
          )}** command.`
        );

      if (time > 0)
        return interaction.reply({
          embeds: [embed]
        });
    }

    try {
      console.log(
        `${interaction.user.tag} ran command ${interaction.commandName}`
      );

      await client.commands
        .get(interaction.commandName)
        .execute(interaction, client);

      if (hasCooldown) {
        if (isInCooldown) {
          await client.db
            .collection(`${command.data.name}Cooldowns`)
            .findOneAndUpdate(
              {
                id: interaction.user.id
              },
              {
                $set: {
                  cooldown: Date.now()
                }
              }
            );
        } else {
          await client.db
            .collection(`${command.data.name}Cooldowns`)
            .insertOne({
              id: interaction.user.id,
              cooldown: Date.now()
            });
        }
      }
    } catch (err) {
      console.error(
        `An error occured while trying to execute the '${interaction.commandName}' command:\n${err.stack}`
      );
    }
  }
};
