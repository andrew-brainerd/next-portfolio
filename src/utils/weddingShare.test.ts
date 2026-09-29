import { describe, expect, it } from 'vitest';

import { resolveEnterDestination, shareLinkUrls } from './weddingShare';

describe('resolveEnterDestination', () => {
  it('sends share links to their destination', () => {
    expect(resolveEnterDestination('hub', null)).toEqual({ pathname: '/wedding', search: '' });
    expect(resolveEnterDestination('story', null)).toEqual({ pathname: '/wedding/story', search: '' });
    expect(resolveEnterDestination('details', null)).toEqual({ pathname: '/wedding/details', search: '' });
    expect(resolveEnterDestination('rsvp', 't7')).toEqual({ pathname: '/wedding/rsvp', search: '' });
    expect(resolveEnterDestination('guide', null)).toEqual({ pathname: '/wedding/guide', search: '' });
  });

  it('falls back to the hub for an unknown destination', () => {
    expect(resolveEnterDestination('settings', null)).toEqual({ pathname: '/wedding', search: '' });
    expect(resolveEnterDestination('toString', null)).toEqual({ pathname: '/wedding', search: '' });
    expect(resolveEnterDestination('', null)).toEqual({ pathname: '/wedding', search: '' });
  });

  it('keeps printed tags landing on the guide with a valid table', () => {
    expect(resolveEnterDestination(null, 'head')).toEqual({ pathname: '/wedding/guide', search: '?table=head' });
    expect(resolveEnterDestination(null, null)).toEqual({ pathname: '/wedding/guide', search: '' });
    expect(resolveEnterDestination(null, '../settings')).toEqual({ pathname: '/wedding/guide', search: '' });
  });
});

describe('shareLinkUrls', () => {
  it('builds one link per destination from the share key', () => {
    const links = shareLinkUrls('https://brainerd.dev', 'Ab3_x');

    expect(links.map(link => link.to)).toEqual(['hub', 'story', 'details', 'rsvp', 'guide']);
    expect(links[0]).toEqual({
      to: 'hub',
      label: 'Wedding home',
      url: 'https://brainerd.dev/wedding/enter?k=Ab3_x&to=hub'
    });
  });

  it('is empty without a share key', () => {
    expect(shareLinkUrls('https://brainerd.dev', '')).toEqual([]);
  });
});
