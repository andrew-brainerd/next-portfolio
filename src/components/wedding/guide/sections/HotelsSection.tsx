import type { Hotel } from '@/types/wedding';
import { GuideSection } from '../GuideSection';

interface HotelsSectionProps {
  hotels: Hotel[];
}

export const HotelsSection = ({ hotels }: HotelsSectionProps) => (
  <GuideSection id="hotels" title="Hotels">
    <ul className="space-y-4">
      {hotels.map(hotel => (
        <li key={hotel.name}>
          <p className="font-semibold">{hotel.name}</p>
          {hotel.address && <p className="text-sm opacity-80">{hotel.address}</p>}
          {(hotel.rate || hotel.bookingCode) && (
            <p className="text-sm">
              {[hotel.rate, hotel.bookingCode ? `Booking code: ${hotel.bookingCode}` : ''].filter(Boolean).join(' · ')}
            </p>
          )}
          {hotel.notes && <p className="text-sm opacity-80">{hotel.notes}</p>}
          {hotel.url && (
            <a
              href={hotel.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-[var(--sb-crimson)] underline underline-offset-4"
            >
              Book a room
            </a>
          )}
        </li>
      ))}
    </ul>
  </GuideSection>
);
