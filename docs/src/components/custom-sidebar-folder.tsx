// docs/src/components/custom-sidebar.tsx
'use client';

import { SidebarFolder, SidebarFolderTrigger, SidebarFolderContent } from 'fumadocs-ui/components/layout/sidebar';
import type { PageTree } from 'fumadocs-core/server';

export function CustomSidebarFolder({ item, level, children }: { item: PageTree.Folder, level: number, children: React.ReactNode }) {
    const extra = "mt-6";

    return (
      <SidebarFolder className={extra} defaultOpen={item.defaultOpen}>
        <SidebarFolderTrigger className="text-[var(--color-fd-foreground)]">
          {item.icon}
          {item.name}
        </SidebarFolderTrigger>
        <SidebarFolderContent>
          {children}
        </SidebarFolderContent>
      </SidebarFolder>
    );
}