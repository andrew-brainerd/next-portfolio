import { describe, expect, it } from 'vitest';

import { codeFromQuery, linkErrorMessage, linkPath, linkSuccessMessage, needsSignIn } from './linkDevice';

describe('linkDevice messages', () => {
  it('names what was paired', () => {
    expect(linkSuccessMessage('charter')).toContain('Charter Forever is paired');
    expect(linkSuccessMessage('condensate')).toContain('Condensate is now signed in');
    expect(linkSuccessMessage('watch')).toBe('Device linked! It should continue in a few seconds.');
    expect(linkSuccessMessage(undefined)).toBe('Device linked! It should continue in a few seconds.');
  });

  it('only blames the code when the server rejected the code', () => {
    expect(linkErrorMessage({ status: 400 })).toContain('invalid or has expired');
    for (const status of [0, 401, 500, 502]) {
      expect(linkErrorMessage({ status })).not.toContain('invalid');
    }
  });

  it('treats an expired session as a sign-in problem, including the API’s 500', () => {
    expect(needsSignIn({ status: 401 })).toBe(true);
    expect(needsSignIn({ status: 403 })).toBe(true);
    expect(needsSignIn({ status: 500, title: 'Authentication failed' })).toBe(true);
    expect(needsSignIn({ status: 500, title: 'Failed to approve device' })).toBe(false);
    expect(linkErrorMessage({ status: 500, title: 'Authentication failed' })).toContain('sign-in has expired');
  });

  it('separates network trouble from server errors', () => {
    expect(linkErrorMessage({ status: 0 })).toContain("Couldn't reach brainerd.dev");
    expect(linkErrorMessage({ status: 503 })).toContain('error 503');
  });
});

describe('linking Condensate', () => {
  it('asks for a Steam sign-in when the code needs one', () => {
    const result = { status: 400, reason: 'steamRequired' };
    expect(linkErrorMessage(result)).toContain('Sign in with Steam');
    expect(needsSignIn(result)).toBe(true);
    expect(needsSignIn({ status: 400 })).toBe(false);
  });

  it('takes the code from the QR link and keeps it through sign-in', () => {
    expect(codeFromQuery('abcd-efgh')).toBe('ABCD-EFGH');
    expect(codeFromQuery('AB<script>CD')).toBe('ABSCRIPTC');
    expect(codeFromQuery(['A', 'B'])).toBe('');
    expect(codeFromQuery(undefined)).toBe('');
    expect(linkPath('ABCD-EFGH')).toBe('/link?code=ABCD-EFGH');
    expect(linkPath('')).toBe('/link');
  });
});
