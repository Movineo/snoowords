# SnooWords: Where Word Games Meet Reddit

## Inspiration
As a passionate developer and Reddit enthusiast, I noticed a gap in the gaming landscape. While Reddit has a vibrant gaming community, there weren't any games that directly integrated with Reddit's unique social features. I asked myself: "What if your Reddit karma could give you power-ups in a game?" That's how SnooWords was born.

## What it does
SnooWords is a word-building game that seamlessly integrates with Reddit's social features:
- **Karma Power-ups**: Your Reddit karma unlocks special abilities and bonuses
- **Social Sharing**: Share high scores directly to Reddit with beautifully formatted posts
- **Community Challenges**: Compete in daily challenges with other Redditors
- **Achievement System**: Unlock Reddit-themed achievements as you play and interact
- **Real-time Leaderboards**: See how you stack up against the Reddit community

## How I built it
I created SnooWords using modern web technologies and best practices:
- **Frontend**: React + TypeScript for a responsive and type-safe UI
- **Build Tool**: Vite for lightning-fast development and optimized builds
- **Backend**: Supabase for real-time leaderboards and user data
- **Authentication**: Reddit OAuth for seamless user integration
- **State Management**: Custom hooks and context for efficient state handling
- **Styling**: Tailwind CSS for a clean, modern design

## Challenges I ran into
1. **Reddit OAuth Flow**: Implementing secure authentication while maintaining a smooth user experience was tricky. I solved this by creating a dedicated OAuth service with proper error handling.

2. **Karma Integration**: Balancing game mechanics with Reddit karma levels required careful consideration. I developed a scaling algorithm that keeps the game fair while rewarding active Redditors.

3. **Real-time Updates**: Ensuring leaderboards and community challenges updated instantly required implementing WebSocket connections and optimizing state management.

4. **Cross-platform Compatibility**: Making the game work seamlessly across different devices and browsers required extensive testing and CSS optimization.

## Accomplishments that I'm proud of
- Successfully implementing Reddit OAuth from scratch
- Creating a beautiful, responsive UI that works on both desktop and mobile
- Building real-time social features that create a sense of community
- Developing an innovative use of Reddit karma as a game mechanic
- Writing clean, maintainable code with TypeScript and modern React patterns

## What I learned
- Deep understanding of Reddit's OAuth and API systems
- Advanced React patterns for complex state management
- Real-time data synchronization techniques
- Community-driven game design principles
- The importance of user feedback in feature development

## What's next for SnooWords
- **Subreddit Integration**: Custom challenges for specific subreddits
- **Award System**: Use Reddit coins and awards in the game
- **Multiplayer Mode**: Real-time word battles between Redditors
- **Custom Themes**: Themes based on popular subreddits
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

## About the Developer
I'm Movine Odhiambo, a full-stack developer passionate about creating engaging social experiences. SnooWords represents my vision of bringing together the Reddit community through interactive gaming. Feel free to connect with me on GitHub or Reddit!
