import { Readable } from 'node:stream';
import fetch from 'node-fetch';

const {
  createAudioResource,
  createAudioPlayer,
  joinVoiceChannel,
  NoSubscriberBehavior: { Pause },
  AudioPlayerStatus: { Idle }
} = await import('@discordjs/voice');

const base = 'https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=';

export default {
  data: {
    name: 'tts',
    description: "Plays the given text in Brian's TTS voice.",
    options: [
      {
        name: 'text',
        description: 'The text to play.',
        required: true,
        type: 'STRING'
      }
    ]
  },
  category: 'fun',
  async execute(interaction, client) {
    if (!interaction.member.voice.channel)
      return void (await interaction.reply({
        content: 'You must be in a voice channel.',
        ephemeral: true
      }));

    const perms = interaction.member.voice.channel
      .permissionsFor(client.user.id)
      ?.missing(['CONNECT', 'SPEAK']);

    if (perms?.length)
      return void (await interaction.reply({
        content: `I must have both of the \`Connect\` and \`Speak\` permissions in your voice channel to perform this action.\n\nMissing: ${perms
          .map(
            (p) =>
              `\`${p
                .replaceAll('_', ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}\``
          )
          .join(', ')}`,
        ephemeral: true
      }));

    await interaction.deferReply();

    const text = encodeURIComponent(interaction.options.getString('text'));

    const buffer = await fetch(base + text)
      .then((res) => res.buffer())
      .catch(() => null);

    if (!buffer)
      return void (await interaction.followUp({
        content:
          "The StreamElements API doesn't seem to be working currently, try again later.",
        ephemeral: true
      }));

    const connection = await joinVoiceChannel({
      channelId: interaction.member.voice.channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });

    await interaction.followUp({
      content: 'Now playing your text.'
    });

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: Pause
      }
    });

    connection.subscribe(player);

    player.play(createAudioResource(Readable.from(buffer)));

    player.on('error', async () => {
      await interaction.followUp({
        content: 'An error occured while playing your text.'
      });

      player.stop();
      connection.destroy();
    });

    player.on(Idle, () => {
      player.stop();
      connection.destroy();
    });
  }
};
