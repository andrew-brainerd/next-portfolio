'use client';

import { QUIZ_CHOICE_COUNT, QUIZ_LEADERBOARD_MODES } from '@/constants/wedding';
import type { QuizQuestion, WeddingQuizConfig } from '@/types/wedding';
import { isoToZonedLocal, isQuizQuestionComplete, newQuizQuestionId, zonedLocalToIso } from '@/utils/weddingGuide';
import { CheckboxField, SelectField, TextArea, TextField } from './FormFields';
import { ListEditor } from './ListEditor';

interface QuizEditorProps {
  quiz: WeddingQuizConfig;
  timeZone: string;
  onChange: (quiz: WeddingQuizConfig) => void;
}

export const QuizEditor = ({ quiz, timeZone, onChange }: QuizEditorProps) => (
  <>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <CheckboxField
        label="Quiz visible to guests"
        checked={quiz.enabled}
        onChange={enabled => onChange({ ...quiz, enabled })}
      />
      <CheckboxField
        label="Accepting answers"
        checked={quiz.open}
        onChange={open => onChange({ ...quiz, open })}
        hint="Manual override — off closes the quiz immediately."
      />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TextField
        label={`Entries count from (${timeZone})`}
        type="datetime-local"
        value={isoToZonedLocal(quiz.countsFrom, timeZone)}
        onChange={local => onChange({ ...quiz, countsFrom: zonedLocalToIso(local, timeZone) })}
        hint="Earlier submissions are practice runs: score only, off the leaderboard."
      />
      <TextField
        label={`Closes at (${timeZone})`}
        type="datetime-local"
        value={isoToZonedLocal(quiz.closesAt, timeZone)}
        onChange={local => onChange({ ...quiz, closesAt: zonedLocalToIso(local, timeZone) })}
        hint="Submissions stop automatically at this time."
      />
    </div>
    <SelectField
      label="Leaderboard"
      value={quiz.leaderboard}
      onChange={leaderboard => onChange({ ...quiz, leaderboard })}
      options={QUIZ_LEADERBOARD_MODES}
    />
    <TextField
      label="Title"
      value={quiz.title ?? ''}
      onChange={title => onChange({ ...quiz, title })}
      placeholder="How well do you know us?"
      maxLength={120}
    />
    <TextArea
      label="Intro"
      value={quiz.intro ?? ''}
      onChange={intro => onChange({ ...quiz, intro })}
      maxLength={1000}
    />
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">Questions</h3>
      <ListEditor
        items={quiz.questions}
        onChange={questions => onChange({ ...quiz, questions })}
        makeItem={(): QuizQuestion => ({
          id: newQuizQuestionId(),
          prompt: '',
          choices: Array.from({ length: QUIZ_CHOICE_COUNT }, () => ''),
          answerIndex: 0,
          reveal: ''
        })}
        addLabel="Add question"
        itemLabel={index => `Question ${index + 1}`}
        renderItem={(question, update) => (
          <div className="space-y-4">
            {!isQuizQuestionComplete(question) && (
              <p className="text-xs text-warning-100">Incomplete — needs a prompt and all 3 choices to be saved.</p>
            )}
            <TextField
              label="Question"
              value={question.prompt}
              onChange={prompt => update({ ...question, prompt })}
              placeholder="Which is Hayley's favorite Pokémon?"
              maxLength={300}
            />
            <fieldset className="space-y-2">
              <legend className="text-sm text-neutral-300">Choices — select the correct one</legend>
              {question.choices.map((choice, choiceIndex) => (
                <div key={choiceIndex} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={`answer-${question.id}`}
                    checked={question.answerIndex === choiceIndex}
                    onChange={() => update({ ...question, answerIndex: choiceIndex })}
                    aria-label={`Choice ${choiceIndex + 1} is correct`}
                    className="h-4 w-4 accent-brand-600"
                  />
                  <div className="flex-1">
                    <TextField
                      label={`Choice ${choiceIndex + 1}`}
                      value={choice}
                      onChange={value =>
                        update({
                          ...question,
                          choices: question.choices.map((existing, i) => (i === choiceIndex ? value : existing))
                        })
                      }
                      maxLength={200}
                    />
                  </div>
                </div>
              ))}
            </fieldset>
            <TextField
              label="Reveal"
              value={question.reveal ?? ''}
              onChange={reveal => update({ ...question, reveal })}
              placeholder="Shown after the guest's official attempt"
              maxLength={500}
            />
          </div>
        )}
      />
    </div>
  </>
);
