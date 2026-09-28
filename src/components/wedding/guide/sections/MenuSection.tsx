import { DIETARY_TAGS } from '@/constants/wedding';
import type { DietaryTag, MenuCourse, WeddingGuideConfig } from '@/types/wedding';
import { GuideSection } from '../GuideSection';

const TAG_LABELS = new Map(DIETARY_TAGS.map(tag => [tag.value, tag.label]));

// Short chip text; the legend spells them out
const chipText = (tag: DietaryTag): string =>
  tag === 'contains-nuts' ? 'Nuts' : tag === 'spicy' ? 'Spicy' : tag;

interface CourseListProps {
  courses: MenuCourse[];
}

const CourseList = ({ courses }: CourseListProps) => (
  <div className="space-y-5">
    {courses.map(course => (
      <div key={course.title}>
        <h3 className="font-garamond text-sm uppercase tracking-[0.25em] text-[var(--sb-crimson)]">{course.title}</h3>
        <ul className="mt-2 space-y-3">
          {course.items.map(item => (
            <li key={item.name}>
              <p className="font-semibold">
                {item.name}
                {item.tags.map(tag => (
                  <abbr
                    key={tag}
                    title={TAG_LABELS.get(tag)}
                    className="ml-2 rounded-full border border-[var(--sb-gold)] px-2 py-0.5 align-middle text-xs font-normal no-underline"
                  >
                    {chipText(tag)}
                  </abbr>
                ))}
              </p>
              {item.description && <p className="text-sm opacity-80">{item.description}</p>}
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

interface MenuSectionProps {
  menu: WeddingGuideConfig['menu'];
}

export const MenuSection = ({ menu }: MenuSectionProps) => {
  const usedTags = DIETARY_TAGS.filter(tag =>
    [...menu.courses, ...menu.bar].some(course => course.items.some(item => item.tags.includes(tag.value)))
  );

  return (
    <GuideSection id="menu" title="Menu">
      <CourseList courses={menu.courses} />
      {menu.bar.length > 0 && (
        <div className="mt-6 border-t border-[var(--sb-gold)]/50 pt-5">
          <h3 className="mb-3 font-garamond text-xl text-[var(--sb-crimson)]">At the bar</h3>
          <CourseList courses={menu.bar} />
        </div>
      )}
      {usedTags.length > 0 && (
        <p className="mt-5 text-xs opacity-70">
          {usedTags.map(tag => `${chipText(tag.value)} = ${tag.label}`).join(' · ')}
        </p>
      )}
      {menu.note && <p className="mt-2 font-garamond italic">{menu.note}</p>}
    </GuideSection>
  );
};
