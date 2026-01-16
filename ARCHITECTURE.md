# System Architecture & Design Optimization

This document provides a comprehensive overview of the **ChatDalta** architecture, detailing the design philosophy, technical choices, and data flow of the application.

## 🏗️ High-Level Architecture

ChatDalta is built as a modular, full-stack application leveraging the **Next.js App Router**. It follows a **Monolithic Split** architecture:

- **Frontend**: A highly interactive React application with client-side state management for chat sessions and streaming.
- **Backend**: Serverless API routes that manage authentication, database interactions via Mongoose, and LLM orchestration using the Vercel AI SDK.

## 🛠️ Technical Rationale

### 1. Framework: Next.js (App Router)

- **Hybrid Rendering**: Utilizes Server Components for data fetching (e.g., dashboard project lists) and Client Components for interactive elements (e.g., real-time chat streaming).
- **Middleware**: Intercepts requests for centralized authentication (JWT verification) without cluttering individual route handlers.

### 2. Database: MongoDB & Mongoose

- **Flexible Schema**: Crucial for storing varying AI model configurations and chat message histories.
- **Project-Centric Modeling**: Data is partitioned by `projectId`, making it easy to fetch all messages and context sources associated with a specific chatbot personality.

### 3. AI Orchestration: Vercel AI SDK

- **Streaming Native**: Built-in support for `streamText`, which enables the "typing" effect essential for a modern AI experience.
- **OpenRouter Integration**: Standardized interface to switch between diverse models (Llama, GPT, Claude) without changing the core business logic.

---

## 💾 Data Model & Schema Design

The database schema is designed for scalability and isolation:

- **User**: Stores credentials (hashed passwords) and usage metrics (token counts).
- **Project**: The core entity. Contains the `system_prompt` (AI personality) and `model_config`. Each project belongs to a `User`.
- **Message**: Represents individual chat turns. Linked to a `Project` via `projectId`.
- **Source**: Stores text extracted from uploaded PDF/TXT/MD files. These are used for dynamic context injection (RAG-lite).

---

## 📡 Key Workflows

### 1. Authentication Flow (JWT)

1. User logs in/registers via `/api/auth/login`.
2. Server generates a JWT using `jose`, signed with `JWT_SECRET`.
3. Token is stored in a secure, HTTP-only cookie.
4. `middleware.ts` verifies this cookie for all protected routes (`/dashboard`, `/chat`, `/api/projects/*`).

### 2. RAG-lite (Context Injection)

Unlike traditional RAG which uses vector databases, ChatDalta uses a **Lite RAG** approach for simplicity and speed:

1. **Upload**: Files are parsed on the server (`pdf2json` for PDFs).
2. **Storage**: The plain text is saved in the `Source` collection.
3. **Inquiry**: During a chat request, the system fetches the latest 3 sources for the project.
4. **Prompt Augmentation**: The content of these sources is appended to the `system_prompt` before being sent to the LLM.

### 3. Real-time Chat Streaming

1. Frontend calls `/api/chat` with the message history and `projectId`.
2. Backend fetches the project settings and context sources.
3. `streamText` is initiated with the augmented prompt.
4. The server-streamed response is handled by the `useChat` hook, updating the UI in real-time.
5. `onFinish` callback saves the assistant's final response to MongoDB for persistence.

---

## 🎨 UI/UX Design Principles

### 1. Glassmorphic Aesthetics

- Uses semi-transparent backgrounds with backdrop blur (`backdrop-blur-md`) and subtle borders to create depth.
- **Theme Support**: Implements CSS variables for seamless switching between Dark and Light modes.

### 2. Performance Optimization

- **Optimistic Updates**: (In development) Ensuring UI elements react immediately to user input.
- **Lazy Loading**: Dynamic imports for heavy models or components to reduce initial bundle size.

### 3. Type Safety

- Strict TypeScript enforcement across both frontend components and backend API responses, reducing runtime errors and improving developer experience.
