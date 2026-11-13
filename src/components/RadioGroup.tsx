import React from 'react';
import { SatisfactionOption } from '../types/feedback';

interface RadioGroupProps {
  id: string;
  questionNumber: string;
  questionText: string;
  required?: boolean;
  options: SatisfactionOption[];
  value: SatisfactionOption | '';
  error?: string;
  onChange: (value: SatisfactionOption) => void;
  onBlur: () => void;
  focusRef?: React.RefObject<HTMLInputElement | null>;
}

/**
 * Large accessible radio option cards (Yes / Partly / No).
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({
  id,
  questionNumber,
  questionText,
  required = false,
  options,
  value,
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

        <div className="radio-group-list">
          {options.map((option, index) => {
            const isSelected = value === option;
            const inputId = `${id}-${option.toLowerCase()}`;
            return (
              <label
                key={option}
                htmlFor={inputId}
                className={`radio-option${
                  isSelected ? ' radio-option--selected' : ''
                }${error && !value ? ' radio-option--invalid' : ''}`}
              >
                <input
                  ref={index === 0 ? focusRef : undefined}
                  id={inputId}
                  type="radio"
                  name={id}
                  value={option}
                  checked={isSelected}
                  onChange={() => onChange(option)}
                  className="sr-only"
                />
                <span className="radio-circle" aria-hidden="true">
                  {isSelected && <span className="radio-dot" />}
                </span>
                <span className="radio-text">{option}</span>
              </label>
            );
          })}
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
