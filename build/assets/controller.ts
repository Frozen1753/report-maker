import fs from "node:fs";
import path from "node:path";
import { SUPPORTED_ASSET_EXTENSIONS } from "../../src/core/types/extensions.ts";

export type AssetReference =
    | {
        type: "remote";
        value: string;
    }
    | {
        type: "image" | "react-component";
        value: string;
        importPath: string;
        absolutePath: string;
    };

const IMAGE_EXTENSIONS = new Set([
    ".png", ".jpg", ".jpeg", ".webp", ".avif",
    ".gif", ".svg", ".bmp", ".tif", ".tiff", ".ico",
]);

export function resolveAssetReference(
    value: string,
    pageFile: string,
): AssetReference {
    const input = value.trim();

    if (!input) {
        throw new Error("[assets] asset reference cannot be empty.");
    }

    // Remote URL
    if (/^https?:\/\//i.test(input)) {
        if (input.includes("?react")) {
            throw new Error(
                `[assets] "?react" is only supported for local SVG files: "${input}".`,
            );
        }

        return {
            type: "remote",
            value: input,
        };
    }

    // Local paths must be relative.
    if (path.isAbsolute(input)) {
        throw new Error(
            `[assets] asset path must be relative: "${input}".`,
        );
    }

    const [assetPath, ...queryParts] = input.split("?");
    const query = queryParts.length ? queryParts.join("?") : "";

    if (query && query !== "react") {
        throw new Error(
            `[assets] unsupported asset query in "${input}". Only "?react" is supported.`,
        );
    }

    const extension = path.extname(assetPath).toLowerCase();

    if (
        !SUPPORTED_ASSET_EXTENSIONS.includes(
            extension as (typeof SUPPORTED_ASSET_EXTENSIONS)[number],
        )
    ) {
        throw new Error(
            `[assets] unsupported asset extension "${extension}" in "${input}".`,
        );
    }

    if (!IMAGE_EXTENSIONS.has(extension)) {
        throw new Error(
            `[assets] "${input}" is not an image and cannot be used in this field.`,
        );
    }

    if (query === "react" && extension !== ".svg") {
        throw new Error(
            `[assets] "?react" can only be used with SVG files: "${input}".`,
        );
    }

    const reportDirectory = path.resolve(process.cwd(), "report");
    const pageDirectory = path.dirname(path.resolve(pageFile));
    const absolutePath = path.resolve(pageDirectory, assetPath);

    // prevent paths escaping report/
    const relativeToReport = path.relative(
        reportDirectory,
        absolutePath,
    );

    if (
        relativeToReport === ".." ||
        relativeToReport.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relativeToReport)
    ) {
        throw new Error(
            `[assets] asset path cannot escape the report directory: "${input}".`,
        );
    }

    if (
        !fs.existsSync(absolutePath) ||
        !fs.statSync(absolutePath).isFile()
    ) {
        throw new Error(
            `[assets] asset not found: "${input}" (referenced from "${pageFile}").`,
        );
    }

    const importPath = `./${path.relative(
        pageDirectory,
        absolutePath,
    ).split(path.sep).join("/")}`;

    if (query === "react") {
        return {
            type: "react-component",
            value: input,
            importPath: `${importPath}?react`,
            absolutePath,
        };
    }

    return {
        type: "image",
        value: input,
        importPath,
        absolutePath,
    };
}
