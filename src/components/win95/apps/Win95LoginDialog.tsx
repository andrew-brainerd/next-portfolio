'use client';

import { useState } from 'react';
import { useSignInForm, useSignUpForm } from 'hooks/useAuthForms';
import { StartLogo } from '@/components/win95/Win95Icons';

interface Win95LoginDialogProps {
  redirectRoute: string;
  fromPath: string;
}

type TabValue = 'signIn' | 'signUp';

const Field = ({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="flex items-center gap-2">
    <span className="w-20 shrink-0 text-right">{label}:</span>
    <input className="win95-field flex-1" {...props} />
  </label>
);

const ResponseLine = ({ isError, message }: { isError: boolean; message: string }) =>
  message ? (
    <div className={`mt-1 text-[11px] ${isError ? 'text-[#a00000]' : 'text-[#007000]'}`}>
      {isError ? '⚠ ' : '✓ '}
      {message}
    </div>
  ) : null;

const SignInPanel = ({ redirectRoute }: { redirectRoute: string }) => {
  const f = useSignInForm(redirectRoute);
  const onEnter = (e: React.KeyboardEvent) => e.key === 'Enter' && f.handleSignIn();

  return (
    <div className="flex flex-col gap-3">
      <p>Type a user name and password to log on.</p>
      <div className="flex flex-col gap-2">
        <Field
          label="Email"
          value={f.email}
          onChange={e => f.setEmail(e.target.value)}
          onKeyDown={onEnter}
          autoFocus
          autoCapitalize="off"
          disabled={f.isLoading}
        />
        <Field
          label="Password"
          type={f.showPassword ? 'text' : 'password'}
          value={f.password}
          onChange={e => f.setPassword(e.target.value)}
          onKeyDown={onEnter}
          autoCapitalize="off"
          disabled={f.isLoading}
        />
        <label className="flex items-center gap-2 pl-[5.5rem]">
          <input
            type="checkbox"
            checked={f.showPassword}
            onChange={f.toggleShowPassword}
          />
          Show password
        </label>
      </div>
      <ResponseLine {...f.authResponse} />
      <div className="mt-1 flex justify-end gap-2">
        <button type="button" className="win95-btn" onClick={f.handleSignIn} disabled={f.isLoading}>
          OK
        </button>
        <button type="button" className="win95-btn" onClick={f.goToForgotPassword}>
          Forgot...
        </button>
      </div>
    </div>
  );
};

const SignUpPanel = ({ redirectRoute }: { redirectRoute: string }) => {
  const f = useSignUpForm(redirectRoute);
  const onEnter = (e: React.KeyboardEvent) => e.key === 'Enter' && f.handleEmailSignUp();

  return (
    <div className="flex flex-col gap-3">
      <p>Enter your invite code and details to create an account.</p>
      <div className="flex flex-col gap-2">
        <Field
          label="Invite"
          value={f.inviteCode}
          onChange={e => f.setInviteCode(e.target.value)}
          onKeyDown={onEnter}
          autoFocus
          autoCapitalize="off"
          disabled={f.isLoading}
        />
        <Field
          label="Email"
          value={f.email}
          onChange={e => f.setEmail(e.target.value)}
          onKeyDown={onEnter}
          autoCapitalize="off"
          disabled={f.isLoading}
        />
        <Field
          label="Password"
          type={f.showPassword ? 'text' : 'password'}
          value={f.password}
          onChange={e => f.setPassword(e.target.value)}
          onKeyDown={onEnter}
          autoCapitalize="off"
          disabled={f.isLoading}
        />
        <label className="flex items-center gap-2 pl-[5.5rem]">
          <input
            type="checkbox"
            checked={f.showPassword}
            onChange={f.toggleShowPassword}
          />
          Show password
        </label>
      </div>
      <ResponseLine {...f.authResponse} />
      <div className="mt-1 flex justify-end gap-2">
        <button
          type="button"
          className="win95-btn"
          onClick={f.handleEmailSignUp}
          disabled={f.isLoading}
        >
          Create
        </button>
        <button
          type="button"
          className="win95-btn"
          onClick={f.handleGoogleSignUp}
          disabled={f.isLoading}
        >
          Google
        </button>
      </div>
    </div>
  );
};

export const Win95LoginDialog = ({ redirectRoute, fromPath }: Win95LoginDialogProps) => {
  const [tab, setTab] = useState<TabValue>('signIn');
  const isManga = fromPath.startsWith('/manga');

  return (
    <div className="flex h-full items-center justify-center p-4 text-[11px]">
      <div className="win95-raised w-80 max-w-full">
        <div className="win95-title-bar">
          <span className="win95-title-text">
            <StartLogo />
            {isManga ? 'Manga Login' : 'Log On to Windows'}
          </span>
        </div>

        <div className="p-3">
          <div className="mb-3 flex gap-1">
            <button
              type="button"
              className={`win95-btn win95-btn-sm flex-1 ${tab === 'signIn' ? 'win95-pressed' : ''}`}
              aria-pressed={tab === 'signIn'}
              onClick={() => setTab('signIn')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`win95-btn win95-btn-sm flex-1 ${tab === 'signUp' ? 'win95-pressed' : ''}`}
              aria-pressed={tab === 'signUp'}
              onClick={() => setTab('signUp')}
            >
              Sign Up
            </button>
          </div>

          {tab === 'signIn' ? (
            <SignInPanel redirectRoute={redirectRoute} />
          ) : (
            <SignUpPanel redirectRoute={redirectRoute} />
          )}
        </div>
      </div>
    </div>
  );
};
