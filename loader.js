import { Collection, GuildMember, User, MessageEmbed, Util } from 'discord.js';
import moment from 'moment';
import { Api as TopggApi } from '@top-gg/sdk';
import { existsSync, readdirSync } from 'node:fs';
import parseMs from 'parse-ms';
import canvas from 'canvas';
import { MongoClient } from 'mongodb';
import SimpleYouTubeAPI from 'simple-youtube-api';
import stringToolkit from 'string-toolkit';
import getImageColors from 'get-image-colors';
import colorCheck from 'tinycolor2';
import cheerio from 'cheerio';
import twemoji from 'twemoji';
import fetch from 'node-fetch';
import { boostLevels, fonts, paginatorModels, badges } from './constants.js';

const {
  default: { topggToken, youtubeToken, mongodbUri }
} = await import('./config.json', { assert: { type: 'json' } });

const listFormatter = new Intl.ListFormat('en');

function editComponents(interaction, enable, disable) {
  for (const actionRow of interaction.components)
    for (const component of actionRow.components) {
      if (enable.includes(component.customId)) component.disabled = false;
      else if (disable.includes(component.customId)) component.disabled = true;
    }
}

async function editInteractionReply(m, p) {
  return await m.edit({
    content: typeof p === 'string' ? p : null,
    embeds: typeof p === 'object' ? [p] : null,
    components: m.components
  });
}

export default async function load(client) {
  client.ownerIds = ['544676649510371328', '661200758510977084'];

  client.queue = new Collection();
  client.commands = new Collection();

  client.db = new MongoClient(mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  client.tools = {
    toProperCase(string) {
      if (typeof string !== 'string')
        throw new TypeError("The 'string' argument must be a string.");

      return string.replace(/\b\w/gi, (l) => l.toUpperCase());
    },
    parseTimeFromMs(milliseconds) {
      if (!Number.isInteger(milliseconds))
        throw new TypeError("The 'milliseconds' argument must be a number.");

      return listFormatter.format(
        Object.entries(parseMs(milliseconds))
          .filter(([K, V]) => V > 0 && K !== 'milliseconds')
          .map(
            ([K, V]) =>
              `${V} ${
                V === 1
                  ? this.toProperCase(K).slice(0, -1)
                  : this.toProperCase(K)
              }`
          )
      );
    },
    progressBar(T, O, L) {
      return stringToolkit.createProgressBar(T, O, L);
    },
    memoryUsage() {
      return Object.entries(process.memoryUsage())
        .map(([K, V]) => `${K} => ${Math.round(V / 1024 ** 2).toFixed(1)}MB`)
        .join('\n');
    },
    fakeToken() {
      return stringToolkit.fakeToken();
    },
    chunkArray(array, splitBy) {
      if (!Array.isArray(array))
        throw new TypeError("The 'array' argument must be an array.");

      if (!Number.isInteger(splitBy))
        throw new TypeError("The 'splitBy' argument must be a number.");

      return Array.from(
        {
          length: Math.ceil(array.length / splitBy)
        },
        (_, i) => array.slice(i * splitBy, i * splitBy + splitBy)
      );
    },
    checkFilter(object) {
      if (typeof object === 'string') {
        object = object.replace(new RegExp(client.token, 'gi'), '[AMOGUS]');
      } else if (typeof object === 'object') {
        if (Array.isArray(object))
          for (let i = 0; i < object.length; i++)
            object[i] = client.tools.checkFilter(object[i]);
        else
          for (const key in object)
            object[key] = client.tools.checkFilter(object[key]);
      }

      return object;
    },
    rgbToHex(r, g, b) {
      return `#${[r, g, b].reduce((T, component) => {
        const to16 = component.toString(16);

        return `${T}${to16.length === 1 ? `0${to16}` : to16}`;
      }, '')}`;
    },
    async getPalette(url) {
      if (typeof url !== 'string')
        throw new TypeError("The 'url' argument must be a string.");

      const colors = await fetch(url)
        .then(async (res) => Buffer.from(await res.arrayBuffer()))
        .then((buffer) =>
          getImageColors(buffer, {
            count: 10,
            type: 'image/jpeg'
          })
        )
        .then((cls) => cls.map((color) => color.hex()));
      const ctx = canvas
        .createCanvas(100 * colors.length + 75, 751)
        .getContext('2d');

      ctx.font = '30px WhitneyBold';

      let goFurther = 0;

      for (const color of colors) {
        ctx.fillStyle = color;
        ctx.fillRect(goFurther, 0, 195, 751);

        const saveStyle = ctx.fillStyle;

        ctx.fillStyle = colorCheck(saveStyle).isLight() ? 'black' : 'white';
        ctx.fillText(saveStyle, goFurther + 6.7, 35, 119, 50);

        goFurther += 135;
      }

      return ctx.canvas.toBuffer();
    },
    async paginate(interaction, options = {}) {
      options = {
        type:
          typeof options.type === 'string' &&
          ['message', 'embed'].includes(options.type.toLowerCase())
            ? options.type
            : 'message',
        messages: Array.isArray(options.messages) ? options.messages : [],
        time: Number.isInteger(options.time) ? options.time : 30000,
        code: typeof options.code === 'string' ? options.code : null
      };

      if (!options.messages.length)
        throw new TypeError(
          "The 'options.messages' property must have at least one element."
        );

      if (
        options.type === 'embed' &&
        !options.messages.every((m) => m instanceof MessageEmbed)
      )
        throw new TypeError(
          "The 'options.type' property was chosen as 'embed' but not every element of 'options.messages' were an instance of <discord.js>.MessageEmbed"
        );

      if (options.code && options.type === 'message')
        options.messages = options.messages.map(
          (m) => `\`\`\`${options.code}\n${m}\n\`\`\``
        );

      let page = 0;
      const p = options.messages[page];
      const obj = {
        content: typeof p === 'string' ? p : null,
        embeds: typeof p === 'object' ? [p] : null,
        components:
          paginatorModels[
            options.messages.length >= 3 ? 3 : options.messages.length
          ],
        fetchReply: true
      };

      let m = await interaction
        .reply(obj)
        .catch(() => interaction.followUp(obj));

      const fullLength = options.messages.length - 1;

      const collector = m.createMessageComponentCollector({
        filter: (i) =>
          [
            'first_page',
            'previous',
            'next',
            'last_page',
            'stop',
            'close'
          ].includes(i.customId) && i.user.id === interaction.user.id,
        time: options.time,
        componentType: 'BUTTON'
      });

      collector.on('collect', async (i) => {
        switch (i.customId) {
          case 'close':
            collector.stop();

            await interaction.deleteReply();
            break;
          case 'stop':
            collector.stop();

            editComponents(
              m,
              [],
              ['first_page', 'previous', 'next', 'last_page', 'stop', 'close']
            );

            m = await m.edit({
              components: m.components
            });
            break;
          case 'previous':
            if (page === 0) {
              page = fullLength;

              editComponents(m, ['first_page'], ['last_page']);
            } else {
              page--;

              if (page === 0) editComponents(m, ['last_page'], ['first_page']);
              else if (page === fullLength - 1)
                editComponents(m, ['last_page'], []);
            }

            m = await editInteractionReply(m, options.messages[page]);
            break;
          case 'next':
            if (page === fullLength) {
              page = 0;

              editComponents(m, ['last_page'], ['first_page']);
            } else {
              page++;

              if (page === fullLength)
                editComponents(m, ['first_page'], ['last_page']);
              else if (page === 1) editComponents(m, ['first_page'], []);
            }

            m = await editInteractionReply(m, options.messages[page]);
            break;
          case 'first_page':
            if (page === 0) return;

            page = 0;

            editComponents(m, ['last_page'], ['first_page']);

            m = await editInteractionReply(m, options.messages[page]);
            break;
          case 'last_page':
            if (page === fullLength) return;

            page = fullLength;

            editComponents(m, ['first_page'], ['last_page']);

            m = await editInteractionReply(m, options.messages[page]);
        }
      });
    },
    async initializeBadges(user) {
      if (![User, GuildMember].some((s) => user instanceof s))
        throw new TypeError('Expected a user or guild member.');

      if (user instanceof GuildMember) user = user.user;

      const flags = (await user.fetchFlags()).toArray();
      let checkPremium = client.guilds.cache.filter(
        ({ members: { cache } }) => !!cache.get(user.id)?.premiumSinceTimestamp
      );

      if (
        user.avatar?.startsWith('a_') ||
        user.discriminator.startsWith('000') ||
        user.discriminator.endsWith('000') ||
        [
          '0420',
          '0069',
          '6942',
          '6900',
          '6969',
          '1234',
          ...Array.from(
            {
              length: 8
            },
            (a, r) => (r + 1).toString().repeat(4)
          )
        ].includes(user.discriminator) ||
        checkPremium.size
      )
        flags.unshift('<:DiscordNitro:717720071329284178>');

      if (checkPremium.size) {
        checkPremium = checkPremium.reduce(
          (T, { members: { cache } }) =>
            T +
            Math.round(
              moment
                .duration(Date.now() - cache.get(user.id).premiumSinceTimestamp)
                .asMonths()
            ),
          0
        );

        flags.push(
          boostLevels[checkPremium] || '<:boost_c:715860592581279745>'
        );
      }

      return flags.map((f) => badges[f] || f);
    },
    parseUser(message, args, options = {}) {
      options = {
        member: options.member ?? false,
        seperate: options.seperate ?? false,
        fallbackToAuthor: options.fallbackToAuthor ?? true
      };

      const joinedArgs = args.join(' '),
        users = !options.seperate
          ? message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]) ||
            message.guild.members.cache.find(({ user }) =>
              [user.username, user.tag].some(
                (e) => e.toLowerCase() === joinedArgs.toLowerCase()
              )
            )
          : (joinedArgs.match(/(.*) \| <@!?(\d{17,19})>/)
              ? message.mentions.members.last()
              : undefined) ||
            message.guild.members.cache.get(
              joinedArgs.match(/(.*) \| (\d{17,19})/)?.[2]
            ) ||
            message.guild.members.cache.find(({ user }) =>
              [user.username, user.tag].some(
                (e) =>
                  e.toLowerCase() ===
                  joinedArgs.match(/(.*) \| (.*)/)?.[2]?.toLowerCase()
              )
            ),
        returnValue = options.member
          ? options.fallbackToAuthor
            ? users || message.member
            : users
          : options.fallbackToAuthor
          ? users?.user || message.author
          : users?.user;

      return options.seperate
        ? {
            user: returnValue,
            seperatedContent:
              joinedArgs.match(/(.*) \| (.*)/)?.[1] || joinedArgs
          }
        : returnValue;
    },
    version: '3.0.0',
    invalidArguments(commandArguments) {
      return new MessageEmbed()
        .setColor('#0033ff')
        .setTitle('Invalid arguments')
        .setDescription(`\`${commandArguments}\``);
    },
    notOwnerEmbed() {
      return new MessageEmbed()
        .setColor('#FF0000')
        .addField(
          'Error',
          `This command is only available for this bot's developer${
            client.ownerIds.length === 1 ? '' : 's'
          } (${client.ownerIds
            .map(
              (id) =>
                `**${Util.escapeMarkdown(client.users.cache.get(id).tag)}**`
            )
            .join(', ')})`,
          false
        );
    },
    youtube: new SimpleYouTubeAPI(youtubeToken),
    topgg: new TopggApi(topggToken),
    parseOptions(args) {
      return stringToolkit.parseOptions(args);
    },
    parseURL(message, args, titlePlaceholder, returnGif) {
      const joinedArgs = args.join(' '),
        resolveURL =
          (['.gif', '.png', '.jpeg', '.jpg', '.webp'].some((e) =>
            message.attachments.first()?.url.toLowerCase().endsWith(e)
          )
            ? message.attachments.first().url
            : undefined) ||
          cheerio.load(twemoji.parse(joinedArgs))('img').attr('src') ||
          (/^<a?:(\w{2,32}):(\d{17,19})>$/.test(joinedArgs)
            ? `https://cdn.discordapp.com/emojis/${
                joinedArgs.match(/^<a?:(\w{2,32}):(\d{17,19})>$/)[2]
              }.png`
            : undefined) ||
          (/^https?:\/\/(.*)\.(png|jpeg|jpg|webp|gif)$/.test(joinedArgs)
            ? joinedArgs
            : undefined) ||
          (
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]) ||
            message.guild.members.cache.find(({ user }) =>
              [user.username, user.tag].some(
                (T) => T.toLowerCase() === joinedArgs.toLowerCase()
              )
            ) ||
            message.member
          ).user;

      let resolve =
        resolveURL instanceof User
          ? resolveURL.displayAvatarURL({
              dynamic: true,
              size: 2048,
              format: 'png'
            })
          : resolveURL;

      const params = resolve.split('?')[1] || '';

      resolve = resolve.includes('?') ? resolve.split('?')[0] : resolve;

      return {
        url:
          returnGif === true
            ? resolve
            : `${
                resolve.endsWith('.gif')
                  ? `${resolve.slice(0, -3)}png`
                  : resolve
              }${params ? `?${params}` : ''}`,
        title: `${titlePlaceholder} of ${
          !(resolveURL instanceof User)
            ? resolveURL.startsWith('https://cdn.discordapp.com/emojis/')
              ? 'a custom emoji'
              : resolveURL.startsWith('https://twemoji.maxcdn.com')
              ? 'a unicode emoji'
              : 'a message attachment'
            : resolveURL.tag
        }`
      };
    },
    async parseArguments(string) {
      return Promise.all(
        string.split(' | ').map((argument) =>
          /<@!?\d{17,19}>/.test(argument)
            ? client.users
                .fetch(argument.match(/<@!?(\d{17,19})>/)[1])
                .then((u) => u.tag)
                .catch(() => '@invalid-user')
            : argument
        )
      );
    },
    notNSFWChannel(commandName) {
      return new MessageEmbed()
        .setColor('#0033ff')
        .setTitle('Not a NSFW channel')
        .setDescription(
          `**${Util.escapeMarkdown(
            commandName
          )}** command may include NSFW content, so it can only be used in NSFW channels.`
        );
    }
  };

  canvas.CanvasRenderingContext2D.prototype.roundRect = function (
    x,
    y,
    w,
    h,
    r
  ) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;

    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();

    return this;
  };

  for (const { path, family } of fonts) canvas.registerFont(path, { family });

  if (existsSync('./commands')) {
    const files = readdirSync('./commands').filter((f) => f.endsWith('.js'));

    for (const file of files) {
      try {
        const { default: command } = await import(`./commands/${file}`);

        client.commands.set(command.data.name, command);
      } catch (error) {
        console.error(
          `Failed to load command '${file.slice(
            0,
            -3
          )}' due to an error: ${error}`
        );
      }
    }
  } else
    console.warn(
      "A 'commands' directory wasn't found at the root directory to load commands from."
    );

  if (existsSync('./events')) {
    const files = readdirSync('./events').filter((f) => f.endsWith('.js'));

    for (const file of files) {
      try {
        const { default: event } = await import(`./events/${file}`);

        const emitter = event.ws ? client.ws : client;

        emitter[event.once ? 'once' : 'on'](
          event.name,
          event.execute.bind(event, client)
        );
      } catch (error) {
        console.error(
          `Failed to load event '${file.slice(
            0,
            -3
          )}' due to an error: ${error}`
        );
      }
    }
  } else
    console.warn(
      "An 'events' directory wasn't found at the root directory to load events from."
    );
}
