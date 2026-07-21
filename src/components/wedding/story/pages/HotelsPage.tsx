import type { Hotel } from '@/types/wedding';
import { LogisticsPage } from './LogisticsPage';

interface HotelsPageProps {
  hotels: Hotel[];
}

export const HotelsPage = ({ hotels }: HotelsPageProps) => (
  <LogisticsPage kicker="The Plan" title="Where to Stay">
    <div className="space-y-5">
      {hotels.map(hotel => (
        <section key={hotel.name} className="text-center">
          <p className="text-lg font-semibold text-[var(--sb-ink)]">{hotel.name}</p>
          {hotel.address && <p className="text-sm">{hotel.address}</p>}
          {(hotel.rate || hotel.bookingCode) && (
            <p className="mt-1 text-sm">
              {[hotel.rate, hotel.bookingCode ? `Booking code: ${hotel.bookingCode}` : ''].filter(Boolean).join(' · ')}
            </p>
          )}
          {hotel.notes && <p className="mt-1 text-sm">{hotel.notes}</p>}
          {hotel.url && (
            <a
              href={hotel.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-sm text-[var(--sb-crimson)] underline underline-offset-4 hover:text-[var(--sb-gold-deep)]"
            >
              Book a room
            </a>
          )}
        </section>
      ))}
    </div>
  </LogisticsPage>
);
