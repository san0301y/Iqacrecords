import React, { useState, useEffect } from 'react';
import { leaderboardAPI } from '../services/api';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.get();
      setLeaderboard(response.data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <div className="page-header">
        <h2>🏆 Faculty Leaderboard</h2>
        <p>Top performing faculty based on IQAC evaluations</p>
      </div>

      <div className="leaderboard-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Faculty</th>
              <th>Department</th>
              <th>Avg Score</th>
              <th>Score /10</th>
              <th>Records</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((faculty, index) => (
              <tr key={faculty.faculty_id} className={index < 3 ? `rank-${index + 1}` : ''}>
                <td className="rank">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </td>
                <td className="faculty-name">{faculty.faculty_name}</td>
                <td className="department">{faculty.department}</td>
                <td className="avg-score">{faculty.avg_score}%</td>
                <td className="score-out-of-10">
                  <span className={`score-badge score-${Math.round(faculty.score_out_of_10)}`}>
                    {faculty.score_out_of_10}/10
                  </span>
                </td>
                <td className="records-count">{faculty.total_records}</td>
                <td className="performance">
                  <div className="performance-bar">
                    <div 
                      className="performance-fill"
                      style={{ width: `${faculty.avg_score}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leaderboard.length === 0 && (
        <div className="no-data">
          <p>No leaderboard data available yet.</p>
          <p>Add some IQAC records to see the leaderboard.</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;