/**
 * @fileoverview Telegram bot integrated with OpenAI API to answer questions about Pavel's experience.
 * Maintains conversation context for each user using session middleware.
 */

require('dotenv').config()
const { OpenAI } = require('openai')
const { Telegraf, session } = require('telegraf')

if (!process.env.TELEGRAM_TOKEN) {
    console.error('Error: TELEGRAM_TOKEN is not set in the .env file.');
    process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is not set in the .env file.');
    process.exit(1);
}

const openai = new OpenAI()

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.use(session({
    defaultSession: () => ({
        messages: [{ role: 'system', content: generateSystemPrompt() }]
    })
}));
const MAX_MESSAGES = 10;

/**
 * Generates the system prompt with Pavel's professional background.
 * Modify this function to include more detailed information about Pavel as needed.
 * @returns {string} The system prompt for OpenAI.
 */
const generateSystemPrompt = () => {
    return `You are an assistant knowledgeable about Pavel's professional background, experiences, skills, and history. Answer recruiters' questions based on this information. Do not disclose any private or sensitive information.`;
};

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
            model: "gpt-4o-mini",
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
const main = async () => {
    try {
        await bot.launch();
        console.log('Bot started successfully.');
    } catch (error) {
        console.error('Failed to launch the bot:', error);
        process.exit(1);
    }

    process.once('SIGINT', () => {
        console.log('Received SIGINT. Shutting down gracefully...');
        bot.stop('SIGINT');
    });
    process.once('SIGTERM', () => {
        console.log('Received SIGTERM. Shutting down gracefully...');
        bot.stop('SIGTERM');
    });
};

main();