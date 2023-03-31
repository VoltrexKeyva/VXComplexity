import cheerio from 'cheerio';
import fetch from 'node-fetch';

const {
  default: {
    MessageEmbed,
    Util: { escapeMarkdown },
    MessageActionRow,
    MessageSelectMenu
  }
} = await import('discord.js');

export default {
  data: {
    name: 'topgg',
    description: 'Commands related to top.gg.',
    options: [
      {
        name: 'bot',
        description: 'Shows info about a bot from top.gg.',
        options: [
          {
            name: 'bot',
            description: 'The bot to show information of.',
            required: false,
            type: 'USER'
          },
          {
            name: 'query',
            description: 'Search for bots with a query.',
            required: false,
            type: 'STRING'
          }
        ],
        type: 'SUB_COMMAND'
      },
      {
        name: 'user',
        description: 'Shows info about a user in top.gg.',
        options: [
          {
            name: 'user',
            description: 'The user to show information of.',
            required: true,
            type: 'USER'
          }
        ],
        type: 'SUB_COMMAND'
      }
    ]
  },
  category: 'general',
  async execute(interaction, client) {
    await interaction.deferReply();

    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case 'bot':
        {
          const user = interaction.options.getUser('bot');
          const query = interaction.options.getString('query');

          if (user === null && query === null)
            return void (await interaction.followUp({
              content: 'You must provide one of the options.',
              ephemeral: true
            }));

          const { topgg } = client.tools;

          let bot;

          if (user !== null) {
            if (!user.bot)
              return void (await interaction.followUp({
                content: `${escapeMarkdown(user.tag)} is not a bot.`,
                ephemeral: true
              }));

            try {
              bot = await topgg.getBot(user.id);
            } catch {
              return void (await interaction.followUp({
                content: `${escapeMarkdown(user.tag)} is not on top.gg.`,
                ephemeral: true
              }));
            }
          } else {
            const { results: bots } = await topgg.getBots({
              search: query,
              limit: 10
            });

            if (bots.length === 0)
              return void (await interaction.followUp({
                content: 'No bots found in top.gg with the provided query.',
                ephemeral: true
              }));

            const selectMenu = new MessageSelectMenu()
              .addOptions(
                bots.map((b) => ({
                  label: `${b.username}#${b.discriminator}`,
                  value: b.id,
                  description: b.shortdesc.slice(0, 100),
                  emoji: b.certifiedBot ? '790708223703384074' : null
                }))
              )
              .setPlaceholder('Choose a bot')
              .setCustomId(`botSelection_${Date.now()}`)
              .setMinValues(1)
              .setMaxValues(1);

            const row = new MessageActionRow().addComponents(selectMenu);

            const embed = new MessageEmbed()
              .setColor('#0033ff')
              .setTitle('Bot Selection')
              .setDescription(
                'Choose a bot to show information of, you got 15 seconds.'
              );

            const m = await interaction.followUp({
              embeds: [embed],
              components: [row],
              fetchReply: true
            });

            const selection = await m
              .awaitMessageComponent({
                filter: (i) =>
                  i.customId === selectMenu.customId &&
                  i.user.id === interaction.user.id,
                time: 15000,
                componentType: 'SELECT_MENU'
              })
              .then((s) => s.values[0])
              .catch(() => null);

            await interaction.deleteReply();

            if (selection === null)
              return void (await interaction.followUp({
                content:
                  "You didn't choose a bot in 15 seconds, closed bot selection.",
                ephemeral: true
              }));

            bot = await topgg.getBot(selection);
          }

          const botUser = await client.users.fetch(bot.id);
          const { id } = botUser;
          const {
            invite,
            support,
            website,
            github,
            shortdesc,
            certifiedBot,
            lib,
            prefix,
            tags,
            date,
            server_count,
            shard_count,
            points,
            monthlyPoints
          } = bot;
          const owners = await Promise.all(
            bot.owners.map((owner) => client.users.fetch(owner))
          );
          const botEmbeds = [];
          const links = [
            `[Invite](${
              invite?.replace(/\s/g, '') ??
              `https://discord.com/oauth2/authorize?client_id=${id}&scope=bot&permissions=0`
            })`,
            `[Vote](https://top.gg/bot/${id}/vote)`
          ];
          const botAvatar = botUser.displayAvatarURL({
            dynamic: true,
            size: 2048,
            format: 'png'
          });

          if (support != undefined)
            links.push(
              `[Support](https://discord.gg/${support.replace(/\s/g, '')})`
            );

          if (website != undefined)
            links.push(`[Website](${website.replace(/\s/g, '')})`);

          if (github != undefined)
            links.push(`[Github](${github.replace(/\s/g, '')})`);

          const mainBotInfoEmbed = new MessageEmbed()
            .setColor('#0033ff')
            .setAuthor('Bot information', botAvatar)
            .setDescription(shortdesc)
            .addField(
              'Tag',
              `[${botUser.tag}](https://top.gg/bot/${id}) ${
                botUser.flags?.has('VERIFIED_BOT')
                  ? '<:VerifiedBot:790668679573798933>'
                  : '<:Bot:790668582303825920>'
              }${certifiedBot ? ' **[Certified]**' : ''}`,
              false
            )
            .addField('ID', id, true);

          if (lib != undefined) mainBotInfoEmbed.addField('Library', lib, true);

          mainBotInfoEmbed.addField('Prefix', escapeMarkdown(prefix), true);

          if (tags.length !== 0)
            mainBotInfoEmbed.addField('Tags', tags.join(', '), false);

          const created = Math.floor(botUser.createdTimestamp / 1000);
          const approved = Math.floor(new Date(date).getTime() / 1000);

          mainBotInfoEmbed
            .addField(
              'Created at',
              `<t:${created}:F> (<t:${created}:R>)`,
              false
            )
            .addField(
              'Approved at',
              `<t:${approved}:F> (<t:${approved}:R>)`,
              false
            )
            .addField(
              'Statistics',
              `${
                server_count != undefined
                  ? `• **Server count:** ${server_count.toLocaleString()}\n`
                  : ''
              }${
                shard_count != undefined
                  ? `• **Shard count:** ${shard_count.toLocaleString()}\n`
                  : ''
              }• **Total votes:** ${points.toLocaleString()}\n• **Monthly votes:** ${monthlyPoints.toLocaleString()}`,
              false
            )
            .addField('Links', links.join(' • '), false);

          botEmbeds.push(mainBotInfoEmbed);

          const ownerBadges = await Promise.all(
            owners.map(client.tools.initializeBadges)
          );

          for (let i = 0; i < owners.length; i++) {
            const ownerEmbed = new MessageEmbed()
              .setColor('#0033ff')
              .setAuthor(
                i === 0 ? 'Main owner' : `Additional owners - ${i}`,
                botAvatar
              )
              .setThumbnail(
                owners[i].displayAvatarURL({
                  dynamic: true,
                  size: 1024,
                  format: 'png'
                })
              )
              .addField(
                'Tag',
                `**[${owners[i].tag}](https://top.gg/user/${owners[i].id})** [${owners[i]}]`,
                false
              );

            if (ownerBadges[i].length !== 0)
              ownerEmbed.setDescription(`\u200B${ownerBadges[i].join(' ')}`);

            botEmbeds.push(ownerEmbed);
          }

          botEmbeds.push(
            new MessageEmbed()
              .setColor('#0033ff')
              .setAuthor('Bot avatar', botAvatar)
              .setImage(botAvatar)
          );

          await client.tools.paginate(interaction, {
            type: 'embed',
            messages: botEmbeds,
            time: 180000
          });
        }
        break;
      case 'user': {
        const user = interaction.options.getUser('user');

        if (user.bot)
          return void (await interaction.followUp({
            content: "That's not a user.",
            ephemeral: true
          }));

        let u;

        try {
          u = await client.tools.topgg.getUser(user.id);
        } catch {
          return void (await interaction.followUp({
            content: 'User not found in top.gg.',
            ephemeral: true
          }));
        }

        const { admin, webMod, mod, certifiedDev, bio, color, banner, social } =
          u;
        const dblBadges = [];

        if (admin != undefined)
          dblBadges.push('<:dblAdmin:791506255654420530>');

        if (webMod != undefined) dblBadges.push('<:webMod:791506586581205002>');

        if (mod != undefined) dblBadges.push('<:dblMod:791506687893831720>');

        if (certifiedDev != undefined)
          dblBadges.push('<:dblCertified:790708223703384074>');

        if (
          cheerio
            .load(
              await fetch(`https://top.gg/user/${user.id}`).then((res) =>
                res.text()
              )
            )('.badgecase img')
            .toArray()
            .find((node) => node.attribs.alt === 'premium')
        )
          dblBadges.push('<:Premium:791507259468677151>');

        const badges = await client.tools.initializeBadges(user);
        const dblLinks = [];

        if (social != undefined) {
          const { youtube, reddit, twitter, instagram, github } = social;

          if (youtube != undefined)
            dblLinks.push(
              `<:YouTube:791508032675774474> [YouTube](https://youtube.com/channel/${youtube.replace(
                / /g,
                ''
              )})`
            );

          if (reddit != undefined)
            dblLinks.push(
              `<:Reddit:791508104193376257> [Reddit](https://reddit.com/user/${reddit})`
            );

          if (twitter != undefined)
            dblLinks.push(
              `<:Twitter:791508171817877524> [Twitter](https://twitter.com/${twitter})`
            );

          if (instagram != undefined)
            dblLinks.push(
              `<:Instagram:791508269620527154> [Instagram](https://instagram.com/${instagram})`
            );

          if (github != undefined)
            dblLinks.push(
              `<:GitHub:791508348230828063> [Github](https://github.com/${github})`
            );
        }

        const userAvatar = user.displayAvatarURL({
          dynamic: true,
          size: 2048,
          format: 'png'
        });
        const dblUserEmbeds = [];

        const mainInfoEmbed = new MessageEmbed()
          .setAuthor('Top.gg user information', userAvatar)
          .addField(
            'Tag',
            `**[${user.tag}](https://top.gg/user/${user.id})** [${user}]`,
            false
          )
          .addField('ID', user.id, true);

        if (badges.length !== 0 || dblBadges.length !== 0)
          mainInfoEmbed.setDescription(
            `\u200B${
              badges.length !== 0 || dblBadges.length !== 0
                ? `${
                    badges.length !== 0 && dblBadges.length !== 0
                      ? `${badges.join(' ')} | ${dblBadges.join(' ')}`
                      : badges
                      ? badges.join(' ')
                      : dblBadges.join(' ')
                  }\n`
                : ''
            }`
          );

        if (bio != undefined) mainInfoEmbed.addField('Bio', bio, false);

        if (color != undefined && color !== '#')
          mainInfoEmbed.addField('Custom page color', color, true);

        if (dblLinks.length !== 0)
          mainInfoEmbed.addField('Socials', dblLinks.join('\n'), false);

        const avatarEmbed = new MessageEmbed()
          .setAuthor('User avatar', userAvatar)
          .setImage(userAvatar);

        let bannerEmbed;
        if (banner != undefined)
          bannerEmbed = new MessageEmbed()
            .setAuthor('Banner', userAvatar)
            .setImage(banner);

        dblUserEmbeds.push(
          ...[mainInfoEmbed, avatarEmbed, bannerEmbed].filter(
            (e) => e !== undefined
          )
        );

        const eColor = color != undefined && color !== '#' ? color : '#0033ff';

        await client.tools.paginate(interaction, {
          type: 'embed',
          messages: dblUserEmbeds.map((embed) => embed.setColor(eColor)),
          time: 180000
        });
      }
    }
  }
};
