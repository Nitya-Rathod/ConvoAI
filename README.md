# ConvoAI 🤖💬

A full-stack, ChatGPT-style AI chat application built with the MERN stack, powered by Groq's LLM API. ConvoAI supports persistent threaded conversations, prompt editing with regeneration, syntax-highlighted code blocks with one-click copy, and a polished, responsive dark-themed UI.

**🔗 Live Demo:** (#)

---

## 📸 Screenshots

> Add 2–4 screenshots or a GIF here showing: chat interface, code block with copy button, sidebar with threads, and mobile responsive view.

```
![Chat Interface](./screenshots/chat-interface.png)
![Code Copy Feature](./screenshots/code-copy.png)
```

---

## ✨ Features

- 🔐 **Authentication** — Secure JWT-based auth with httpOnly cookies and bcrypt password hashing
- 🧵 **Threaded Chat History** — Multiple conversation threads, persisted per user
- ✏️ **Edit & Regenerate** — Edit a previously sent prompt and regenerate the AI response
- 📝 **Rename & Delete Threads** — Full thread management from the sidebar
- 🔔 **Toast Notifications** — Real-time feedback for actions, errors, and network issues
- 🎨 **Syntax Highlighting** — Language-aware code block rendering via `rehype-highlight`
- 📋 **One-Click Copy Code** — Hover-to-reveal copy button on every code block, with indentation preserved
- 📱 **Responsive UI** — Collapsible sidebar and mobile-friendly layout
- 🛡️ **Protected Routes** — Client and server-side route protection for authenticated pages
- 🗄️ **MongoDB Persistence** — All threads and messages stored via Mongoose schemas
- 🔄 **Auto-scroll —** Automatically scrolls to the newest AI response during conversations
- 📄 **Markdown Rendering —** AI responses support Markdown formatting
- 🔒 **Session Persistence —** User stays logged in across refreshes using httpOnly JWT cookies
---

## 🛠️ Tech Stack

**Frontend**
- React (Vite)
- React Router
- React Markdown + rehype-highlight
- React Hot Toast
- CSS (custom, dark theme)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken) + bcrypt
- express-rate-limit
- Groq API (`llama-3.1-8b-instant`)

**Deployment**
- Frontend: Vercel
- Backend: Render
- Database : MongoDB Atlas

---

## 🏗️ Architecture Overview

```
┌─────────────┐        HTTPS/JSON         ┌──────────────┐        ┌──────────────┐
│   React     │ ───────────────────────►  │   Express    │ ────►  │   MongoDB    │
│  (Vercel)   │ ◄─────────────────────── │   (Render)   │ ◄────  │  (Atlas)     │
└─────────────┘      httpOnly cookies      └──────┬───────┘        └──────────────┘
                                                    │
                                                    ▼
                                            ┌──────────────┐
                                            │  Groq LLM API │
                                            └──────────────┘
```

- **Auth flow:** Client sends credentials → server issues JWT in an httpOnly cookie → cookie is validated on protected routes via middleware.
- **Chat flow:** User prompt → Express route → Groq API call → response saved to MongoDB thread → returned to client.

---

## 📂 Project Structure

```
ConvoAI/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── AuthContext.jsx
│   │   ├── MyContext.jsx
│   │   ├── Chat.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── CodeBlock.jsx
│   │   └── api.js
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local instance or MongoDB Atlas)
- A Groq API key ([console.groq.com](https://console.groq.com))

### 1. Clone the repository
```bash
git clone https://github.com/your-username/convoai.git
cd convoai
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `/server`:
```env
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create a `.env` file in `/client`:
```env
VITE_API_BASE_URL=http://localhost:8080
```

```bash
npm run dev
```

The app should now be running at `http://localhost:5173`.

---

## 🐛 Notable Challenges & Debugging

A few real issues solved while building this project:

- **Silent render failures** caused by a missing `return` inside a `.map()` — a good reminder that JS doesn't always fail loudly.
- **State shape mismatch:** `setPrevChats` was being passed a full thread object instead of `res.messages`, causing chat history to render incorrectly.
- **API migration:** Switched from Gemini 1.5/2.0 Flash to Groq's `llama-3.1-8b-instant` after hitting regional quota limits — required reworking the request/response handling for the new API shape.
- **Field name mismatch:** A `400 Bad Request` traced back to the frontend sending `message` while the backend expected `msg`.
- **Copy-to-clipboard indentation bug:** Initially used `innerText` to extract code text, which collapsed whitespace due to CSS rendering rules; switched to `textContent` to preserve exact formatting.
- **Cross-origin authentication:** Configured secure httpOnly cookies to support authentication across Vercel (frontend) and Render (backend), handling SameSite and CORS correctly.
---

## 🚀 Future Improvements

- [ ] Stop generation mid-response via `AbortController`
- [ ] Thread search/filter
- [ ] Export conversation as Markdown/PDF
- [ ] Light/dark theme toggle
- [ ] Voice input

---
## 📚 Key Learnings

- Designing scalable React state using Context API
- Managing secure authentication with JWT and httpOnly cookies
- Building RESTful CRUD APIs with Express and MongoDB
- Integrating third-party LLM APIs (Groq)
- Rendering Markdown safely with syntax-highlighted code blocks
  
---
## 🙋 Author

**Nitya Rathod**
- GitHub: [Nitya-Rathod](https://github.com/Nitya-Rathod)
- LinkedIn: [nitya-rathod](https://www.linkedin.com/in/nitya-rathod/)

---

⭐ If you found this project interesting, consider giving it a star!
