export type SatisfactionOption = 'Yes' | 'Partly' | 'No';

export interface FeedbackFormState {
  Q1: number | null;
  Q2: string;
  Q3: number | null;
  Q4: string;
  Q5: SatisfactionOption | '';
  Q6: string;
  Q7: number | null;
  Q8: string[];
  Q8OtherText: string;
  Q9: string;
  Q10: string;
  Q11: string;
  Q12: string;
  website: string;
}

export type QuestionKey =
  | 'Q1'
  | 'Q2'
  | 'Q3'
  | 'Q4'
  | 'Q5'
  | 'Q6'
  | 'Q7'
  | 'Q8'
  | 'Q9'
  | 'Q10'
  | 'Q11'
  | 'Q12';

export type RequiredQuestionKey = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q7' | 'Q10' | 'Q11';

export type FormErrors = Partial<Record<QuestionKey, string>>;

export interface FeedbackPayload {
  Q1: number;
  Q2: string;
  Q3: number;
  Q4: string;
  Q5: SatisfactionOption;
  Q6: string;
  Q7: number;
  Q8: string[];
  Q9: string;
  Q10: string;
  Q11: string;
  Q12: string;
  website: string;
}
