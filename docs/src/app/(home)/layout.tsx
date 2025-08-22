"use client";
import type { ReactNode } from "react";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/app/layout.config";
import { RiTwitterXLine } from "react-icons/ri";
import { FaBook, FaGithub } from "react-icons/fa";
import { SOCIALS } from "@/constants";
import Link from "next/link";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      {...baseOptions}
      links={[
        {
          type: "custom",
          children: (
            <div className="flex items-center gap-3 ml-4">
              <Link className="flex items-center gap-1" href="/docs">
                <FaBook />
                Docs
              </Link>
            </div>
          ),
        },

        // --- External Links (Inline) ---
        {
          type: "custom",

          children: (
            <div className="flex items-center gap-4 ml-6">
              <Link className="flex items-center gap-1" href={SOCIALS.Github} target="_blank">
              <FaGithub className="h-4 w-4" />
                <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-all">
                  GitHub
                </span>
              </Link>

              <Link className="flex items-center gap-1" href={SOCIALS.X} target="_blank">
              <RiTwitterXLine className="h-4 w-4" />
                <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-all">
                  Twitter
                </span>
              </Link>
            </div>
          ),
        },
      ]}
    >
      {children}
    </HomeLayout>
  );
}
