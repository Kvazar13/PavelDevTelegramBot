# Pavel Devs Bot

Telegram bot that answers recruiters’ questions about **Pavel Kozheykin / Павел Кожейкин** using an LLM (DeepSeek Chat, OpenAI‑compatible).  
The bot keeps per‑user context, converts basic Markdown to Telegram‑HTML, and loads its long‑form system prompt from an external file so you can tweak replies without touching code.

---

## ✨ Features

* **Telegraf v4** middleware with session support  
* Connects to **DeepSeek Chat** via the OpenAI‑compatible SDK  
* External **`system_prompt.txt`** for easy prompt iteration  
* Lightweight Markdown → HTML converter to preserve basic formatting in Telegram  
* Nodemon setup for hot reloading in development  
* Graceful shutdown on `SIGINT` / `SIGTERM`

---

## 📦 Requirements

* **Node.js ≥ 18**  
* Telegram Bot Token (`TELEGRAM_TOKEN`)  
* DeepSeek API Key (`DEEPSEEK_API_KEY`)  
* A `system_prompt.txt` file in the project root

---

## 🚀 Getting Started

```bash
# 1. Clone and install
git clone https://github.com/your‑org/pavel‑devs‑bot.git
cd pavel‑devs‑bot
npm install

# 2. Create .env
cp .env.example .env
# then edit TELEGRAM_TOKEN and DEEPSEEK_API_KEY

# 3. Add your system prompt
nano system_prompt.txt   # or your favourite editor

# 4. Run in dev mode (auto‑restart)
npm run dev
```

Production:

```bash
npm start        # runs node index.js
```

---

## 🛠️  Environment Variables (`.env`)

| Key                | Description                                                |
|--------------------|------------------------------------------------------------|
| `TELEGRAM_TOKEN`   | Token provided by @BotFather                               |
| `DEEPSEEK_API_KEY` | API key for DeepSeek (OpenAI‑compatible)                   |

---

## 🗄️  Project Structure

```
.
├── index.js              # entry point
├── system_prompt.txt     # long system prompt (editable)
├── package.json
├── .env.example
└── README.md
```

---

## 🔧  NPM Scripts

| Script | Purpose                          |
|--------|----------------------------------|
| `dev`  | Start with **nodemon** watching `src` |
| `start`| Start with `node` (production)   |
| `test` | Placeholder test script          |

---

## 🤖  Editing the Prompt

1. Open **`system_prompt.txt`**  
2. Modify wording, capabilities, or guard‑rails as needed  
3. Save – changes take effect on the next user message (no restart required)

---

## 📝  License

ISC © 2025 Pavel Kozheykin