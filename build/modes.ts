export const BUILD_MODES = ["folder", "singlefile", "hybrid"] as const;

/**
 *   folder     -> normal Vite build, assets emitted to dist/folder/assets/
 *   singlefile -> everything (JS, CSS, every asset) inlined into one dist/singlefile/index.html
 *   hybrid     -> JS/CSS inlined into one HTML, but assets matching
 *                 report.assets.config.json stay external in dist/hybrid/assets/
 */
export type ReportBuildMode = (typeof BUILD_MODES)[number];

export function isBuildMode(value: unknown): value is ReportBuildMode {
  return (BUILD_MODES as readonly unknown[]).includes(value);
}

/** Set by build/build-report.mjs (see package.json "build:*" scripts). */
export function currentBuildMode(): ReportBuildMode {
  const mode = process.env.REPORT_BUILD_MODE ?? "folder";
  if (!isBuildMode(mode)) {
    throw new Error(`Unknown REPORT_BUILD_MODE "${mode}". Use one of: ${BUILD_MODES.join(", ")}`);
  }
  return mode;
}
