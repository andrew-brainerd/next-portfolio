import { describe, it, expect } from 'vitest';
import type { HomeSection } from '@/types/home';
import { opensInNewTab, visibleSections } from '@/utils/home';

const Icon = () => null;

const SECTIONS: HomeSection[] = [
  {
    id: 'play',
    label: 'Play',
    description: '',
    links: [
      { name: 'Public', description: '', path: '/public', Icon },
      { name: 'Private', description: '', path: '/private', Icon, requiresLogin: true }
    ]
  },
  {
    id: 'secret',
    label: 'Secret',
    description: '',
    links: [{ name: 'Hidden', description: '', path: '/hidden', Icon, requiresLogin: true }]
  }
];

describe('opensInNewTab', () => {
  it('opens external web links in a new tab', () => {
    expect(opensInNewTab('https://github.com/andrew-brainerd')).toBe(true);
    expect(opensInNewTab('http://example.com')).toBe(true);
  });

  it('keeps site routes and mailto links in the current tab', () => {
    expect(opensInNewTab('/steam')).toBe(false);
    expect(opensInNewTab('mailto:andrew@brainerd.dev')).toBe(false);
  });
});

describe('visibleSections', () => {
  it('shows every link when signed in', () => {
    const sections = visibleSections(SECTIONS, true);
    expect(sections.map(s => s.links.map(l => l.name))).toEqual([['Public', 'Private'], ['Hidden']]);
  });

  it('hides login-only links and drops sections left empty when signed out', () => {
    const sections = visibleSections(SECTIONS, false);
    expect(sections.map(s => s.id)).toEqual(['play']);
    expect(sections[0].links.map(l => l.name)).toEqual(['Public']);
  });
});
