'use client';

import { useEffect, useRef, useState } from 'react';

import type { GuideSection, GuideSectionId } from '@/types/wedding';

interface SectionNavProps {
  sections: GuideSection[];
}

export const SectionNav = ({ sections }: SectionNavProps) => {
  const [active, setActive] = useState<GuideSectionId | undefined>(sections[0]?.id);
  const chipRefs = useRef(new Map<GuideSectionId, HTMLAnchorElement>());

  // Scroll-spy: the section crossing the upper-middle of the viewport is active
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.find(entry => entry.isIntersecting);
        if (visible) setActive(visible.target.id as GuideSectionId);
      },
      { rootMargin: '-35% 0px -60% 0px' }
    );
    sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    if (active) chipRefs.current.get(active)?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [active]);

  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="Guide sections"
      className="sticky top-0 z-10 border-y border-[var(--sb-gold)]/50 bg-[var(--sb-cream)]/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-xl gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none]">
        {sections.map(section => (
          <li key={section.id} className="shrink-0">
            <a
              ref={element => {
                if (element) chipRefs.current.set(section.id, element);
              }}
              href={`#${section.id}`}
              aria-current={active === section.id ? 'location' : undefined}
              className="flex min-h-11 items-center rounded-full border border-[var(--sb-gold)] px-4 font-garamond text-sm text-[var(--sb-ink)] transition-colors aria-[current=location]:bg-[var(--sb-crimson)] aria-[current=location]:text-[var(--sb-white)]"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
