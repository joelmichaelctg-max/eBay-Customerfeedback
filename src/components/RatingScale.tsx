import React from 'react';

interface RatingScaleProps {
  id: string;
  questionNumber: string;
  questionText: string;
  required?: boolean;
  value: number | null;
  minLabel: string;
  maxLabel: string;
  error?: string;
  onChange: (value: number) => void;
  onBlur: () => void;
  focusRef?: React.RefObject<HTMLButtonElement | null>;
}

const SCALE_VALUES = [1, 2, 3, 4, 5] as const;

/**
 * 1 to 5 rating scale with large tappable buttons and descriptive end labels.
 */
export const RatingScale: React.FC<RatingScaleProps> = ({
  id,
  questionNumber,
  questionText,
  required = false,
  value,
  minLabel,
  maxLabel,
  error,
  onChange,
  onBlur,
  focusRef,
}) => {
  const errorId = `${id}-error`;

  const handleFieldsetBlur = (e: React.FocusEvent<HTMLFieldSetElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      onBlur();
    }
  };

  return (
    <section
      id={`card-${id}`}
      className={`question-card${error ? ' question-card--error' : ''}`}
    >
      <fieldset
        className="question-fieldset"
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onBlur={handleFieldsetBlur}
      >
        <legend className="question-legend">
          <span className="question-number">{questionNumber}</span>
          {questionText}
          {required && (
            <span className="required-star" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </legend>

        <div className="rating-scale-grid" role="group" aria-label={questionText}>
          {SCALE_VALUES.map((num, index) => {
            const isSelected = value === num;
            return (
              <button
                key={num}
                ref={index === 0 ? focusRef : undefined}
                type="button"
                className={`scale-button${
                  isSelected ? ' scale-button--selected' : ''
                }${error && !isSelected ? ' scale-button--invalid' : ''}`}
                aria-pressed={isSelected}
                aria-label={`${num} out of 5${
                  num === 1 ? `, ${minLabel}` : num === 5 ? `, ${maxLabel}` : ''
                }`}
                onClick={() => onChange(num)}
              >
                {num}
              </button>
            );
          })}
        </div>

        <div className="scale-end-labels" aria-hidden="true">
          <span>{minLabel}</span>
          <span className="scale-end-label-right">{maxLabel}</span>
        </div>

        {error && (
          <p id={errorId} className="field-error" role="alert">
            {error}
          </p>
        )}
      </fieldset>
    </section>
  );
};
