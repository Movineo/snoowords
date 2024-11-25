# SnooWords - Reddit Word Game

A delightful and social word game built for the Reddit Games and Puzzles Hackathon 2024.

## 🎮 How to Play

1. Enter your Reddit username to start
2. You'll get a grid of letters to form words
3. Create as many words as possible within 60 seconds
4. Use power-ups to boost your score:
   - ⏰ Time Bonus: Adds 10 seconds
   - 2️⃣ Double Points: Next word scores double
   - 🔄 Shuffle: Rearrange letters
   - ⭐ Power Letter: Adds a high-value letter

## 🏆 Features

- Real-time leaderboards (daily and all-time)
- Daily challenges with unique themes
- Reddit-specific achievements
- Community power-ups and rewards
- Multiplayer interactions through comments
- Beautiful, Reddit-themed UI

## 🛠️ Built With

- React + TypeScript
- Zustand for state management
- Supabase for backend
- Tailwind CSS for styling
- Reddit Developer Platform
- Vite for bundling

## 🚀 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Supabase and Reddit credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   
   # Reddit API Configuration
   VITE_REDDIT_CLIENT_ID=your_client_id_here
   VITE_REDDIT_CLIENT_SECRET=your_client_secret_here
   VITE_REDDIT_REDIRECT_URI=http://localhost:5173/auth/callback
   VITE_ENABLE_REDDIT_INTEGRATION=true
   ```
4. Set up your Reddit Application:
   - Go to https://www.reddit.com/prefs/apps
   - Click "Create Application" or "Create Another Application"
   - Fill in the following:
     * Name: SnooWords
     * App type: web app
     * Description: A word game for Reddit
     * About URL: Your repository URL
     * Redirect URI: http://localhost:5173/auth/callback
   - Copy the generated client ID and secret to your `.env` file
5. Create a test subreddit:
   - Go to https://www.reddit.com/subreddits/create
   - Name: SnooWords (or any available name)
   - Type: Public
   - Update the `REDDIT_CONFIG.SUBREDDIT` in `src/config/reddit.ts`
6. Start the development server:
   ```bash
   npm run dev
   ```

## 🎯 Game Mechanics

- Words must be at least 3 letters long
- Each letter has a point value (similar to Scrabble)
- Bonus points for:
  - Longer words
  - Using rare letters
  - Finding Reddit-themed words
  - Daily challenge words

## 🏅 Achievements

- Karma Master: Earn 1000+ karma points
- Dedicated Player: Play 10+ games
- Rising Star: Earn 100+ karma points and play 5+ games

## 🤝 Contributing

This project is part of the Reddit Games and Puzzles Hackathon. After the competition, we welcome contributions! Please read our contributing guidelines.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Reddit Developer Platform team for the amazing tools
- Our beta testers from the Reddit community
- All the players who make this game fun!
