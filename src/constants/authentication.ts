export const TOKEN_COOKIE = 'brainerd-token';
export const USER_COOKIE = 'brainerd-id';
// Holds the shared wedding guest passcode itself; the /wedding server page
// re-verifies it against brainerd-api on every render, so rotating the
// passcode in the CMS instantly re-locks existing cookies.
export const WEDDING_UNLOCK_COOKIE = 'wedding-unlock';
// Mock clock: ms added to the real clock. Set by the admin panel or a share link's preview date.
export const WEDDING_MOCK_OFFSET_COOKIE = 'wedding-mock-offset';
