import { MessageEmbed, MessageActionRow, MessageSelectMenu } from 'discord.js';
import fetch from 'node-fetch';

const base = 'https://djsdocs.sorta.moe/v2/embed';
const hexC = 0x2169f3;

export default {
  data: {
    name: 'docs',
    description: 'Search through the discord.js documentation.',
    options: [
      {
        name: 'query',
        description: 'The query to search the documentation for.',
        required: true,
        type: 'STRING'
      },
      {
        name: 'source',
        description: 'The documentation source.',
        required: false,
        choices: [
          {
            name: 'stable',
            value: 'stable'
          },
          {
            name: 'master',
            value: 'master'
          },
          {
            name: 'commando',
            value: 'commando'
          },
          {
            name: 'rpc',
            value: 'rpc'
          },
          {
            name: 'akairo-master',
            value: 'akairo-master'
          },
          {
            name: 'collection',
            value: 'collection'
          }
        ],
        type: 'STRING'
      }
    ]
  },
  usage: 'documents <query> [--src <source>]',
  category: 'general',
  async execute(interaction, client) {
    const query = encodeURIComponent(interaction.options.getString('query'));
    const source = interaction.options.getString('source') ?? 'stable';

    let embed = await fetch(`${base}?src=${source}&q=${query}`).then((res) =>
      res.json()
    );

    if (!embed)
      return void (await interaction.reply({
        content: 'Nothing found with the provided query.',
        ephemeral: true
      }));

    if (!embed.fields?.length) {
      const options = [...embed.description.matchAll(/\S+ \*\*\[(.+)\]/g)];

      const selectMenu = new MessageSelectMenu()
        .addOptions(
          options.map((option) => ({
            label: option[1],
            value: option[1],
            emoji:
              (option[1].includes('.') || option[1].includes('#')) &&
              option[1].endsWith('()')
                ? '875009686624153621'
                : option[1].includes('.') || option[1].includes('#')
                ? '874980860976304169'
                : '874976108288823326'
          }))
        )
        .setPlaceholder('Choose a query')
        .setCustomId(`querySelection_${Date.now()}`)
        .setMinValues(1)
        .setMaxValues(1);

      const row = new MessageActionRow().addComponents(selectMenu);

      const e = new MessageEmbed()
        .setColor('#0033ff')
        .setDescription(
          'The query you provided is invalid, however a few close matches were found, choose one in 30 seconds.'
        );

      await interaction.reply({
        embeds: [e],
        components: [row],
        ephemeral: true
      });

      const selection = await interaction.channel
        .awaitMessageComponent({
          filter: (i) =>
            i.customId === selectMenu.customId &&
            i.user.id === interaction.user.id &&
            i.webhook.id === interaction.webhook.id,
          time: 30000,
          componentType: 'SELECT_MENU'
        })
        .catch(() => null);

      if (!selection)
        return void (await interaction.followUp({
          content: "You didn't choose a query in 30 seconds, closed selection.",
          ephemeral: true
        }));

      embed = await fetch(
        `${base}?src=${source}&q=${encodeURIComponent(selection.values[0])}`
      ).then((res) => res.json());

      interaction = selection;
    }

    const embeds = [];

    const main = new MessageEmbed(embed)
      .setColor(hexC)
      .setDescription(`${embed.description}\n\n${embed.fields.pop().value}`);

    main.fields = [];

    const others = embed.fields.map((field) =>
      new MessageEmbed()
        .setColor(hexC)
        .setTitle(field.name)
        .setDescription(field.value)
    );

    embeds.push(main, ...others);

    await client.tools.paginate(interaction, {
      type: 'embed',
      messages: embeds,
      time: 360000
    });
  }
};
