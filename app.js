const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { marked } = require('marked');
const session = require('express-session');

require('dotenv').config();

const app = express();
const port = 3111;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
  const { messages = [], model = 'gpt-3.5-turbo' } = req.session;
  res.render('index', { messages, model, marked });
});

app.post('/ask', async (req, res) => {
  const { prompt, model = 'gpt-3.5-turbo' } = req.body;
  const { messages = [] } = req.session;
  
  messages.push({ role: 'user', content: prompt });
  
  try {
    const { data } = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      { model, messages },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = data.choices[0].message.content;
    messages.push({ role: 'assistant', content: reply });

    req.session.messages = messages;
    req.session.model = model;

    res.render('index', { messages, model, marked });
  } catch (error) {
    console.error(error);
    res.render('index', { messages, model, error: 'Sorry, there was an error processing your request.', marked });
  }
});

app.post('/clear', (req, res) => {
  req.session.messages = [];
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

