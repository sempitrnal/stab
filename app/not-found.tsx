import Link from "next/link";
import PageBody from "@/components/page-body";

export default function NotFound() {
  return (
    <PageBody>
      <div className="px-4 py-32 flex flex-col items-center gap-4 text-center">
        <p className="text-faded">404</p>
        <p className="tag">Nothing here</p>
        <Link href="/" className="tag underline underline-offset-4 hover:text-accent">
          Back to shop
        </Link>
      </div>
    </PageBody>
  );
}
