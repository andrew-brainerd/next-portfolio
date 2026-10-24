import type { HomeSection } from '@/types/home';

/** External web links open in a new tab; site routes and mailto stay in this one. */
export const opensInNewTab = (path: string) => /^https?:\/\//.test(path);

/** Sections with login-only links removed for signed-out visitors; empty sections are dropped. */
export const visibleSections = (sections: HomeSection[], isLoggedIn: boolean): HomeSection[] =>
  sections
    .map(section => ({
      ...section,
      links: section.links.filter(link => isLoggedIn || !link.requiresLogin)
    }))
    .filter(section => section.links.length > 0);
