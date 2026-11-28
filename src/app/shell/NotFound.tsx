import { Link } from "@report-maker";
import { FileQuestionMark } from "lucide-react";

/** Default 404. Add report/pages/[not_found].page.mdx to replace it. */
export function NotFound() {
  return (
    <>
      <h1>
        <FileQuestionMark size={37} strokeWidth={1.5} aria-hidden="true" />
        Error 404
      </h1>

      <p>The page you are looking for does not exist or has been moved.</p>

      <p>Please check the address or return to <Link href="/" icon={true}>the home page</Link>.</p >
    </>
  );
}
