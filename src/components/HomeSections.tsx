import { HomeLink } from '@/components/HomeLink';
import { HOME_SECTIONS } from '@/constants/homeLinks';
import { visibleSections } from '@/utils/home';

interface HomeSectionsProps {
  isLoggedIn: boolean;
}

export const HomeSections = ({ isLoggedIn }: HomeSectionsProps) => (
  <div className="flex-1 bg-gradient-to-b from-transparent to-neutral-800/20 px-6 py-10">
    <div className="container mx-auto max-w-5xl space-y-12">
      {visibleSections(HOME_SECTIONS, isLoggedIn).map(section => (
        <section key={section.id} aria-labelledby={`home-${section.id}`} className="motion-safe:animate-fade-in-up">
          <h2
            id={`home-${section.id}`}
            className="mb-4 border-b border-neutral-500/20 pb-3 text-xl font-bold text-brand-400"
          >
            {section.label}
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.links.map(link => (
              <li key={link.path}>
                <HomeLink {...link} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  </div>
);
