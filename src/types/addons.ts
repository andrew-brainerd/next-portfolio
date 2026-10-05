/** A published WoW addon with live CurseForge stats, from brainerd-api `/curseforge/addons`. */
export interface CurseForgeAddon {
  id: number;
  name: string;
  slug: string;
  summary: string;
  url: string;
  logoUrl: string | null;
  downloads: number;
  latestVersion: string | null;
  gameVersions: string[];
  updatedAt: string;
}

/** An addon that is built but not on CurseForge yet. */
export interface UpcomingAddon {
  name: string;
  summary: string;
  /** Path under /public; omitted → monogram tile. */
  logo?: string;
}
