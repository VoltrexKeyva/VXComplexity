import {
  uniqueNamesGenerator,
  adjectives,
  names,
  countries,
  languages
} from 'unique-names-generator';

export default {
  data: {
    name: 'random-name',
    description: 'Generates a random name.',
    options: [
      {
        name: 'length',
        description: 'The amount words to generate in the name.',
        required: false,
        type: 'INTEGER',
        choices: [
          {
            name: '1',
            value: 1
          },
          {
            name: '2',
            value: 2
          },
          {
            name: '3',
            value: 3
          },
          {
            name: '4',
            value: 4
          }
        ]
      }
    ]
  },
  category: 'fun',
  async execute(interaction) {
    const length = interaction.options.getInteger('length') ?? 3;

    await interaction.reply({
      content: uniqueNamesGenerator({
        dictionaries: [adjectives, names, countries, languages],
        separator: ' ',
        style: 'capital',
        length
      })
    });
  }
};
