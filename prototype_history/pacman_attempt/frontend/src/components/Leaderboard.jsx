import React from 'react';
import '../styles/App.css';

export default function Leaderboard({ scores }) {
  if (!scores || scores.length === 0) {
    return (
      <div className="leaderboard-empty">
        <p>No scores yet. Be the first!</p>
      </div>
    );
  }

  return (
    <table className="leaderboard-table">
      <thead>
        <tr>
          <th>#</th>
          <th>NAME</th>
          <th>SCORE</th>
          <th>LEVEL</th>
        </tr>
      </thead>
      <tbody>
        {scores.map((entry, index) => (
          <tr
            key={entry.id}
            className={index === 0 ? 'top-score' : ''}
          >
            <td className="rank-cell">
              {index === 0 ? '👑' : index + 1}
            </td>
            <td className="name-cell">{entry.name}</td>
            <td className="score-cell">{entry.score.toLocaleString()}</td>
            <td className="level-cell">{entry.level}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}