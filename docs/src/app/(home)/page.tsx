"use client";
import Link from "next/link";
import { FaBook, FaGithub } from "react-icons/fa";




export default function IndexPage() {
  

  return (
    <div
      className="min-h-screen w-full relative bg-fd-primary overflow-hidden flex flex-col items-center justify-center gap-4"
    >
      <Link className="text-fd-primary-foreground text-2xl font-bold flex items-center gap-2" href="/docs"><FaBook/>Docs</Link>
      <Link className="text-fd-primary-foreground text-2xl font-bold flex items-center gap-2" href="https://github.com/olliethedev/better-blog" target="_blank"><FaGithub/>Github</Link>
    </div>
  );
}
