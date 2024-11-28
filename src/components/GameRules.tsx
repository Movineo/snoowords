export const GameRules = () => (
  <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-8">
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
      <span>How to Play SnooWords</span>
      <span className="text-sm font-normal text-purple-300">(Reddit's Community Word Game)</span>
    </h2>
    
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-2 text-orange-400">Basic Rules</h3>
        <ul className="list-disc list-inside space-y-2 text-purple-200">
          <li>Enter your username or connect with Reddit to start</li>
          <li>Create words using 12 random letters (3+ vowels guaranteed)</li>
          <li>Words must be at least 3 letters long</li>
          <li>Complete as many words as you can in 180 seconds</li>
          <li>Each valid word must use only available letters</li>
          <li>Letters can only be used as many times as they appear</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2 text-orange-400">Scoring System</h3>
        <ul className="list-disc list-inside space-y-2 text-purple-200">
          <li>Base points: 1 point per letter</li>
          <li>Special letters (Q, Z, X, J) worth +2 bonus points each</li>
          <li>Length bonuses: +3 for 6+ letters, +5 for 8+ letters</li>
          <li>Themed word bonus: x2 multiplier for subreddit-themed words</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2 text-orange-400">Community Features</h3>
        <ul className="list-disc list-inside space-y-2 text-purple-200">
          <li>Create and share custom word packs from any subreddit</li>
          <li>Challenge friends with your high scores</li>
          <li>Earn Reddit trophies and achievements</li>
          <li>Compete in daily themed challenges</li>
          <li>Voice commands available (say "help" for list)</li>
          <li>Join tournaments in your favorite subreddits</li>
        </ul>
      </section>

      <div className="mt-4 p-3 bg-purple-900/30 rounded-lg">
        <p className="text-sm text-purple-300 italic">
          Pro Tip: Use subreddit-specific word packs to earn double points! Try r/gaming for video game terms, 
          r/food for culinary vocabulary, or create your own themed pack!
        </p>
      </div>
    </div>
  </div>
);