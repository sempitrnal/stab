import Link from "next/link";
import PageBody from "@/components/page-body";

export const metadata = {
  title: "STAB · Not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <PageBody>
      <div className="px-4 py-32 flex flex-col items-center gap-4 text-center">
        <p className="font-vt text-[1.375rem] leading-none text-amber">ERROR 404</p>
        <p className="glow font-vt text-[2.5rem] leading-none uppercase">
          FILE NOT FOUND
          <span aria-hidden className="cursor-blink">█</span>
        </p>
        <Link href="/" className="mac-btn h-11! font-vt text-[1.25rem]! uppercase">
          &lt; Back to shop
        </Link>
      </div>
    </PageBody>
  );
}
