'use client';

import Button from '@mui/material/Button';

import type { BuzzedGrade, BuzzedQuestion } from '@/types/buzzed';

interface GradePromptProps {
  question: BuzzedQuestion;
  pending: boolean;
  onGrade: (questionIndex: number, grade: BuzzedGrade) => void;
}

export const GradePrompt = ({ question, pending, onGrade }: GradePromptProps) => (
  <div className="w-full min-w-0 rounded-lg border border-neutral-700 bg-neutral-900 p-4 text-center">
    <p className="font-semibold text-white">Did you get it right?</p>
    <p className="mb-3 text-xs text-neutral-500">The answer is on screen now</p>

    <div className="flex gap-2">
      <Button
        fullWidth
        variant="contained"
        color="success"
        disabled={pending}
        onClick={() => onGrade(question.index, 'correct')}
      >
        👍 Got it
      </Button>
      <Button
        fullWidth
        variant="outlined"
        color="error"
        disabled={pending}
        onClick={() => onGrade(question.index, 'missed')}
      >
        👎 Missed
      </Button>
    </div>
  </div>
);
