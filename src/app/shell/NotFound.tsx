import { Link } from "react-router";

/** Default 404. Add report/pages/[not_found].page.mdx to replace it. */
export function NotFound() {
  return (
    <>
      <p>
        There is no page at this address. <Link to="/">Back to the home page</Link>
      </p>
    </>
  );
}
