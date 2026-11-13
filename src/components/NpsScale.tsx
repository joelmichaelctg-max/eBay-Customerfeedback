import React from 'react';

interface NpsScaleProps {
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

const NPS_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

/**
 * 0 to 10 Net Promoter Score scale that wraps into two clean rows on small phones.
 */
export const NpsScale: React.FC<NpsScaleProps> = ({
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

        <div className="nps-grid" role="group" aria-label={questionText}>
          {NPS_VALUES.map((num, index) => {
            const isSelected = value === num;
            return (
              <button
                key={num}
                ref={index === 0 ? focusRef : undefined}
                type="button"
                className={`nps-button${
                  isSelected ? ' nps-button--selected' : ''
                }${error && !isSelected ? ' nps-button--invalid' : ''}`}
                aria-pressed={isSelected}
                aria-label={`${num} out of 10${
                  num === 0 ? `, ${minLabel}` : num === 10 ? `, ${maxLabel}` : ''
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
