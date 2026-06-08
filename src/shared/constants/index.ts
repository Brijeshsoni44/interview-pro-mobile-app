import { Topic, DifficultyLevel } from '../types';

export const TOPICS: Topic[] = [
  'All',
  'Execution Context',
  'Hoisting',
  'Closures',
  'JS Engine',
  'Higher-Order Functions',
  'Event Loop',
  'Promises',
  'Async/Await',
  'this Keyword'
];

export const DIFFICULTIES: (DifficultyLevel | 'All')[] = [
  'All',
  'Beginner',
  'Intermediate',
  'Advanced',
];

export const TOTAL_QUIZ_QUESTIONS = 10;
