require('dotenv').config()

const fs = require('fs')
const { OpenAI } = require('openai')
const { Telegraf, session } = require('telegraf')

const aiKey = process.env.DEEPSEEK_API_KEY;

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

        await ctx.reply(answer);
    } catch (error) {
        console.error('Error processing message:', error);
        await ctx.reply('An error occurred while processing your request. Please try again later.');
    }
});

/**
 * Launches the bot and handles graceful shutdown.
 */
;(async () => {
    await bot.launch()
    console.log('Bot lanzado.')

    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
})()