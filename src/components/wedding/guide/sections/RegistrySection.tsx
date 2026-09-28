import type { PublicWeddingConfig, RegistryLinkKind } from '@/types/wedding';
import { GuideSection } from '../GuideSection';

// Generic glyphs, not brand logos — the label carries the name
const KindIcon = ({ kind }: { kind: RegistryLinkKind }) => {
  const common = { viewBox: '0 0 24 24', width: 22, height: 22, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 };
  switch (kind) {
    case 'paypal':
    case 'venmo':
    case 'cashapp':
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case 'fund':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
        </svg>
      );
    case 'other':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="9" width="18" height="11" rx="1" />
          <path d="M3 13h18M12 9v11M12 9c-2-4-6-3-5 0M12 9c2-4 6-3 5 0" />
        </svg>
      );
  }
};

interface RegistrySectionProps {
  config: PublicWeddingConfig;
}

const ROW_CLASS =
  'flex min-h-11 items-center gap-3 rounded-lg border border-[var(--sb-gold)] px-4 py-2 text-[var(--sb-crimson)]';

export const RegistrySection = ({ config }: RegistrySectionProps) => {
  const fund = config.honeymoonFund;
  const fundBody = fund && (
    <>
      <KindIcon kind="fund" />
      <span>
        <span className="block font-garamond text-lg">{fund.title}</span>
        {fund.description && <span className="block text-sm text-[var(--sb-ink)] opacity-80">{fund.description}</span>}
      </span>
    </>
  );

  return (
    <GuideSection id="registry" title="Registry">
      <p className="font-garamond italic opacity-80">
        Your presence is the real present — but if you&apos;d like to give something, here&apos;s where to look.
      </p>
      <ul className="mt-3 space-y-2">
        {config.registry.map((link, index) => (
          <li key={`${link.label}-${index}`}>
            <a href={link.url} target="_blank" rel="noreferrer" className={ROW_CLASS}>
              <KindIcon kind={link.kind ?? 'registry'} />
              <span className="font-garamond text-lg">{link.label}</span>
              <span aria-hidden="true" className="ml-auto">
                ↗
              </span>
            </a>
          </li>
        ))}
        {fund?.title && (
          <li>
            {fund.url ? (
              <a href={fund.url} target="_blank" rel="noreferrer" className={ROW_CLASS}>
                {fundBody}
                <span aria-hidden="true" className="ml-auto">
                  ↗
                </span>
              </a>
            ) : (
              <div className={ROW_CLASS}>{fundBody}</div>
            )}
          </li>
        )}
      </ul>
    </GuideSection>
  );
};
