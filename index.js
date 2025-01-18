require('dotenv').config()
const { OpenAI } = require('openai')

const { Telegraf } = require('telegraf')
const openai = new OpenAI()

function createBot(token) {
    return new Telegraf(token)
}

async function main() {
    console.log('Starting bot...')
    const bot = createBot(process.env.TELEGRAM_TOKEN)

    bot.on('message', async ctx => {
        try {
            const userQuestion = ctx.message.text
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    {
                        role: "user",
                        content: userQuestion,
                    },
                ],
            });

            const answer = completion.choices[0].message.content
            await ctx.reply(answer)
        } catch (error) {
            await ctx.reply('An error occurred, please try again later.')
        }
    })

    bot.launch()
}

main()