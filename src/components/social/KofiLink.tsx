"use client";

import posthog from "posthog-js";
import Link from "next/link";
import Image from "next/image";

export function KofiLink() {
  return (
    <Link
      href="https://ko-fi.com/samuelpoulin"
      target="_blank"
      rel="noopener noreferrer"
      className="transition-all duration-300 hover:scale-105"
      onClick={() => posthog.capture("kofi_link_clicked")}
    >
      <Image
        width="150"
        height="38"
        src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
        alt="Buy Me a Coffee at ko-fi.com"
      />
    </Link>
  );
}
