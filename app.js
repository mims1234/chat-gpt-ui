const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const port = 3111;

const md = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="code-container"><div class="code-header"><span class="language-label">${lang}</span><button class="copy-button" onclick="copyCode(this)">Copy code</button></div><code class="hljs language-${lang}">${hljs.highlight(str, { language: lang }).value}</code></pre>`;
      } catch (__) {}
    }
    return '<pre class="code-container"><div class="code-header"><span class="language-label">text</span><button class="copy-button" onclick="copyCode(this)">Copy code</button></div><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
  const messages = req.session.messages || [];
  const selectedModel = req.session.selectedModel || 'gpt-3.5-turbo'; // Default model
  res.render('index', { messages, selectedModel });
});

app.post('/ask', async (req, res) => {
  const { prompt, model } = req.body;

  // Store the selected model in the session if provided
  if (model) {
    req.session.selectedModel = model;
  }

  // Use the stored model or default to 'gpt-3.5-turbo'
  const selectedModel = req.session.selectedModel || 'gpt-3.5-turbo';

  req.session.messages = req.session.messages || [];
  const now = new Date();
  const formattedDateTime = now.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
  });

  req.session.messages.push({ role: 'system', content: formattedDateTime });
  req.session.messages.push({ role: 'user', content: prompt });

  const startTime = Date.now();

  try {
    let chatCompletion;
    if (selectedModel.startsWith('gpt')) {
      chatCompletion = await getOpenAIChatCompletion(req.session.messages, selectedModel);
    } else {
      chatCompletion = await getGroqChatCompletion(req.session.messages, selectedModel);
    }

    const reply = chatCompletion.choices[0]?.message?.content || "";
    const tokensUsed = chatCompletion.usage.total_tokens;

    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    const timeTakenString = timeTaken < 1000
      ? `${timeTaken} ms`
      : timeTaken < 60000
        ? `${(timeTaken / 1000).toFixed(1)} seconds`
        : `${(timeTaken / 60000).toFixed(1)} minutes`;

    const renderedReply = md.render(reply);

    req.session.messages.push({ role: 'assistant', content: reply, renderedContent: renderedReply, timeTaken: timeTakenString, tokensUsed, model: selectedModel });

    res.render('index', { messages: req.session.messages, selectedModel });
  } catch (error) {
    console.error(error);
    res.render('index', { messages: req.session.messages, error: 'Sorry, there was an error processing your request.', selectedModel });
  }
});


async function getOpenAIChatCompletion(messages, model) {
  const formattedMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    { model, messages: formattedMessages },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}

async function getGroqChatCompletion(messages, model) {
  const formattedMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
  return groq.chat.completions.create({
    messages: formattedMessages,
    model
  });
}

app.post('/clear', (req, res) => {
  req.session.messages = [];
  req.session.selectedModel = null; // Clear the selected model
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
