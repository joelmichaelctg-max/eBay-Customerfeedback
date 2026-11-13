import React from 'react';
import { MAX_TEXTAREA_LENGTH } from '../constants/questions';

interface TextAreaFieldProps {
  id: string;
  questionNumber: string;
  questionText: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  focusRef?: React.RefObject<HTMLTextAreaElement | null>;
}

/**
 * Multi-line textarea field with live 1000-character counter and inline error support.
 */
export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  id,
  questionNumber,
  questionText,
  required = false,
  value,
  placeholder = 'Write your answer here...',
  error,
  onChange,
  onBlur,
  focusRef,
}) => {
  const textareaId = `input-${id}`;
  const errorId = `${id}-error`;
  const counterId = `${id}-counter`;
  const describedBy = error ? `${errorId} ${counterId}` : counterId;
  const isAtLimit = value.length >= MAX_TEXTAREA_LENGTH;

  return (
    <section
      id={`card-${id}`}
      className={`question-card${error ? ' question-card--error' : ''}`}
    >
      <label htmlFor={textareaId} className="question-label">
        <span className="question-number">{questionNumber}</span>
        {questionText}
        {required && (
          <span className="required-star" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>

      <textarea
        ref={focusRef}
        id={textareaId}
        name={id}
        className={`text-area${error ? ' input--invalid' : ''}`}
        value={value}
        placeholder={placeholder}
        maxLength={MAX_TEXTAREA_LENGTH}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_TEXTAREA_LENGTH))}
        onBlur={onBlur}
      />

      <div className="field-meta-row">
        {error && (
          <p id={errorId} className="field-error" role="alert">
            {error}
          </p>
        )}
        <span
          id={counterId}
          className={`char-counter${isAtLimit ? ' char-counter--limit' : ''}`}
          aria-live="polite"
        >
          {value.length} / {MAX_TEXTAREA_LENGTH}
        </span>
      </div>
    </section>
  );
};
