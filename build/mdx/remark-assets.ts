import type { Root } from "mdast";
import type { Plugin } from "unified";

import { resolveAssetReference } from "../assets/controller.ts";
import { importDefault } from "./export-const.ts";

type AstNode = {
    type?: string;
    name?: string;
    value?: unknown;
    key?: AstNode;
    declaration?: AstNode;
    declarations?: AstNode[];
    id?: AstNode;
    init?: AstNode;
    body?: AstNode[];
    properties?: AstNode[];
    specifiers?: AstNode[];
    source?: AstNode;
    data?: {
        estree?: AstNode;
    };
};

function property(object: AstNode, name: string): AstNode | undefined {
    return object.properties?.find((item) => {
        const key = item.key;
        return key?.name === name || key?.value === name;
    });
}

function setAsset(
    object: AstNode | undefined,
    key: string,
    imports: ReturnType<typeof importDefault>[],
    pageFile: string,
): void {
    if (!object) return;

    const item = property(object, key);
    const value = item?.value;

    if (!value || value.type !== "Literal" || typeof value.value !== "string") {
        return;
    }

    const asset = resolveAssetReference(value.value, pageFile);

    if (asset.type === "remote") return;

    const name = `ReportAsset${imports.length}`;

    imports.push(importDefault(name, asset.importPath));

    item!.value = {
        type: "Identifier",
        name,
    };
}

const remarkAssets: Plugin<[], Root> = () => {
    return (tree, file) => {
        const pageFile = file.path;

        if (!pageFile) {
            throw new Error("[assets] cannot resolve assets without an MDX file path.");
        }

        // Find: export const frontmatter = { ... }
        const frontmatterNode = tree.children.find((child) => {
            if (child.type !== "mdxjsEsm") return false;

            const program = (child as unknown as AstNode).data?.estree;
            return program?.body?.some((statement) => {
                if (statement.type !== "ExportNamedDeclaration") return false;

                const declaration = statement.declaration;
                return declaration?.declarations?.some(
                    (item) => item.id?.name === "frontmatter",
                );
            });
        }) as unknown as AstNode | undefined;

        if (!frontmatterNode) return;

        const program = frontmatterNode.data?.estree;
        if (!program?.body) return;

        const declaration = program.body.find(
            (statement) =>
                statement.type === "ExportNamedDeclaration" &&
                statement.declaration?.declarations?.some(
                    (item) => item.id?.name === "frontmatter",
                ),
        )?.declaration;

        const frontmatter = declaration?.declarations?.find(
            (item) => item.id?.name === "frontmatter",
        )?.init;

        if (!frontmatter || frontmatter.type !== "ObjectExpression") {
            return;
        }

        const imports: ReturnType<typeof importDefault>[] = [];

        // header.logo
        const header = property(frontmatter, "header")?.value;
        if (header?.type === "ObjectExpression") {
            setAsset(header, "logo", imports, pageFile);
        }

        // cover.media.img
        const cover = property(frontmatter, "cover")?.value;
        if (cover?.type === "ObjectExpression") {
            const media = property(cover, "media")?.value;

            if (media?.type === "ObjectExpression") {
                setAsset(media, "img", imports, pageFile);
            }
        }

        // Imports must be separate MDX ESM nodes.
        tree.children.unshift(...imports);
    };
};

export default remarkAssets;