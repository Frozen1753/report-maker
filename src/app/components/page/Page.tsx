import { useEffect, useState } from "react";
import type { MDXModule } from "../../../core/types/mdx-exports";
import { MDX_MODULES } from "../../../../report";
import { TableOfContent } from "../../../core/components/toc/TableOfContent";
import { ListOfFigures } from "../../../core/components/toc/ListOfFigures";
import { mdxComponents } from "../../overrides";

type Props = {
  src: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; mdx: MDXModule }
  | { status: "error"; error: unknown };

export default function Page({ src }: Props) {
  const loader = MDX_MODULES[src];
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!loader) return;

    let cancelled = false;
    setState({ status: "loading" });

    loader()
      .then((mdx) => {
        if (!cancelled) setState({ status: "ready", mdx });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: "error", error });
      });

    return () => {
      cancelled = true;
    };
  }, [loader]);

  if (!loader) return <p>Unknown page: {src}</p>;
  if (state.status === "loading") return null; // or a spinner
  if (state.status === "error") {
    console.error(`Failed to load MDX "${src}"`, state.error);
    return <p>Failed to load page.</p>;
  }

  const MDX = state.mdx;

  return (
    <>
      <TableOfContent items={MDX.toc} />
      <ListOfFigures items={MDX.figures} />
      <div>
        <MDX.default components={mdxComponents} />
      </div>
    </>
  );
}
