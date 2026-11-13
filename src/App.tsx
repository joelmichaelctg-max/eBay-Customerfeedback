import React, { useMemo, useRef, useState } from 'react';
import { ChipMultiSelect } from './components/ChipMultiSelect';
import { NpsScale } from './components/NpsScale';
import { ProgressBar } from './components/ProgressBar';
import { RadioGroup } from './components/RadioGroup';
import { RatingScale } from './components/RatingScale';
import { TextAreaField } from './components/TextAreaField';
import { ThankYou } from './components/ThankYou';
import {
  MIN_REQUIRED_NON_SPACE_CHARS,
  Q10_PRIORITY_OPTIONS,
  Q5_OPTIONS,
  Q8_PLATFORM_OPTIONS,
  QUESTION_ORDER,
  REQUIRED_QUESTIONS,
} from './constants/questions';
import {
  FeedbackFormState,
  FeedbackPayload,
  FormErrors,
  QuestionKey,
  SatisfactionOption,
} from './types/feedback';

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyPHLsis6rNoExq7kQJsnQX0K8WtajwiFc8F-Hw5MrSwebsQ3S3THLroTvxv9cFLvJl6Q/exec';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUIRED_ERROR_MSG = 'Please answer this question';
const INVALID_EMAIL_MSG = 'Please enter a valid email address';

const INITIAL_FORM_STATE: FeedbackFormState = {
  Q1: null,
  Q2: '',
  Q3: null,
  Q4: '',
  Q5: '',
  Q6: '',
  Q7: null,
  Q8: [],
  Q8OtherText: '',
  Q9: '',
  Q10: '',
  Q11: '',
  Q12: '',
  website: '',
};

/**
 * Checks whether the Apps Script endpoint still contains placeholder text.
 */
function isPlaceholderEndpoint(url: string): boolean {
  const trimmed = url.trim();
  return (
    !trimmed ||
    trimmed.includes('YOUR_') ||
    trimmed.includes('PASTE_') ||
    trimmed.includes('PLACEHOLDER') ||
    !trimmed.startsWith('https://script.google.com/')
  );
}

/**
 * Validates required text answers have at least 3 non-space characters.
 */
function hasMinNonSpaceChars(value: string): boolean {
  return value.replace(/\s+/g, '').length >= MIN_REQUIRED_NON_SPACE_CHARS;
}

/**
 * Validates a single question key against the current form state.
 */
function validateField(
  key: QuestionKey,
  state: FeedbackFormState
): string | undefined {
  switch (key) {
    case 'Q1':
      return state.Q1 === null ? REQUIRED_ERROR_MSG : undefined;
    case 'Q2':
      return !hasMinNonSpaceChars(state.Q2) ? REQUIRED_ERROR_MSG : undefined;
    case 'Q3':
      return state.Q3 === null ? REQUIRED_ERROR_MSG : undefined;
    case 'Q4':
      return !hasMinNonSpaceChars(state.Q4) ? REQUIRED_ERROR_MSG : undefined;
    case 'Q5':
      return state.Q5 === '' ? REQUIRED_ERROR_MSG : undefined;
    case 'Q7':
      return state.Q7 === null ? REQUIRED_ERROR_MSG : undefined;
    case 'Q10':
      return state.Q10.trim() === '' ? REQUIRED_ERROR_MSG : undefined;
    case 'Q11':
      return !hasMinNonSpaceChars(state.Q11) ? REQUIRED_ERROR_MSG : undefined;
    case 'Q12': {
      const trimmedEmail = state.Q12.trim();
      if (trimmedEmail !== '' && !EMAIL_REGEX.test(trimmedEmail)) {
        return INVALID_EMAIL_MSG;
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

export default function App() {
  const [formState, setFormState] =
    useState<FeedbackFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [devWarning, setDevWarning] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  // Refs for focusing the first invalid control on failed submission
  const q1Ref = useRef<HTMLButtonElement | null>(null);
  const q2Ref = useRef<HTMLTextAreaElement | null>(null);
  const q3Ref = useRef<HTMLButtonElement | null>(null);
  const q4Ref = useRef<HTMLTextAreaElement | null>(null);
  const q5Ref = useRef<HTMLInputElement | null>(null);
  const q7Ref = useRef<HTMLButtonElement | null>(null);
  const q10Ref = useRef<HTMLSelectElement | null>(null);
  const q11Ref = useRef<HTMLTextAreaElement | null>(null);
  const q12Ref = useRef<HTMLInputElement | null>(null);

  const completedRequiredCount = useMemo(() => {
    return REQUIRED_QUESTIONS.reduce((count, key) => {
      return validateField(key, formState) === undefined ? count + 1 : count;
    }, 0);
  }, [formState]);

  const updateFieldAndClearError = <K extends keyof FeedbackFormState>(
    field: K,
    value: FeedbackFormState[K],
    questionKey?: QuestionKey
  ) => {
    setFormState((prev) => {
      const next = { ...prev, [field]: value };
      if (questionKey && errors[questionKey]) {
        const nextErr = validateField(questionKey, next);
        setErrors((prevErrors) => {
          const updated = { ...prevErrors };
          if (nextErr) {
            updated[questionKey] = nextErr;
          } else {
            delete updated[questionKey];
          }
          return updated;
        });
      }
      return next;
    });
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleFieldBlur = (key: QuestionKey) => {
    const errorMessage = validateField(key, formState);
    setErrors((prev) => {
      const next = { ...prev };
      if (errorMessage) {
        next[key] = errorMessage;
      } else {
        delete next[key];
      }
      return next;
    });
  };

  const handleToggleQ8 = (option: string) => {
    setFormState((prev) => {
      const exists = prev.Q8.includes(option);

      if (option === 'None of these') {
        if (exists) {
          return { ...prev, Q8: [] };
        }
        return { ...prev, Q8: ['None of these'], Q8OtherText: '' };
      }

      const withoutNone = prev.Q8.filter((item) => item !== 'None of these');
      if (exists) {
        const nextQ8 = withoutNone.filter((item) => item !== option);
        return {
          ...prev,
          Q8: nextQ8,
          Q8OtherText: option === 'Other' ? '' : prev.Q8OtherText,
        };
      }

      return { ...prev, Q8: [...withoutNone, option] };
    });
  };

  const focusFirstInvalidQuestion = (firstInvalidKey: QuestionKey) => {
    const cardElement = document.getElementById(`card-${firstInvalidKey}`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const focusMap: Partial<Record<QuestionKey, HTMLElement | null>> = {
      Q1: q1Ref.current,
      Q2: q2Ref.current,
      Q3: q3Ref.current,
      Q4: q4Ref.current,
      Q5: q5Ref.current,
      Q7: q7Ref.current,
      Q10: q10Ref.current,
      Q11: q11Ref.current,
      Q12: q12Ref.current,
    };

    const target = focusMap[firstInvalidKey];
    if (target) {
      target.focus({ preventScroll: true });
    }
  };

  const buildPayload = (): FeedbackPayload => {
    const formattedQ8 = formState.Q8.map((item) => {
      if (item === 'Other') {
        const trimmedOther = formState.Q8OtherText.trim();
        return trimmedOther ? `Other: ${trimmedOther}` : 'Other';
      }
      return item;
    });

    return {
      Q1: formState.Q1 as number,
      Q2: formState.Q2.trim(),
      Q3: formState.Q3 as number,
      Q4: formState.Q4.trim(),
      Q5: formState.Q5 as SatisfactionOption,
      Q6: formState.Q6.trim(),
      Q7: formState.Q7 as number,
      Q8: formattedQ8,
      Q9: formState.Q9.trim(),
      Q10: formState.Q10.trim(),
      Q11: formState.Q11.trim(),
      Q12: formState.Q12.trim(),
      website: formState.website,
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);
    setDevWarning(null);

    const nextErrors: FormErrors = {};
    for (const key of QUESTION_ORDER) {
      const msg = validateField(key, formState);
      if (msg) {
        nextErrors[key] = msg;
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstInvalid = QUESTION_ORDER.find((key) => Boolean(nextErrors[key]));
      if (firstInvalid) {
        focusFirstInvalidQuestion(firstInvalid);
      }
      return;
    }

    if (isPlaceholderEndpoint(APPS_SCRIPT_URL)) {
      const warningMsg =
        'Developer notice: APPS_SCRIPT_URL is not configured yet. Please paste your deployed Google Apps Script /exec URL into APPS_SCRIPT_URL before submitting.';
      console.warn(warningMsg);
      setDevWarning(warningMsg);
      return;
    }

    const payload = buildPayload();
    setIsSubmitting(true);

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setSubmitError(
        "We couldn't send your feedback. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormState(INITIAL_FORM_STATE);
    setErrors({});
    setSubmitError(null);
    setDevWarning(null);
    setIsSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-wrapper">
      <header className="site-header">
        <div className="header-inner">
          <a
            href="https://www.ebay.com"
            className="logo-link"
            aria-label="eBay Home"
            rel="noopener noreferrer"
          >
            {!logoFailed ? (
              <img
                src="https://i.ibb.co/4RDMc9Qg/download.png"
                alt="eBay"
                className="ebay-logo-img"
                referrerPolicy="no-referrer"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <span className="ebay-logo-fallback" aria-label="eBay">
                <span className="e-red">e</span>
                <span className="b-blue">b</span>
                <span className="a-yellow">a</span>
                <span className="y-green">y</span>
              </span>
            )}
          </a>
          <h1 className="header-title">Customer Feedback</h1>
        </div>
      </header>

      {!isSubmitted && (
        <ProgressBar
          completedCount={completedRequiredCount}
          totalRequired={REQUIRED_QUESTIONS.length}
        />
      )}

      <main className="main-content">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a
            href="https://www.ebay.com"
            className="breadcrumb-link"
            rel="noopener noreferrer"
          >
            Home
          </a>
          <span className="breadcrumb-sep" aria-hidden="true">
            &gt;
          </span>
          <span className="breadcrumb-current" aria-current="page">
            Customer Feedback
          </span>
        </nav>

        {isSubmitted ? (
          <ThankYou onReset={handleReset} />
        ) : (
          <div className="form-shell-card">
            <div className="intro-banner">
              <p className="intro-banner-text">
                Tell us about your experience. It takes about 3 minutes and
                helps us improve.
              </p>
            </div>

            <p className="required-note">
              Questions marked with{' '}
              <span className="required-star" aria-hidden="true">
                *
              </span>{' '}
              are required.
            </p>

            <form
              className="feedback-form"
              onSubmit={handleSubmit}
              noValidate
              aria-label="eBay Customer Feedback Form"
            >
              {/* Hidden honeypot field to catch automated spam submissions */}
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="hp-website">Website</label>
                <input
                  id="hp-website"
                  type="text"
                  name="website"
                  value={formState.website}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <RatingScale
                id="Q1"
                questionNumber="Q1."
                questionText="Overall, how satisfied are you with your eBay shopping experience?"
                required
                value={formState.Q1}
                minLabel="1 = Very dissatisfied"
                maxLabel="5 = Very satisfied"
                error={errors.Q1}
                onChange={(val) => updateFieldAndClearError('Q1', val, 'Q1')}
                onBlur={() => handleFieldBlur('Q1')}
                focusRef={q1Ref}
              />

              <TextAreaField
                id="Q2"
                questionNumber="Q2."
                questionText="What is the primary reason for your satisfaction rating?"
                required
                value={formState.Q2}
                error={errors.Q2}
                onChange={(val) => updateFieldAndClearError('Q2', val, 'Q2')}
                onBlur={() => handleFieldBlur('Q2')}
                focusRef={q2Ref}
              />

              <NpsScale
                id="Q3"
                questionNumber="Q3."
                questionText="How likely are you to recommend shopping on eBay to a friend or colleague?"
                required
                value={formState.Q3}
                minLabel="0 = Not at all likely"
                maxLabel="10 = Extremely likely"
                error={errors.Q3}
                onChange={(val) => updateFieldAndClearError('Q3', val, 'Q3')}
                onBlur={() => handleFieldBlur('Q3')}
                focusRef={q3Ref}
              />

              <TextAreaField
                id="Q4"
                questionNumber="Q4."
                questionText="What is the main reason for your recommendation score?"
                required
                value={formState.Q4}
                error={errors.Q4}
                onChange={(val) => updateFieldAndClearError('Q4', val, 'Q4')}
                onBlur={() => handleFieldBlur('Q4')}
                focusRef={q4Ref}
              />

              <RadioGroup
                id="Q5"
                questionNumber="Q5."
                questionText="Did the item condition and delivery match the seller's listing description?"
                required
                options={Q5_OPTIONS}
                value={formState.Q5}
                error={errors.Q5}
                onChange={(val) => updateFieldAndClearError('Q5', val, 'Q5')}
                onBlur={() => handleFieldBlur('Q5')}
                focusRef={q5Ref}
              />

              <TextAreaField
                id="Q6"
                questionNumber="Q6."
                questionText="What specific aspects of the item condition, packaging, or delivery could be improved?"
                value={formState.Q6}
                onChange={(val) => updateFieldAndClearError('Q6', val)}
                onBlur={() => handleFieldBlur('Q6')}
              />

              <RatingScale
                id="Q7"
                questionNumber="Q7."
                questionText="How do you rate eBay's pricing, seller fees, and overall value for money?"
                required
                value={formState.Q7}
                minLabel="1 = Very poor"
                maxLabel="5 = Excellent"
                error={errors.Q7}
                onChange={(val) => updateFieldAndClearError('Q7', val, 'Q7')}
                onBlur={() => handleFieldBlur('Q7')}
                focusRef={q7Ref}
              />

              <ChipMultiSelect
                id="Q8"
                questionNumber="Q8."
                questionText="Which other shopping platforms do you use regularly? (pick as many as apply)"
                options={Q8_PLATFORM_OPTIONS}
                selectedValues={formState.Q8}
                otherText={formState.Q8OtherText}
                onToggleOption={handleToggleQ8}
                onOtherTextChange={(text) =>
                  updateFieldAndClearError('Q8OtherText', text)
                }
              />

              <TextAreaField
                id="Q9"
                questionNumber="Q9."
                questionText="What do other platforms do better than eBay?"
                value={formState.Q9}
                onChange={(val) => updateFieldAndClearError('Q9', val)}
                onBlur={() => handleFieldBlur('Q9')}
              />

              <section
                id="card-Q10"
                className={`question-card${
                  errors.Q10 ? ' question-card--error' : ''
                }`}
              >
                <label htmlFor="input-Q10" className="question-label">
                  <span className="question-number">Q10.</span>
                  What area should eBay prioritize improving most?
                  <span className="required-star" aria-hidden="true">
                    {' '}
                    *
                  </span>
                </label>

                <select
                  ref={q10Ref}
                  id="input-Q10"
                  name="Q10"
                  className={`select-input${
                    formState.Q10 === '' ? ' select-input--placeholder' : ''
                  }${errors.Q10 ? ' input--invalid' : ''}`}
                  value={formState.Q10}
                  aria-required="true"
                  aria-invalid={Boolean(errors.Q10)}
                  aria-describedby={errors.Q10 ? 'Q10-error' : undefined}
                  onChange={(e) =>
                    updateFieldAndClearError('Q10', e.target.value, 'Q10')
                  }
                  onBlur={() => handleFieldBlur('Q10')}
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  {Q10_PRIORITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                {errors.Q10 && (
                  <p id="Q10-error" className="field-error" role="alert">
                    {errors.Q10}
                  </p>
                )}
              </section>

              <TextAreaField
                id="Q11"
                questionNumber="Q11."
                questionText="What is the single most important improvement eBay should make to enhance your experience?"
                required
                value={formState.Q11}
                error={errors.Q11}
                onChange={(val) => updateFieldAndClearError('Q11', val, 'Q11')}
                onBlur={() => handleFieldBlur('Q11')}
                focusRef={q11Ref}
              />

              <section
                id="card-Q12"
                className={`question-card${
                  errors.Q12 ? ' question-card--error' : ''
                }`}
              >
                <label htmlFor="input-Q12" className="question-label">
                  <span className="question-number">Q12.</span>
                  Email address (optional)
                </label>
                <p id="Q12-helper" className="question-helper">
                  Only if you&apos;d like us to follow up with you.
                </p>

                <input
                  ref={q12Ref}
                  id="input-Q12"
                  name="Q12"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={`text-input${
                    errors.Q12 ? ' input--invalid' : ''
                  }`}
                  value={formState.Q12}
                  aria-required="false"
                  aria-invalid={Boolean(errors.Q12)}
                  aria-describedby={
                    errors.Q12 ? 'Q12-helper Q12-error' : 'Q12-helper'
                  }
                  onChange={(e) =>
                    updateFieldAndClearError('Q12', e.target.value, 'Q12')
                  }
                  onBlur={() => handleFieldBlur('Q12')}
                />

                {errors.Q12 && (
                  <p id="Q12-error" className="field-error" role="alert">
                    {errors.Q12}
                  </p>
                )}
              </section>

              <div className="submit-section">
                {devWarning && (
                  <div className="warning-banner" role="alert">
                    {devWarning}
                  </div>
                )}

                {submitError && (
                  <div className="error-banner" role="alert">
                    <span>{submitError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="primary-pill-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    'Submit feedback'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div>Copyright 1995-2026 eBay Inc. All Rights Reserved.</div>
          <nav className="footer-links" aria-label="Legal and policies">
            <a
              href="https://www.ebay.com/help/policies/member-behaviour-policies/accessibility-statement?id=4868"
              className="footer-link"
              rel="noopener noreferrer"
            >
              Accessibility
            </a>
            <a
              href="https://www.ebay.com/help/policies/member-behaviour-policies/user-agreement?id=4259"
              className="footer-link"
              rel="noopener noreferrer"
            >
              User Agreement
            </a>
            <a
              href="https://www.ebay.com/help/policies/member-behaviour-policies/user-privacy-notice-privacy-policy?id=4260"
              className="footer-link"
              rel="noopener noreferrer"
            >
              Privacy
            </a>
            <a
              href="https://www.ebay.com/help/policies/member-behaviour-policies/ebay-cookie-notice?id=4267"
              className="footer-link"
              rel="noopener noreferrer"
            >
              Cookies
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
