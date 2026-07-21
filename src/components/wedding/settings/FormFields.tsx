'use client';

import { useId, type ReactNode } from 'react';

const INPUT_CLASS =
  'mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950/50 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-brand-400 focus:outline-none';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'date' | 'url';
  placeholder?: string;
  maxLength?: number;
  hint?: string;
}

export const TextField = ({ label, value, onChange, type = 'text', placeholder, maxLength, hint }: TextFieldProps) => {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="block text-sm text-neutral-300">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={INPUT_CLASS}
      />
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
};

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

export const TextArea = ({ label, value, onChange, placeholder, rows = 3, maxLength }: TextAreaProps) => {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="block text-sm text-neutral-300">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={INPUT_CLASS}
      />
    </div>
  );
};

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}

export const CheckboxField = ({ label, checked, onChange, hint }: CheckboxFieldProps) => {
  const id = useId();

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={event => onChange(event.target.checked)}
          className="h-4 w-4 rounded border-neutral-700 bg-neutral-950/50 accent-brand-600"
        />
        <label htmlFor={id} className="text-sm text-neutral-200">
          {label}
        </label>
      </div>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
};

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const SectionCard = ({ title, description, children }: SectionCardProps) => (
  <section className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-5">
    <h2 className="text-lg font-semibold text-neutral-100">{title}</h2>
    {description && <p className="mt-1 text-sm text-neutral-400">{description}</p>}
    <div className="mt-4 space-y-4">{children}</div>
  </section>
);
