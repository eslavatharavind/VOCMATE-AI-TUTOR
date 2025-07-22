import React from 'react';

const ProgressDashboard = ({ progressData, loading, error }) => (
  <div className="progress-dashboard">
    <h3>Your Progress Dashboard</h3>
    {loading && <p>Loading progress data...</p>}
    {error && <p style={{color: 'orange'}}>{error}</p>}
    {progressData && !loading && (
      <>
        <div className="progress-stats">
          <div className="stat-card">
            <h4>Level {progressData.user_progress?.level || 1}</h4>
            <p>Experience: {progressData.user_progress?.experience || 0} XP</p>
          </div>
          <div className="stat-card">
            <h4>Total Sessions</h4>
            <p>{progressData.user_progress?.total_sessions || 0}</p>
          </div>
          <div className="stat-card">
            <h4>Average Score</h4>
            <p>{(progressData.user_progress?.average_score || 0).toFixed(1)}%</p>
          </div>
          <div className="stat-card">
            <h4>Weekly Average</h4>
            <p>{(progressData.weekly_average || 0).toFixed(1)}%</p>
          </div>
        </div>
        <div className="badges-section">
          <h4>Badges Earned</h4>
          <div className="badges">
            {(progressData.user_progress?.badges || []).map((badge, index) => (
              <span key={index} className="badge">{badge}</span>
            ))}
          </div>
        </div>
      </>
    )}
  </div>
);

export default ProgressDashboard; 