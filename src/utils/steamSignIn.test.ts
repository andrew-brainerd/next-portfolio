import { describe, expect, it } from 'vitest';

import { openIdParams, safeRedirect, steamCallbackProblem, steamLinkMessage, steamProblemMessage } from './steamSignIn';

describe('steamLinkMessage', () => {
  it('explains each link outcome', () => {
    expect(steamLinkMessage('linked')).toContain('linked');
    expect(steamLinkMessage('steam_linked_elsewhere')).toContain('another brainerd.dev account');
    expect(steamLinkMessage('account_has_steam')).toContain('Unlink it first');
    expect(steamLinkMessage('failed')).toContain('try again');
  });
});

describe('steamSignIn', () => {
  it('only redirects to same-site paths', () => {
    expect(safeRedirect('/link')).toBe('/link');
    expect(safeRedirect('/link?code=ABCD')).toBe('/link?code=ABCD');
    for (const bad of [null, undefined, '', 'https://evil.example', '//evil.example', '/\\evil.example', 'link']) {
      expect(safeRedirect(bad)).toBe('/');
    }
  });

  it('keeps only the openid params for the server', () => {
    const search = new URLSearchParams('state=abc&openid.mode=id_res&openid.sig=xyz&other=1');
    expect(openIdParams(search)).toEqual({ 'openid.mode': 'id_res', 'openid.sig': 'xyz' });
  });

  it('accepts a positive assertion with the state this browser started', () => {
    const search = new URLSearchParams('state=abc&openid.mode=id_res');
    expect(steamCallbackProblem(search, 'abc')).toBeNull();
  });

  it('reports a cancelled sign-in', () => {
    expect(steamCallbackProblem(new URLSearchParams('state=abc&openid.mode=cancel'), 'abc')).toBe('cancelled');
  });

  it('rejects a callback this browser did not start', () => {
    const search = new URLSearchParams('state=abc&openid.mode=id_res');
    expect(steamCallbackProblem(search, 'other')).toBe('stateMismatch');
    expect(steamCallbackProblem(search, null)).toBe('stateMismatch');
    expect(steamCallbackProblem(new URLSearchParams('openid.mode=id_res'), 'abc')).toBe('stateMismatch');
  });

  it('explains each problem', () => {
    expect(steamProblemMessage('cancelled')).toContain('cancelled');
    expect(steamProblemMessage('stateMismatch')).toContain('try again');
  });
});
