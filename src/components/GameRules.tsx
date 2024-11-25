
export const GameRules = () => (
  <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-8">
    <h2 className="text-2xl font-bold mb-4">How to Play</h2>
    <ul className="list-disc list-inside space-y-2 text-purple-200">
      <li>Enter your username to start the game</li>
      <li>You'll get 12 random letters to work with</li>
      <li>Create words using the available letters</li>
      <li>Words must be at least 3 letters long</li>
      <li>Score points based on word length and special letters</li>
      <li>Special letters (Q, Z, X, J) are worth extra points</li>
      <li>Complete as many words as you can in 60 seconds</li>
      <li>Challenge other players and climb the global leaderboard!</li>
      <li>Share your best words to earn community awards</li>
    </ul>
  </div>
);