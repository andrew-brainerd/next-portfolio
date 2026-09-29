import type { PublicWeddingConfig } from '@/types/wedding';
import { STORY_CHAPTERS } from '@/content/wedding/story';
import { chapterLabel } from '@/utils/wedding';
import { StorybookCover } from './StorybookCover';
import { StoryPage } from './StoryPage';
import type { StorybookPageDef } from './StorybookReader';

/**
 * Assembles the book: cover → authored story chapters → back cover. Logistics
 * live at /wedding/details and RSVP at /wedding/rsvp (spec §3 "Release windows").
 */
export const buildStorybook = (config: PublicWeddingConfig): StorybookPageDef[] => {
  const pages: StorybookPageDef[] = [
    {
      id: 'cover',
      hard: true,
      node: (
        <StorybookCover
          config={config}
          art="/wedding/cover.jpg"
          artAlt="Illustrated cover portrait of Andrew and Hayley framed in gold flourishes on deep crimson"
        />
      )
    }
  ];

  STORY_CHAPTERS.forEach((chapter, index) => {
    pages.push({
      id: chapter.id,
      node: (
        <StoryPage
          art={chapter.art}
          artAlt={chapter.artAlt}
          chapterLabel={chapterLabel(index)}
          title={chapter.title}
          theme={chapter.theme}
        >
          {chapter.paragraphs.map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </StoryPage>
      )
    });
  });

  pages.push({
    id: 'back-cover',
    hard: true,
    node: (
      <div className="flex h-full w-full items-center justify-center bg-[var(--sb-crimson)] p-10">
        <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-[var(--sb-gold)]/70">
          <p className="font-pacifico text-2xl text-[var(--sb-gold)]">See you there</p>
        </div>
      </div>
    )
  });

  return pages;
};
