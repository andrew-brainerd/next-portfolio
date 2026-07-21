import type { PublicWeddingConfig } from '@/types/wedding';
import { STORY_CHAPTERS } from '@/content/wedding/story';
import { chapterLabel } from '@/utils/wedding';
import { StorybookCover } from './StorybookCover';
import { StoryPage } from './StoryPage';
import type { StorybookPageDef } from './StorybookReader';
import { FaqPage } from './pages/FaqPage';
import { HotelsPage } from './pages/HotelsPage';
import { RegistryPage } from './pages/RegistryPage';
import { SchedulePage } from './pages/SchedulePage';
import { TravelPage, hasTravelContent } from './pages/TravelPage';
import { VenuePage } from './pages/VenuePage';

/**
 * Assembles the whole book (spec §6 order): cover → authored story chapters →
 * "The Plan" divider → logistics pages (sections without content are simply
 * left out) → FAQ → back cover. The RSVP page slots in before the back cover
 * in Phase W-F.
 */
export const buildStorybook = (config: PublicWeddingConfig): StorybookPageDef[] => {
  const pages: StorybookPageDef[] = [{ id: 'cover', hard: true, node: <StorybookCover config={config} /> }];

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
    id: 'plan-divider',
    node: (
      <StoryPage chapterLabel="Part Two" title="The Plan" theme="festival">
        <p>The storybook part you can put in your calendar.</p>
      </StoryPage>
    )
  });

  pages.push({ id: 'venue', node: <VenuePage config={config} /> });

  if (config.schedule.length > 0) {
    pages.push({ id: 'schedule', node: <SchedulePage schedule={config.schedule} /> });
  }

  if (config.hotels.length > 0) {
    pages.push({ id: 'hotels', node: <HotelsPage hotels={config.hotels} /> });
  }

  if (hasTravelContent(config)) {
    pages.push({ id: 'travel', node: <TravelPage config={config} /> });
  }

  if (config.registry.length > 0 || config.honeymoonFund) {
    pages.push({ id: 'registry', node: <RegistryPage config={config} /> });
  }

  if (config.faq.length > 0) {
    pages.push({ id: 'faq', node: <FaqPage faq={config.faq} /> });
  }

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
