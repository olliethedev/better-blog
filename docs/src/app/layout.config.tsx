import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { FaBook } from "react-icons/fa";
import { IoBookSharp } from "react-icons/io5";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Docs Layout: app/(home)/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  githubUrl: "https://github.com/olliethedev/better-blog",
  nav: {
    title: (
      <>
        <span>Better Blog</span> 
      </>
    ),
  },
  // see https://fumadocs.dev/docs/ui/navigation/links
};
