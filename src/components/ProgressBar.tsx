import React from 'react';

interface ProgressBarProps {
  completedCount: number;
  totalRequired: number;
}

/**
 * Slim sticky progress bar showing completion of required survey questions.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  completedCount,
  totalRequired,
}) => {
  const percentage =
    totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 0;

  return (
    <div className="progress-sticky" role="region" aria-label="Survey progress">
      <div className="progress-inner">
        <div className="progress-header">
          <span className="progress-label">
            {completedCount} of {totalRequired} required questions answered
          </span>
          <span className="progress-percent" aria-hidden="true">
            {percentage}%
          </span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={totalRequired}
          aria-valuetext={`${completedCount} of ${totalRequired} required questions answered`}
        >
          <div
            className="progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
