import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import type { NavigationMenuProps } from "@radix-ui/react-navigation-menu";
import { SECTIONS_CONFIG } from "@/constants/sections.constants";
import { cn } from "@/lib/utils";

interface NavMenuProps extends NavigationMenuProps {
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
}

// Nav items to show: hero (Trang chủ) and about (Giới thiệu)
const NAV_ITEMS = [SECTIONS_CONFIG[0], SECTIONS_CONFIG[1]];

export const NavMenu = ({
  activeSection,
  onNavigate,
  ...props
}: NavMenuProps) => {
  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="lg:border-[1px] lg:rounded-full p-1 border-white/20 gap-2 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
        {NAV_ITEMS.map((section, index) => {
          const isActive = activeSection === section.id;
          return (
            <NavigationMenuItem key={index}>
              <NavigationMenuLink asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "rounded-full cursor-pointer transition-all duration-300",
                    isActive
                      ? "glass !text-white ring-2 ring-white/30 ring-offset-1 ring-offset-transparent"
                      : "glass-hover hover:!text-white"
                  )}
                  onClick={() => onNavigate?.(section.id)}
                >
                  {section.label}
                </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
