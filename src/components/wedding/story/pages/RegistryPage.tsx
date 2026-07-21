import type { PublicWeddingConfig } from '@/types/wedding';
import { LogisticsPage } from './LogisticsPage';

interface RegistryPageProps {
  config: PublicWeddingConfig;
}

export const RegistryPage = ({ config }: RegistryPageProps) => (
  <LogisticsPage kicker="The Plan" title="Registry">
    <p className="text-center text-sm italic">
      Your presence is the real present — but if you&apos;d like to give something, here&apos;s where to look.
    </p>
    <div className="space-y-3 text-center">
      {config.registry.map(link => (
        <p key={link.url}>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="text-lg text-[var(--sb-crimson)] underline underline-offset-4 hover:text-[var(--sb-gold-deep)]"
          >
            {link.label}
          </a>
        </p>
      ))}
    </div>
    {config.honeymoonFund && (
      <section className="text-center">
        <h3 className="text-xs uppercase tracking-[0.25em] text-[var(--sb-crimson)]">{config.honeymoonFund.title}</h3>
        {config.honeymoonFund.description && <p className="mt-1 text-sm">{config.honeymoonFund.description}</p>}
        {config.honeymoonFund.url && (
          <a
            href={config.honeymoonFund.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-sm text-[var(--sb-crimson)] underline underline-offset-4 hover:text-[var(--sb-gold-deep)]"
          >
            Contribute
          </a>
        )}
      </section>
    )}
  </LogisticsPage>
);
