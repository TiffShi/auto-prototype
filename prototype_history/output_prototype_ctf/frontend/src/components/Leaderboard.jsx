import React from "react";

const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };
const RANK_CLASS = { 1: "rank-gold", 2: "rank-silver", 3: "rank-bronze" };

function Leaderboard({ leaderboard, isLoading }) {
  if (isLoading) {
    return (
      <div className="leaderboard-state">
        <div className="loading-dots">
          <span />
          <span />
          <span />
        </div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="leaderboard-state empty-state">
        <span className="empty-icon">📋</span>
        <p>No teams yet. Be the first to submit!</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th className="col-rank">Rank</th>
            <th className="col-team">Team Name</th>
            <th className="col-points">Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry) => {
            const rankClass = RANK_CLASS[entry.rank] || "";
            const medal = MEDAL[entry.rank] || "";

            return (
              <tr
                key={entry.teamName}
                className={`leaderboard-row ${rankClass}`}
              >
                <td className="col-rank">
                  <span className="rank-badge">
                    {medal || `#${entry.rank}`}
                  </span>
                </td>
                <td className="col-team">
                  <span className="team-name">{entry.teamName}</span>
                </td>
                <td className="col-points">
                  <span className="points-value">
                    {entry.points.toLocaleString()}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;