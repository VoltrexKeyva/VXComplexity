import { Client } from 'discord.js';
import loader from './loader.js';

const {
  default: { discordToken }
} = await import('./config.json', { assert: { type: 'json' } });

const client = new Client({
  intents: 1935,
  sweepers: {
    messages: { interval: 300 },
    presences: { interval: 300 }
  }
});

await loader(client);

await client.login(discordToken);
