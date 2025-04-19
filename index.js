require('dotenv').config()

const fs = require('fs')
const { OpenAI } = require('openai')
const { Telegraf, session } = require('telegraf')

const aiKey = process.env.DEEPSEEK_API_KEY;

const route = `/bot${process.env.TELEGRAM_TOKEN}`
const PORT  = process.env.PORT || 3000


if (!process.env.TELEGRAM_TOKEN) {
    console.error('Error: TELEGRAM_TOKEN is not set in the .env file.');
    process.exit(1);
}

if (!aiKey) {
    console.error('Error: OPENAI_API_KEY is not set in the .env file.');
    process.exit(1);
}

// const openai = new OpenAI()

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: aiKey
});

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

const loadSystemPrompt = () =>
    fs.readFileSync('system_prompt.txt', 'utf8').trim()

bot.use(
    session({
        defaultSession: () => ({
            messages: [{ role: 'system', content: loadSystemPrompt() }]
        })
    })
)

const MAX_MESSAGES = 10;

const mdToTelegramHtml = (md) => md
    .replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
    .replace(/^#{1,6}\s*(.+)$/gm, '<b>$1</b>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/^- (.+)$/gm, '• $1')

const sendReply = async (ctx, text) => {
    await ctx.reply(mdToTelegramHtml(text), { parse_mode: 'HTML' })
}

/**
 * Handles incoming messages from users.
 * Maintains conversation history and interacts with OpenAI's ChatCompletion API.
 */
bot.on('message', async (ctx) => {
    try {
        const userQuestion = ctx.message.text;
        console.log(`Received message from user ${ctx.from.id}: ${userQuestion}`);

        ctx.session.messages.push({ role: 'user', content: userQuestion });
        if (ctx.session.messages.length > MAX_MESSAGES) {
            ctx.session.messages = ctx.session.messages.slice(-MAX_MESSAGES);
        }

        const completion = await openai.chat.completions.create({
            // model: "gpt-4o-mini",
            model: "deepseek-chat",
            messages: ctx.session.messages,
        });

        const answer = completion.choices[0].message.content.trim();
        ctx.session.messages.push({ role: 'assistant', content: answer });

        await sendReply(ctx, answer);
    } catch (error) {
        console.error('Error processing message:', error);
        await ctx.reply('An error occurred while processing your request. Please try again later.');
    }
});

/**
 * Launches the bot and handles graceful shutdown.
 */
;(async () => {
    // 1. Registrar el webhook en Telegram
    await bot.telegram.setWebhook(`${process.env.PUBLIC_URL}${route}`)

    // 2. Levantar el servidor interno de Telegraf
    bot.startWebhook(route, null, PORT)

    console.log(`Webhook activo en puerto ${PORT}`)
})()