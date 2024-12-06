import React, { ReactNode } from "react";
import { cn } from "./utils";
import { MenuIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export interface MenuGroup {
  readonly title?: string;
  readonly items: MenuGroupItem[];
}

export interface MenuGroupItem {
  readonly key: string;
  readonly label: ReactNode;
  readonly isActive?: boolean;
  // onClick?: () => void;
}

export interface MenuLayoutProps {
  readonly groups: MenuGroup[];
  readonly header?: ReactNode;
  readonly footer?: ReactNode;
}

export const MenuLayout: React.FC<MenuLayoutProps> = ({
  groups,
  header,
  footer,
}) => {
  return (
    <>
      {header}
      <nav>
        {groups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className={cn("mt-4", groupIndex === 0 && "mt-0")}
          >
            {group.title && (
              <h3 className="font-semibold mb-2 text-sm px-2">{group.title}</h3>
            )}
            <div className="flex flex-col gap-1">
              {group.items.map((item) => (
                <div
                  key={item.key}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors duration-200 hover:bg-muted group relative cursor-pointer",
                    item.isActive && "bg-muted font-medium"
                  )}
                  // onClick={() => {
                  //   item.onClick?.();
                  //   // setIsOpen(false);
                  // }}
                >
                  <div className="w-1 h-1 rounded-full bg-foreground/30 group-hover:bg-foreground/50 transition-colors duration-200" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>
      {footer}
    </>
  );
};
