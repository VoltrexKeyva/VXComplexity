export const randomCodes = [
  {
    question: `if (something) console.log('Yes');`,
    answer: 'Error'
  },
  {
    question: `const result = 5;
let someVariable = 1;

for (let i = 0; i < 5; i++) someVariable++;

console.log(someVariable - result);`,
    answer: '1'
  },
  {
    question: `let num1 = 1;
const num2 = 7;

for (let i = 0; i < num2; i++) num1 += 3 + i;

console.log(num1 - num2 + 5);`,
    answer: '41'
  },
  {
    question: `let someVariable;
            
switch (someVariable) {
case 1:
  someVariable = 10;
  break;
case 6:
  someVariable = 90;
  break;
case 3:
  someVariable = 100;
}

console.log(someVariable);`,
    answer: 'undefined'
  },
  {
    question: `const person = { name: 'Voltrex' };

function Hi(age) {
return \`${'$'}{this.name} is ${'$'}{age}\`;
}

console.log(typeof Hi.bind(person, 17));`,
    answer: 'function'
  },
  {
    question: `let somePerson = { name: 'Voltrex' };
const members = [somePerson];
somePerson = null;

console.log(members);`,
    answer: "[{ name: 'Voltrex' }]"
  },
  {
    question: `const items = ['🍅', '🍇', '🍊'];
            
let favoriteItem = items.find(item => item === '🍇');

favoriteItem = '🥑';

const leastFavorite = items.indexOf('🍊');

items[leastFavorite] = '🍕';

console.log(items);`,
    answer: "['🍅', '🍇', '🍕']"
  },
  {
    question: `const person = { name: 'Voltrex', age: 17 };
            
const changeAge = (x = {
...person
}) => x.age += 1;

const changeAgeAndName = (x = {
...person
}) => {
x.age++;
x.name = 'Voltrex Master';
};

changeAge(person);

changeAgeAndName();

console.log(person);`,
    answer: "{ name: 'Voltrex', age: 18 }"
  },
  {
    question: `async function* range(start, end) {
  for (let i = start; i <= end; i++) yield Promise.resolve(i);
}

(async () => {
  const gen = range(1, 3);
  const someArray = [];
  for await (const item of gen) someArray.push(item);
  return console.log(someArray.join(' '));
})();`,
    answer: '1 2 3'
  },
  {
    question: `const someValue = 69;

function getInfo() {
console.log(typeof someValue);
const someValue = 'Bruh moment';
}

getInfo();`,
    answer: 'Error'
  },
  {
    question: `(function() {
return typeof arguments;
})();`,
    answer: 'object'
  },
  {
    question: `const f = function g() {
return 69;
};

g();`,
    answer: 'Error'
  },
  {
    question: `(function(x) {
delete x;
return x;
})(1);`,
    answer: '1'
  },
  {
    question: `(function f(f) {
return typeof f();
})(function() {
return 1;
});`,
    answer: 'number'
  },
  {
    question: `const foo = {
bar: function() {
  return this.baz;
},
baz: 1
};

(function() {
return typeof arguments[0]();
})(foo.bar);`,
    answer: 'undefined'
  },
  {
    question: `const foo = {
bar: function() {
  return this.baz;
},
baz: 1
};

typeof (f = foo.bar)();`,
    answer: 'undefined'
  },
  {
    question: `const f = (function f() {
return '1';
}, function g() {
return 2;
})();

typeof f;`,
    answer: 'number'
  },
  {
    question: `let x = 1;
            
if (function f() {}) x += typeof f;

x;`,
    answer: '1undefined'
  },
  {
    question: `(function(foo) {
return typeof foo.bar;
})({
foo: {
  bar: 1
}
});`,
    answer: 'undefined'
  },
  {
    question: `[] == [];`,
    answer: 'false'
  },
  {
    question: `0 == [];`,
    answer: 'true'
  },
  {
    question: `console.log(3 > 2 > 1);`,
    answer: 'false'
  },
  {
    question: `parseInt(1 / 1999999);`,
    answer: '5'
  },
  {
    question: `const x = 5.934;
            
x.toFixed();`,
    answer: '6'
  },
  {
    question: `const x = 9.7990;
            
Math.round(x);`,
    answer: '10'
  },
  {
    question: `const arr1 = [1, 2, 3];
            
let arr2 = [...arr1];

arr2.splice(0, 1);`,
    answer: '[1]'
  },
  {
    question: `function fish(num) {
num = Math.round(num);
return num;
}

fish('fish');`,
    answer: 'NaN'
  },
  {
    question: `'1' - -'1';`,
    answer: '2'
  },
  {
    question: `const [, ...arr] = ['1', '2', '3'].map(x => x + +2);
            
console.log(arr);`,
    answer: "['22', '32']"
  },
  {
    question: `'b' + 'a' + +'a' + 'a';`,
    answer: 'baNaNa'
  },
  {
    question: `const dog = { breed: 'Greyhound' };
            
const newDog = dog;

newDog.breed = 'Pug';

console.log(dog.breed);`,
    answer: 'Pug'
  },
  {
    question: `const user = {
 500: {
    name: 'Voltrex'
 },
 501: {
    name: 'Bruh'
 }
};

const updatedUser = {
 ...user
};

updatedUser[500].name = 'Voltrex Master';

console.log(user[500].name);`,
    answer: 'Voltrex Master'
  },
  {
    question: `const follower = {
   count: 5980,
   toString() {
      return follower.count++;
   }
};

if (follower === 5979 && follower === 5980 && follower === 5981) {
   console.log('Awesome');
} else {
   console.log('Cool');
}`,
    answer: 'Cool'
  },
  {
    question: `const url = 'https://www.google.com';
            
const result = (function result(url) {
return url.split('.').pop();
})(url);

console.log(result);`,
    answer: 'com'
  },
  {
    question: `console.log(('10' / 5) * '5' - '2' + '5');`,
    answer: '85'
  },
  {
    question: `const animals = ['Lion', 'Camel', 'Elephant', 'Cow', 'Duck', 'Cat'];
            
animals.slice(3, 6);`,
    answer: "['Cow', 'Duck', 'Cat']"
  },
  {
    question: `const people = [{
    name: 'Voltrex',
    age: Infinity
  },
 {
    name: 'Bruh',
    age: 27
  },
 {
    name: 'Wtf',
    age: 18
  }
];

people.find(person => person.age < 25);`,
    answer: "{ name: 'Wtf', age: 18 }"
  }
];

export const supportedFormats = [
  '.mp3',
  '.ogg',
  '.mp4',
  '.wav',
  '.aiff',
  '.au',
  '.flac',
  '.ape',
  '.wv',
  '.tta',
  '.atrac',
  '.m4a'
];

export const workPlaceholders = [
  'You worked as a programmer and gained',
  'You worked as a scientist and earned',
  'You worked as a company manager and gained',
  'You worked as a robber and robbed',
  'You worked as a YouTuber and earned',
  'You streamed on twitch on got donated',
  'You worked as a Farmer and gained',
  'You worked as an Artist and earned',
  'You worked as a Chef and earned'
];

export const statusObj = {
  null: '**Not available**',
  operational: '<:TickGreen:715595196032745643>',
  degraded_performance: '<:TickYellow:715595910289031281>',
  partial_outage: '<:TickRed:715596034646081558>',
  major_outage: '<:CrossRed:715595326513217677>'
};

export const eightBallAnswers = [
  'It is certain',
  'It is decidedly so',
  'Without a doubt',
  'Yes - definitely',
  'You may rely on it',
  'As i see it, Yes',
  'Most likey',
  'Outlook good',
  'Yes',
  'Signs point to yes',
  "Ask me again later when I'm not busy with your mom",
  'Reply hazy, try again',
  'Ask again later',
  'Better not to tell you now',
  'Cannot predict now',
  'Concentrate and ask again',
  'You already know the answer, you idiot',
  'idk, ask the kids in your basement',
  "Don't count on it",
  'My reply is no',
  'My sources say no',
  'Outlook not so good',
  'Very doubtful'
];

export const fonts = [
  {
    path: './whitneylight.otf',
    family: 'WhitneyLight'
  },
  {
    path: './whitneybold.otf',
    family: 'WhitneyBold'
  },
  {
    path: './NotoSansJP-Regular.otf',
    family: 'NotoSansJapenese'
  },
  {
    path: './Symbola_hint.ttf',
    family: 'Symbola'
  },
  {
    path: './Code2001.ttf',
    family: 'Code2001'
  },
  {
    path: './whitneybook.otf',
    family: 'WhitneyBook'
  }
];

import { MessageActionRow, MessageButton } from 'discord.js';

const buttons = {
  stop: new MessageButton()
    .setStyle('DANGER')
    .setCustomId('stop')
    .setEmoji('848531864172101642'),
  close: new MessageButton()
    .setStyle('DANGER')
    .setCustomId('close')
    .setEmoji('848533337308004402'),
  firstPage: new MessageButton()
    .setStyle('PRIMARY')
    .setCustomId('first_page')
    .setEmoji('848527584744701962'),
  lastPage: new MessageButton()
    .setStyle('PRIMARY')
    .setCustomId('last_page')
    .setEmoji('848528272782393344'),
  previous: new MessageButton()
    .setStyle('PRIMARY')
    .setCustomId('previous')
    .setEmoji('848526566723944458'),
  next: new MessageButton()
    .setStyle('PRIMARY')
    .setCustomId('next')
    .setEmoji('848526034206326814')
};

export const paginatorModels = {
  1: [new MessageActionRow().addComponents(buttons.close)],
  2: [
    new MessageActionRow().addComponents(buttons.previous, buttons.next),
    new MessageActionRow().addComponents(buttons.stop, buttons.close)
  ],
  3: [
    new MessageActionRow().addComponents(
      buttons.firstPage.setDisabled(true),
      buttons.previous,
      buttons.next,
      buttons.lastPage
    ),
    new MessageActionRow().addComponents(buttons.stop, buttons.close)
  ]
};

export const boostLevels = {
  0: '<:boost_0:715860819195461832>',
  get 1() {
    return this[0];
  },
  2: '<:boost_e:715860966855802880>',
  3: '<:booster3:585764446220189716>',
  get 4() {
    return this[3];
  },
  get 5() {
    return this[3];
  },
  6: '<:boost_b:715860665301991437>',
  get 7() {
    return this[6];
  },
  get 8() {
    return this[6];
  },
  9: '<:boost_a:715860471084875809>',
  get 10() {
    return this[9];
  },
  get 11() {
    return this[9];
  },
  12: '<:boost_st:715861027484336169>',
  get 13() {
    return this[12];
  },
  get 14() {
    return this[12];
  },
  15: '<:booster:660789028861509633>',
  get 16() {
    return this[15];
  },
  get 17() {
    return this[15];
  },
  18: '<:ServerBooster_m:720195724226199562>',
  get 19() {
    return this[18];
  },
  get 20() {
    return this[18];
  },
  get 21() {
    return this[18];
  },
  get 22() {
    return this[18];
  },
  get 23() {
    return this[18];
  }
};

export const badges = {
  DISCORD_EMPLOYEE: '<:DiscordEmployee:705858982836961330>',
  PARTNERED_SERVER_OWNER: '<:discord_partner:748998627015393311>',
  HYPESQUAD_EVENTS: '<:DiscordHypeSquadEvents:705861903175647344>',
  BUGHUNTER_LEVEL_1: '<:DiscordBugHunter:705862833925259377>',
  HOUSE_BRAVERY: '<:DiscordBravery:705865208123490327>',
  HOUSE_BRILLIANCE: '<:DiscordBrilliance:705865950829740064>',
  HOUSE_BALANCE: '<:DiscordBalance:705866474841178144>',
  EARLY_SUPPORTER: '<:DiscordEarlySupporter:705866972142895227>',
  TEAM_USER: '**[ Team User ]**',
  SYSTEM: '<:DiscordSystem:705872771636265003>',
  BUGHUNTER_LEVEL_2: '<:DiscordBugHunter2:705874823611416596>',
  VERIFIED_BOT: '<:DiscordVerifiedBot:705876359506952303>',
  EARLY_VERIFIED_BOT_DEVELOPER:
    '<:DiscordEarlyVerifiedBotDev:705876864714932264>',
  DISCORD_CERTIFIED_MODERATOR: '<:certifiedmod:853274382339670046>'
};
