import type { ScorebookGame } from 'types/scorebook';
import { SCOREBOOK_FRISBEE_GOLF_ROUTE } from 'constants/routes';

export const SCOREBOOK_GAMES: ScorebookGame[] = [
  {
    id: 'frisbee-golf',
    name: 'Frisbee Golf',
    description: '4th of July family tradition',
    route: SCOREBOOK_FRISBEE_GOLF_ROUTE,
    available: true
  }
];
