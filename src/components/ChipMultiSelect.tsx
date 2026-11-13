import React from 'react';

interface ChipMultiSelectProps {
  id: string;
  questionNumber: string;
  questionText: string;
  options: string[];
  selectedValues: string[];
  otherText: string;
  onToggleOption: (option: string) => void;
  onOtherTextChange: (text: string) => void;
}

/**
 * Multi-select checkboxes styled as tappable chips with exclusive "None of these"
 * and conditional "Other" text input.
 */
export const ChipMultiSelect: React.FC<ChipMultiSelectProps> = ({
  id,
  questionNumber,
  questionText,
  options,
  selectedValues,
  otherText,
  onToggleOption,
  onOtherTextChange,
}) => {
  const isOtherSelected = selectedValues.includes('Other');
  const otherInputId = `${id}-other-input`;

  return (
    <section id={`card-${id}`} className="question-card">
      <fieldset className="question-fieldset">
        <legend className="question-legend">
          <span className="question-number">{questionNumber}</span>
          {questionText}
        </legend>

        <div className="chip-group">
          {options.map((option) => {
            const isSelected = selectedValues.includes(option);
            const checkboxId = `${id}-${option
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')}`;

            return (
              <label
                key={option}
                htmlFor={checkboxId}
                className={`chip-label${
                  isSelected ? ' chip-label--selected' : ''
                }`}
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  name={id}
                  value={option}
                  checked={isSelected}
                  onChange={() => onToggleOption(option)}
                  className="sr-only"
                />
                {isSelected && (
                  <svg
                    className="chip-check-icon"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="4 10 8 14 16 6" />
                  </svg>
                )}
                <span>{option}</span>
              </label>
            );
          })}
        </div>

        {isOtherSelected && (
          <div className="other-specify-wrapper">
            <label htmlFor={otherInputId} className="other-specify-label">
              Please specify
            </label>
            <input
              id={otherInputId}
              type="text"
              className="text-input"
              placeholder="Please specify"
              value={otherText}
              maxLength={120}
              onChange={(e) => onOtherTextChange(e.target.value)}
            />
          </div>
        )}
      </fieldset>
    </section>
  );
};
