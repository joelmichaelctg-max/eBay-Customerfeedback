import React from 'react';

interface ThankYouProps {
  onReset: () => void;
}

/**
 * Confirmation view shown immediately after successful feedback submission.
 */
export const ThankYou: React.FC<ThankYouProps> = ({ onReset }) => {
  return (
    <section className="thank-you-card" aria-live="polite">
      <div className="thank-you-icon" aria-hidden="true">
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 className="thank-you-heading">Thank you for your feedback!</h2>
      <p className="thank-you-text">
        Your response has been received. We appreciate you taking the time to
        help us make eBay better.
      </p>

      <div className="thank-you-actions">
        <a
          href="https://www.ebay.com"
          className="primary-pill-button"
          rel="noopener noreferrer"
        >
          Back to eBay
        </a>

        <button
          type="button"
          className="text-link-button"
          onClick={onReset}
        >
          Submit another response
        </button>
      </div>
    </section>
  );
};
