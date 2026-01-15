# ChatDalta 🤖

**ChatDalta** is a modern, full-stack AI chatbot application built with **Next.js 16**, **MongoDB**, and the **Vercel AI SDK**. Create and manage multiple AI projects, each with custom system prompts, model selection, and document-based context (RAG-lite).

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-9-green?style=flat-square&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🔐 **User Authentication** – Secure JWT-based authentication with registration and login
- 📁 **Multi-Project Management** – Create and manage multiple chatbot projects
- 🎯 **Custom System Prompts** – Configure unique AI personalities for each project
- 🤖 **Multiple AI Models** – Choose from various AI models via OpenRouter
- 📄 **File Upload (RAG-lite)** – Upload PDF, TXT, and Markdown files to provide context
- 💬 **Persistent Chat History** – Messages are saved to MongoDB per project
- 🎨 **Modern UI** – Beautiful glassmorphic design with Framer Motion animations
- 📱 **Responsive Design** – Works seamlessly on desktop and mobile devices
- ⚡ **Real-time Streaming** – AI responses stream in real-time

## 🛠️ Tech Stack

| Category           | Technology                  |
| ------------------ | --------------------------- |
| **Framework**      | Next.js 16 (App Router)     |
| **Language**       | TypeScript                  |
| **Database**       | MongoDB + Mongoose          |
| **AI SDK**         | Vercel AI SDK + OpenRouter  |
| **Styling**        | Tailwind CSS 4              |
| **UI Components**  | Radix UI + shadcn/ui        |
| **Animations**     | Framer Motion               |
| **Authentication** | JWT (jose)                  |
| **Markdown**       | React Markdown + remark-gfm |

## 📦 Installation

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB instance)
- OpenRouter API key ([Get one here](https://openrouter.ai/keys))

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd chatdalta
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # MongoDB Connection String
   MONGODB_URI=mongodb+srv://username:password@yourcluster.xxxxx.mongodb.net/chatdalta?retryWrites=true&w=majority

   # JWT Secret (Generate a strong random string)
   JWT_SECRET=your-super-secret-jwt-key-here-change-this

   # OpenRouter API Key
   OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

## 📂 Project Structure

```
chatdalta/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── chat/         # Chat streaming endpoint
│   │   │   └── projects/     # Project CRUD & file upload
│   │   ├── chat/[id]/        # Chat interface page
│   │   ├── dashboard/        # Project management dashboard
│   │   ├── login/            # Login page
│   │   └── register/         # Registration page
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utilities (db, auth, utils)
│   ├── models/               # Mongoose models
│   │   ├── User.ts           # User model
│   │   ├── Project.ts        # Project model
│   │   ├── Message.ts        # Message model
│   │   └── Source.ts         # Uploaded source model
│   └── middleware.ts         # Auth middleware
├── public/                   # Static assets
└── package.json
```

## 🔧 Usage

### Creating a Project

1. Register or login to your account
2. Navigate to the dashboard
3. Click "Create Project"
4. Configure a name, system prompt, and select an AI model
5. Start chatting!

### Uploading Documents

1. Open a project chat
2. Click the paperclip icon
3. Upload a PDF, TXT, or Markdown file
4. The AI will use the document content as context for responses

### Selecting AI Models

Projects support multiple AI models via OpenRouter, including:

- **Meta Llama 3.3 70B** (default, free tier)
- Other models available through OpenRouter

## 🔒 Security

- Passwords are hashed using **bcrypt**
- JWT tokens are signed with **jose**
- Protected routes via middleware
- Project isolation per user

## 📝 License

This project is private and not licensed for public use.

---

Built with ❤️ using Next.js and the Vercel AI SDK
