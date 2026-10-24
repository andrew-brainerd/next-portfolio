// The Condensate account behind a brainerd.dev sign-in (brainerd-api GET /condensate/account).
export interface CondensateAccount {
  steamId: string;
  features: string[];
}
