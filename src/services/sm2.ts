export interface SM2Parameters {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewDate: Date;
}

/**
 * Calculates the next review parameters based on the SM-2 Spaced Repetition algorithm.
 * 
 * Quality Ratings (q):
 * - Easy ('easy') -> 5 (excellent recall, requires no effort)
 * - Medium ('medium') -> 3 (correct recall but with effort/hesitation)
 * - Hard ('hard') -> 1 (incorrect recall, forgot or struggled heavily)
 */
export function calculateSM2(
  repetitions: number,
  intervalDays: number,
  easeFactor: number,
  rating: 'easy' | 'medium' | 'hard'
): SM2Parameters {
  let q = 3;
  if (rating === 'easy') q = 5;
  if (rating === 'hard') q = 1;

  let nextRepetitions = repetitions;
  let nextIntervalDays = intervalDays;
  let nextEaseFactor = easeFactor;

  if (q >= 3) {
    // Correct response
    if (nextRepetitions === 0) {
      nextIntervalDays = 1;
    } else if (nextRepetitions === 1) {
      nextIntervalDays = 6;
    } else {
      nextIntervalDays = Math.round(nextIntervalDays * nextEaseFactor);
    }
    nextRepetitions += 1;
  } else {
    // Incorrect response
    nextRepetitions = 0;
    nextIntervalDays = 1; // Review again tomorrow
  }

  // Calculate new Ease Factor (EF)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  nextEaseFactor = nextEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  
  // Lower bound for EF is 1.3
  if (nextEaseFactor < 1.3) {
    nextEaseFactor = 1.3;
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + nextIntervalDays);
  // Reset time to start of day for cleaner scheduling
  nextReviewDate.setHours(0, 0, 0, 0);

  return {
    repetitions: nextRepetitions,
    intervalDays: nextIntervalDays,
    easeFactor: parseFloat(nextEaseFactor.toFixed(2)),
    nextReviewDate
  };
}

const FIBONACCI_SEQUENCE = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377];

export function calculateFibonacciSpacing(
  currentStage: number,
  rating: 'easy' | 'medium' | 'hard'
): SM2Parameters {
  let nextStage = currentStage;
  let nextIntervalDays = 1;

  if (rating === 'easy') {
    // Jump 2 stages for excellent recall
    nextStage = Math.min(FIBONACCI_SEQUENCE.length - 1, currentStage + 2);
    nextIntervalDays = FIBONACCI_SEQUENCE[nextStage];
  } else if (rating === 'medium') {
    // Move up 1 stage for correct recall
    nextStage = Math.min(FIBONACCI_SEQUENCE.length - 1, currentStage + 1);
    nextIntervalDays = FIBONACCI_SEQUENCE[nextStage];
  } else {
    // Hard / Forgot: drop back 2 stages (re-reinforce recall)
    nextStage = Math.max(0, currentStage - 2);
    nextIntervalDays = FIBONACCI_SEQUENCE[nextStage];
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + nextIntervalDays);
  nextReviewDate.setHours(0, 0, 0, 0);

  return {
    repetitions: nextStage,
    intervalDays: nextIntervalDays,
    easeFactor: 1.0,
    nextReviewDate
  };
}
