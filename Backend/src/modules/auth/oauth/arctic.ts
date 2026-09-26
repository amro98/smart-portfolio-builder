// `arctic` ships as ESM only; this CommonJS build loads it with a (cached) dynamic import.
type ArcticModule = typeof import("arctic", { with: { "resolution-mode": "import" } });

let arcticModule: Promise<ArcticModule> | null = null;

export function loadArctic(): Promise<ArcticModule> {
  arcticModule ??= import("arctic");
  return arcticModule;
}
