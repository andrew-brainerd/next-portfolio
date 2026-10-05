// The /link page's device approval (brainerd-api /watch/device/approve).
export type ApproveResult = { ok: true; kind?: string } | { ok: false; status: number; title?: string };
