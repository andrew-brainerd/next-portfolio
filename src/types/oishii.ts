export type ItemSource = 'manual' | 'instacart-scan';
export type InviteStatus = 'pending' | 'accepted' | 'revoked';

export interface Pantry {
  id: string;
  ownerUserId: string;
  memberUserIds: string[];
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface PantryItem {
  id: string;
  pantryId: string;
  name: string;
  normalizedName: string;
  quantity: number;
  unit?: string;
  category?: string;
  source: ItemSource;
  addedByUserId: string;
  sourceReceiptId?: string;
  addedAt: number;
  updatedAt: number;
}

export interface PantryMember {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isOwner: boolean;
}

export interface PantryInvite {
  id: string;
  pantryId: string;
  email: string;
  token: string;
  invitedByUserId: string;
  status: InviteStatus;
  createdAt: number;
  acceptedAt?: number;
  acceptedByUserId?: string;
}

export interface PantryDetail extends Pantry {
  members: PantryMember[];
  items: PantryItem[];
  pendingInvites: PantryInvite[];
}

export interface AddItemInput {
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
}

export interface UpdateItemInput {
  name?: string;
  quantity?: number;
  unit?: string;
  category?: string;
}

export interface InvitePreview {
  pantryName: string;
  inviterName: string;
  status: InviteStatus;
  alreadyMember: boolean;
}

export interface AcceptInviteResult {
  pantryId: string;
  status: 'accepted' | 'already-member';
}

export interface ScanSummary {
  emailsFound: number;
  emailsProcessed: number;
  skippedAlreadySeen: number;
  itemsAdded: number;
  itemsMerged: number;
}

export interface DietaryPreferences {
  intolerances: string[];
  diets: string[];
}

export interface RecipeIdea {
  id: number;
  title: string;
  image?: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  sourceUrl?: string;
  diets: string[];
}

export interface RecipeIdeasResult {
  recipes: RecipeIdea[];
  appliedIntolerances: string[];
  appliedDiets: string[];
}
