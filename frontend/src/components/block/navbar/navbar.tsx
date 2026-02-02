import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import { NavigationSheet } from "./navigation-sheet";
import { Search } from "lucide-react";
import MapDialogBlock from "../MapDialogBlock";
import { useState } from "react";
import { createSearchParams, useNavigate } from "react-router-dom";
import useVRStore from "@/store/vr.store";

interface NavbarProps {
  ref: React.RefObject<HTMLElement | null>;
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
}

const Navbar = ({ ref, activeSection, onNavigate }: NavbarProps) => {
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { setIsLoading } = useVRStore((state) => state);
  return (
    <>
      <MapDialogBlock
        opened={isMapDialogOpen}
        showMedia={(item) => {
          navigate({
            pathname: "/app",
            search: createSearchParams({
              panorama_id: item,
            }).toString(),
          });
          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
          }, 5000);
        }}
        setOpened={setIsMapDialogOpen}
      />
      <nav
        ref={ref}
        className="glass glass-light hover:border-none fixed top-0 mt-4 inset-x-4 h-16 bg-background border dark:border-slate-700/70 max-w-screen-xl  mx-auto rounded-full z-[40]"
      >
        <div className=" h-full flex items-center justify-between mx-auto px-4">
          <Logo />

          {/* Desktop Menu */}
          <NavMenu
            className="hidden md:block"
            activeSection={activeSection}
            onNavigate={onNavigate}
          />

          <div className=" flex items-center gap-3">
            <Button
              onClick={() => setIsMapDialogOpen(true)}
              size="lg"
              className="px-2 cursor-pointer rounded-full glass  glass-hover border-white/90 !text-white text-base shadow-none"
            >
              <div className="hidden sm:flex items-center gap-2">
                Tìm kiếm địa điểm <Search className="!h-5 !w-5" />
              </div>
              <div className="sm:hidden flex items-center gap-2">
                Tìm kiếm <Search className=" !h-5 !w-5" />
              </div>
            </Button>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <NavigationSheet
                activeSection={activeSection}
                onNavigate={onNavigate}
              />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
