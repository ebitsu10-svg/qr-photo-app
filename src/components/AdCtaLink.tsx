"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Carries ad-campaign query params (utm_source, fbclid, gclid, ...) from the
// landing page through to sign-up, so attribution survives the click.
export function AdCtaLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [finalHref, setFinalHref] = useState(href);

  useEffect(() => {
    const qs = window.location.search;
    if (qs) setFinalHref(`${href}${qs}`);
  }, [href]);

  return (
    <Link href={finalHref} className={className}>
      {children}
    </Link>
  );
}
