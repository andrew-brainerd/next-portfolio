'use client';

import { useId, useState } from 'react';

import { submitWeddingQuiz } from '@/api/wedding';
import { useGuideMe } from '@/hooks/useGuideMe';
import { useLocalJson } from '@/hooks/useLocalJson';
import { useNow } from '@/hooks/useNow';
import type { PublicWeddingGuideConfig, QuizAnswers, QuizResult, StoredQuizResult } from '@/types/wedding';
import { formatZonedTime } from '@/utils/scheduleTime';
import { getWeddingClientId } from '@/utils/weddingClient';
import { getQuizView, isQuizCounting } from '@/utils/weddingQuiz';
import { GuideSection } from '../GuideSection';
import { QuizLeaderboard } from '../QuizLeaderboard';

type PublicQuiz = PublicWeddingGuideConfig['quiz'];

interface ResultListProps {
  quiz: PublicQuiz;
  result: QuizResult;
}

const ResultList = ({ quiz, result }: ResultListProps) => (
  <ol className="mt-4 space-y-3">
    {result.results.map(outcome => {
      const question = quiz.questions.find(candidate => candidate.id === outcome.id);
      if (!question) return null;
      return (
        <li key={outcome.id} className="rounded-lg border border-[var(--sb-gold)]/60 p-3">
          <p className="font-semibold">{question.prompt}</p>
          <p className={outcome.correct ? 'text-green-800' : 'text-[var(--sb-crimson)]'}>
            {outcome.correct ? '✓ ' : '✗ The answer was '}
            {question.choices[outcome.answerIndex]}
          </p>
          {outcome.reveal && <p className="mt-1 font-garamond italic opacity-80">{outcome.reveal}</p>}
        </li>
      );
    })}
  </ol>
);

interface QuizSectionProps {
  quiz: PublicQuiz;
  timeZone: string;
  initialNow: number;
}

export const QuizSection = ({ quiz, timeZone, initialNow }: QuizSectionProps) => {
  const nameId = useId();
  const now = useNow(initialNow);
  const [me] = useGuideMe();
  const [stored, setStored] = useLocalJson<StoredQuizResult>('wedding:guide:quiz');
  const [name, setName] = useState<string | undefined>();
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const view = getQuizView(quiz, stored, now);
  const counting = isQuizCounting(quiz, now);
  const countsFromLabel = quiz.countsFrom ? formatZonedTime(Date.parse(quiz.countsFrom), timeZone) : undefined;
  const closesAtLabel = quiz.closesAt ? formatZonedTime(Date.parse(quiz.closesAt), timeZone) : undefined;

  // Default to the remembered seat's name, but never "Guest of …"
  const defaultName = stored?.name ?? (me && !me.name.startsWith('Guest of') ? me.name : '');
  const displayName = name ?? defaultName;
  const complete = displayName.trim().length > 0 && quiz.questions.every(question => question.id in answers);

  const submit = async () => {
    if (!complete || submitting) return;
    setSubmitting(true);
    setError(undefined);
    const outcome = await submitWeddingQuiz({ clientId: getWeddingClientId(), name: displayName.trim(), answers });
    setSubmitting(false);

    if (outcome.status === 'ok') {
      setStored({ name: displayName.trim(), result: outcome.result });
      setAnswers({});
    } else if (outcome.status === 'closed') {
      setError('The quiz has closed.');
    } else {
      setError("Couldn't submit — check your connection and try again.");
    }
  };

  return (
    <GuideSection id="quiz" title={quiz.title || 'Couple quiz'}>
      {quiz.intro && <p className="font-garamond text-lg">{quiz.intro}</p>}

      {(view === 'form' || view === 'retake') && (
        <div className="mt-3 space-y-4">
          {view === 'retake' && stored && (
            <p className="rounded-lg bg-[var(--sb-gold)]/25 p-3 font-garamond">
              Your practice score was {stored.result.score}/{stored.result.total}. This is your official attempt — it
              counts!
            </p>
          )}
          {!counting && countsFromLabel && (
            <p className="rounded-lg border border-[var(--sb-crimson)]/40 bg-[var(--sb-crimson)]/5 p-3 font-garamond">
              Entries before {countsFromLabel} are for practice and won&apos;t count for the prize.
            </p>
          )}
          {closesAtLabel && (
            <p className="text-sm opacity-80">Closes at {closesAtLabel} — winner announced after.</p>
          )}

          <div>
            <label htmlFor={nameId} className="block font-garamond">
              Your name for the leaderboard
            </label>
            <input
              id={nameId}
              value={displayName}
              onChange={event => setName(event.target.value)}
              maxLength={40}
              autoComplete="name"
              className="mt-1 w-full rounded-lg border border-[var(--sb-gold)] bg-[var(--sb-white)] px-4 py-3 text-base focus:border-[var(--sb-crimson)] focus:outline-none"
            />
          </div>

          <ol className="space-y-4">
            {quiz.questions.map((question, index) => (
              <li key={question.id}>
                <fieldset className="rounded-lg border border-[var(--sb-gold)]/60 p-3">
                  <legend className="px-1 font-semibold">
                    {index + 1}. {question.prompt}
                  </legend>
                  <div className="mt-1 grid gap-2">
                    {question.choices.map((choice, choiceIndex) => (
                      <button
                        key={choiceIndex}
                        type="button"
                        aria-pressed={answers[question.id] === choiceIndex}
                        onClick={() => setAnswers(current => ({ ...current, [question.id]: choiceIndex }))}
                        className="min-h-11 rounded-lg border border-[var(--sb-gold)] px-4 py-2 text-left transition-colors aria-pressed:border-[var(--sb-crimson)] aria-pressed:bg-[var(--sb-crimson)] aria-pressed:text-[var(--sb-white)]"
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={submit}
            disabled={!complete || submitting}
            className="min-h-11 w-full rounded-lg bg-[var(--sb-crimson)] px-4 py-3 font-garamond text-lg text-[var(--sb-white)] disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : counting ? 'Submit my answers' : 'Submit practice run'}
          </button>
          <p aria-live="polite" className="min-h-5 text-sm text-[var(--sb-crimson)]">
            {error}
          </p>
        </div>
      )}

      {view === 'practice' && stored && (
        <div className="mt-3 rounded-lg bg-[var(--sb-gold)]/25 p-4 text-center font-garamond">
          <p className="text-3xl">
            {stored.result.score}/{stored.result.total}
          </p>
          <p className="mt-1">
            Practice score. Come back after {countsFromLabel ?? 'the reception starts'} for your official attempt!
          </p>
        </div>
      )}

      {view === 'result' && stored && (
        <div className="mt-3">
          <div className="rounded-lg bg-[var(--sb-gold)]/25 p-4 text-center font-garamond">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--sb-crimson)]">Your score</p>
            <p className="text-4xl">
              {stored.result.score}/{stored.result.total}
            </p>
          </div>
          <ResultList quiz={quiz} result={stored.result} />
        </div>
      )}

      {(view === 'closed' || view === 'practice-closed') && (
        <p className="mt-3 font-garamond text-lg">
          The quiz is closed.
          {view === 'practice-closed' && stored && ` Your practice score was ${stored.result.score}/${stored.result.total}.`}
        </p>
      )}

      {quiz.leaderboard !== 'hidden' && (view === 'result' || view === 'closed' || view === 'practice-closed') && (
        <QuizLeaderboard closesAt={quiz.closesAt} timeZone={timeZone} />
      )}
    </GuideSection>
  );
};
