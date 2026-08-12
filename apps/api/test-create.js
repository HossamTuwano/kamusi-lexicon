const http = require('http');

const payload = {
  word: 'gari',
  partOfSpeech: 'noun',
  plural: 'magari',
  synonyms: ['motokaa'],
  derivedWords: ['dereva'],
  dialect: 'Kiswahili sanifu',
  source: 'test',
  senses: [
    {
      definition: 'Chombo cha usafiri kinachotumika kubeba watu au mizigo.',
      usageNote: 'Matumizi ya kawaida.',
      examples: [{ sentence: 'Nimenunua gari jipya.', note: 'Mfano' }],
    },
  ],
};

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/entries',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MjMyNjAwMDB9.test'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', e => console.error('Error:', e));
req.write(JSON.stringify(payload));
req.end();
