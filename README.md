# The Choice Experiment - Prisoner's Dilemma

A Kahoot-style social experiment app where participants join rooms and make choices between cooperation and defection. Built with React, Vite, and Supabase for real-time tracking.

## 🎯 Features

- **Room-based Sessions**: Like Kahoot, create rooms with unique codes
- **Real-time Updates**: Admin sees participant choices instantly
- **Simple Join Flow**: Users enter name + room code to participate
- **Live Admin Panel**: Track who's in the room and what they chose
- **No Registration**: Keep it simple - just names and room codes
- **Modern Stack**: React + Vite for fast, clean development

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Once created, go to **Project Settings > API**
4. Copy your **Project URL** and **anon public** API key

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

(You can also copy `.env.example` and fill in your values)

### 4. Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire SQL schema from `src/config/supabase.js`
3. Paste and run it in the SQL Editor
4. This creates:
   - `rooms` table (stores room sessions)
   - `participants` table (stores users and their choices)
   - Indexes for performance
   - Row Level Security policies
   - Real-time subscriptions

### 5. Run the App

**Development:**
```bash
npm run dev
```

**Build for Production:**
```bash
npm run build
```

**Preview Production Build:**
```bash
npm run preview
```

## 📖 How to Use

### For Admins (Experiment Hosts):

1. Run `npm run dev`
2. Click **"Create New Room"**
3. You'll get a 6-character room code (e.g., ABC123)
4. Share this code with participants
5. Watch real-time as participants join and make choices

### For Participants:

1. Visit the app URL
2. Enter your name
3. Enter the room code given by admin
4. Click **"Join Room"**
5. Make your choice: Cooperate or Defect
6. Can change choice anytime

## 🚀 Deploy to Vercel

### One-Click Deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deploy:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

Vercel will automatically detect Vite and configure the build settings!

## 📁 Project Structure

```
2_choices/
├── src/
│   ├── pages/
│   │   ├── Home.jsx          # Landing page (join/create rooms)
│   │   ├── Home.css
│   │   ├── Choice.jsx         # Participant choice interface
│   │   ├── Choice.css
│   │   ├── Admin.jsx          # Admin control panel
│   │   └── Admin.css
│   ├── config/
│   │   └── supabase.js        # Supabase config & schema
│   ├── lib/
│   │   └── supabaseClient.js  # Supabase client instance
│   ├── App.jsx                # Main app with routing
│   ├── App.css                # Global styles
│   └── main.jsx               # Entry point
├── index.html                 # Vite entry HTML
├── package.json
├── vite.config.js
├── vercel.json                # Vercel config
└── .env                       # Environment variables (create this)
```

## 🎮 Features in Detail

### Admin Panel (`/admin`)
- See total participants, cooperation rate, defection rate
- Live list of all participants with their choices
- Real-time updates via Supabase subscriptions (no refresh needed)
- Copy room code button
- Close room when done
- Create new room

### Participant View (`/choice`)
- Clean, simple interface
- Room code and name displayed
- Choice confirmation
- Ability to change choice
- Leave room anytime

### Home Page (`/`)
- Join existing room with name + code
- Create new room (admin)
- Simple, intuitive UI

## 🔧 Technical Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime subscriptions
- **Styling**: CSS (component-scoped)
- **Deployment**: Vercel-ready
- **Build Tool**: Vite (super fast HMR)

## 🎨 Customization

You can easily customize:
- Button text (change "Cooperate/Defect" in JSX files)
- Colors (edit CSS files in `src/pages/`)
- Room code length (change in `Home.jsx`)
- Add more choice options (modify database schema and components)

## 📊 Use Cases

- Psychology experiments
- Team building exercises
- Economics research
- Game theory demonstrations
- Educational purposes

## 🔒 Security Note

This app uses public Supabase policies for simplicity. For production use with sensitive data, implement proper authentication and row-level security.

## 🛠️ Development Tips

- Hot Module Replacement (HMR) works out of the box with Vite
- Component styles are scoped to avoid conflicts
- React DevTools recommended for debugging
- Use `console.log` to debug Supabase queries during development

---

Built with ❤️ using React, Vite, and Supabase for social experiments and game theory exploration!
