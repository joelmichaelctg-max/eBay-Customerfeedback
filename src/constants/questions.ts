import { RequiredQuestionKey, SatisfactionOption } from '../types/feedback';

export const MAX_TEXTAREA_LENGTH = 1000;
export const MIN_REQUIRED_NON_SPACE_CHARS = 3;

export const Q5_OPTIONS: SatisfactionOption[] = ['Yes', 'Partly', 'No'];

export const Q8_PLATFORM_OPTIONS: string[] = [
  'Amazon',
  'Walmart',
  'Etsy',
  'Temu',
  'AliExpress',
  'Shein',
  'Facebook Marketplace',
  'Vinted',
  'Marktplaats',
  'bol.com',
  'Other',
  'None of these',
];

export const Q10_PRIORITY_OPTIONS: string[] = [
  'Search and product discovery',
  'Accuracy of listing descriptions and photos',
  'Delivery speed and tracking',
  'Packaging quality',
  'Pricing and seller fees',
  'Seller communication',
  'Returns and refunds',
  'Buyer protection and dispute resolution',
  'Payment and checkout experience',
  'Website and app ease of use',
  'Customer support',
  'Other',
];

export const REQUIRED_QUESTIONS: RequiredQuestionKey[] = [
  'Q1',
  'Q2',
  'Q3',
  'Q4',
  'Q5',
  'Q7',
  'Q10',
  'Q11',
];

export const QUESTION_ORDER: Array<keyof import('../types/feedback').FormErrors> = [
  'Q1',
  'Q2',
  'Q3',
  'Q4',
  'Q5',
  'Q6',
  'Q7',
  'Q8',
  'Q9',
  'Q10',
  'Q11',
  'Q12',
];
