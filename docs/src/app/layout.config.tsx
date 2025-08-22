import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { FaBook } from "react-icons/fa";
import { IoBookSharp } from "react-icons/io5";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <span>Better Blog</span> 
      </>
    ),
  },
  // see https://fumadocs.dev/docs/ui/navigation/links
};
