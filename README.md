# SmartNotesAI 🧠✨

SmartNotesAI is a modern notes app with built-in AI-powered study tools. Create, edit, and delete notes with ease — then take it a step further by summarizing them or generating flashcards using AI.

🔗 [Live App](https://smartnotes-b128a.web.app/)

---

## 🚀 Features

- 🔐 Firebase Authentication (Google login)
- 📝 Create, update, and delete notes
- 🤖 AI tools powered by OpenAI:
  - Summarize notes
  - Generate flashcards
- 🎯 Daily limit of 5 AI uses per user
- 📱 Fully responsive design
- 🛡️ reCAPTCHA verification for reset password

---

## 🧰 Tech Stack

- **Frontend:** React.js, Tailwind CSS, React Router, React Hook Form, React Icons, Google reCAPTCHA
- **Backend/Services:** Firebase (Auth, Firestore, Functions, Hosting)
- **AI Integration:** OpenAI API via Firebase Cloud Functions

---

## 🖼️ Screenshots

Comming soon...

---

## ⚙️ Getting Started

Note: You'll need a Firebase project and OpenAI key

To run SmartNotesAI locally:

```bash
# Clone the repository
git clone https://github.com/your-username/smartnotesai.git
cd smartnotesai

# Install dependencies
npm install

# Start the development server
npm run dev
```

# 🔑 Environment Variables
Create a `.env` file in the root directory and add your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_OPENAI_API_KEY=your_openai_key  # Only if used on client side
```

Create a `.env` file in root/functions directory and add your OpenAI key:

```env
OPENAI_API_KEY=your_key_here
```

## 🚀 Deploying Firebase Functions

To deploy the Firebase Functions (backend API), follow these steps:

```bash
# Install Firebase CLI (if not installed already):
npm install -g firebase-tools

# Login to firebase
firebase login

# Navigate to your project directory(should be root/functions):
cd your_project_dir

# Deploy the functions
firebase deploy --only functions
```
# 📝 Notes
This was my first time creating a AI powered app aswell as using firebase functions, so I learned a lot overall from this project and cant wait to build more cool things using the new tools I learned in the future
To prevent abuse, AI usage is currently limited to 5 requests per day. In the future, I plan to add an upgrade system to allow for more.

# 📌 Future Improvements
- Subscription to access more usages/ ai features
- AI powered quizes
- Improvements on current features(summaries/ flashcards)
