import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Twitter } from "lucide-react";
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
    url:"https://www.better-blog.com"
  },
  // see https://fumadocs.dev/docs/ui/navigation/links
  links: [
    {
      url: "https://x.com/olliethedev",
      text: "Twitter",
      type: "icon",
      icon: <Twitter />,
      external: true
  },
  ]
};
