# SnooWords: Where Word Games Meet Reddit

## Inspiration
As a passionate developer and Reddit enthusiast, I identified a unique opportunity to blend word gaming with Reddit's vibrant community features. The idea struck me: what if your Reddit karma could enhance your gaming experience? This led to the creation of SnooWords, where social engagement meets word-building strategy.

## What it does
SnooWords transforms the traditional word game experience by integrating Reddit's social features:
- **Karma Power-ups**: Convert your Reddit karma into in-game advantages
- **Social Sharing**: Share achievements and high scores directly to Reddit
- **Community Challenges**: Compete in daily challenges with fellow Redditors
- **Achievement System**: Unlock Reddit-themed achievements through gameplay
- **Real-time Leaderboards**: Track your ranking in the Reddit gaming community

## How we built it
The technical foundation of SnooWords combines modern web technologies:
- **Frontend**: React with TypeScript for type-safe, component-based UI
- **Backend**: Supabase for real-time data and user management
- **Authentication**: Reddit OAuth for seamless user integration
- **State Management**: Custom hooks and context for efficient updates
- **Styling**: Tailwind CSS for responsive design
- **Build Tool**: Vite for optimized development and production builds

## Challenges we ran into
1. **Reddit OAuth Complexity**: Implementing secure authentication while maintaining a smooth user experience required careful handling of OAuth flows and token management.

2. **Karma Integration**: Balancing game mechanics with Reddit karma levels presented unique challenges in maintaining fair gameplay while rewarding active Redditors.

3. **Real-time Features**: Implementing instant leaderboard updates and community challenges required optimizing WebSocket connections and state management.

4. **Cross-platform Design**: Ensuring consistent gameplay across devices demanded extensive CSS optimization and responsive design solutions.

## Accomplishments that we're proud of
- Successfully integrated Reddit's OAuth and API systems
- Created an engaging, responsive gaming interface
- Implemented real-time social features
- Developed innovative karma-based power-ups
- Built a scalable, maintainable codebase

## What we learned
- Deep insights into Reddit's API ecosystem
- Advanced React patterns and TypeScript implementations
- Real-time data synchronization strategies
- Community-driven game design principles
- The importance of user feedback in feature development

## What's next for SnooWords
- **Subreddit Integration**: Custom challenges for specific communities
- **Award System**: Integration with Reddit's award system
- **Multiplayer Mode**: Real-time word battles between users
- **Custom Themes**: Subreddit-based visual themes
- **Mobile Apps**: Native iOS and Android versions

## Built With
- react
- typescript
- vite
- supabase
- reddit-api
- tailwindcss
- websockets
- oauth2

## Try it out
- [Play SnooWords](https://snoowords.vercel.app)
- [GitHub Repository](https://github.com/Movineo/snoowords)
- [Join our Subreddit](https://reddit.com/r/SnooWords)

## Media Gallery
### Game Interface
![Main game interface showing the word grid and score system](./project-media/game-board.png)

### Reddit Integration
![Reddit login and karma integration](./project-media/reddit-login.png)

### Achievements
![Reddit-themed achievements panel](./project-media/achievements.png)

### Community Features
![Community leaderboard and challenges](./project-media/leaderboard.png)

### User Profile
![User profile with karma integration](./project-media/profile-karma.png)

### Score Sharing
![Score sharing interface](./project-media/share-score.png)

## About the Developer
I'm Movine Odhiambo, a full-stack developer passionate about creating engaging social experiences. SnooWords represents my vision of bringing together the Reddit community through interactive gaming. Feel free to connect with me on GitHub or Reddit!
