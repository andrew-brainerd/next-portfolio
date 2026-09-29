import { describe, expect, it } from 'vitest';

import { parsePreviewAt, resolveEnterDestination, shareLinkUrls, toWeddingSitePath, withPreviewAt } from './weddingShare';

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
    const links = shareLinkUrls('https://brainerd.wedding/enter', 'Ab3_x');

    expect(links.map(link => link.to)).toEqual(['hub', 'story', 'details', 'rsvp', 'guide']);
    expect(links[0]).toEqual({
      to: 'hub',
      label: 'Wedding home',
      url: 'https://brainerd.wedding/enter?k=Ab3_x&to=hub'
    });
  });

  it('is empty without a share key', () => {
    expect(shareLinkUrls('https://brainerd.wedding/enter', '')).toEqual([]);
  });
});

describe('toWeddingSitePath', () => {
  it('drops the /wedding prefix the domain redirect adds back', () => {
    expect(toWeddingSitePath('/wedding')).toBe('/');
    expect(toWeddingSitePath('/wedding/enter')).toBe('/enter');
    expect(toWeddingSitePath('/wedding/guide')).toBe('/guide');
  });

  it('leaves other paths alone', () => {
    expect(toWeddingSitePath('/weddings')).toBe('/weddings');
  });
});

describe('parsePreviewAt', () => {
  it('reads an epoch-ms preview date', () => {
    expect(parsePreviewAt('1826470800000')).toBe(1826470800000);
  });

  it('ignores missing or malformed dates', () => {
    expect(parsePreviewAt(null)).toBeUndefined();
    expect(parsePreviewAt('')).toBeUndefined();
    expect(parsePreviewAt('0')).toBeUndefined();
    expect(parsePreviewAt('-5')).toBeUndefined();
    expect(parsePreviewAt('2027-10-01')).toBeUndefined();
    expect(parsePreviewAt('99999999999999999999')).toBeUndefined();
  });
});

describe('withPreviewAt', () => {
  const url = 'https://brainerd.wedding/enter?k=Ab3_x&to=rsvp';

  it('appends the preview date', () => {
    expect(withPreviewAt(url, 1826470800000)).toBe(`${url}&at=1826470800000`);
  });

  it('leaves the link alone without one', () => {
    expect(withPreviewAt(url, undefined)).toBe(url);
  });
});
