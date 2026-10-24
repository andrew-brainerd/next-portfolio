import Link from 'next/link';
import type { HomeLinkItem } from '@/types/home';
import { opensInNewTab } from '@/utils/home';

type HomeLinkProps = HomeLinkItem;

const CARD_CLASS =
  'group flex h-full items-center gap-4 rounded-2xl border border-neutral-500/20 bg-gradient-to-br from-neutral-600/40 to-neutral-700/40 p-4 shadow-sm backdrop-blur-sm transition duration-300 hover:border-brand-400/50 motion-safe:hover:-translate-y-0.5 focus:outline-none focus-visible:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900';

export const HomeLink = ({ name, description, path, Icon }: HomeLinkProps) => {
  const newTab = opensInNewTab(path);

  const content = (
    <>
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-neutral-900/30 transition-colors duration-300 group-hover:bg-brand-500/20 group-focus-visible:bg-brand-500/20">
        <Icon className="h-9 w-9 fill-white" aria-hidden="true" />
      </span>
      <span className="min-w-0 text-left">
        <span className="block font-semibold text-white">
          {name}
          {newTab && (
            <svg
              viewBox="0 0 12 12"
              className="ml-1 inline h-3 w-3 align-baseline text-neutral-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
            </svg>
          )}
        </span>
        <span className="block text-sm text-neutral-300">{description}</span>
        {newTab && <span className="sr-only"> (opens in a new tab)</span>}
      </span>
    </>
  );

  if (path.startsWith('/')) {
    return (
      <Link className={CARD_CLASS} href={path}>
        {content}
      </Link>
    );
  }

  return (
    <a
      className={CARD_CLASS}
      href={path}
      {...(newTab && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {content}
    </a>
  );
};
