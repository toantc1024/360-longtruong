import Footer from "../block/footer/footer";
import Navbar from "../block/navbar/navbar";
import { useRef, useEffect } from "react";
import { SECTIONS_CONFIG, SECTION_IDS } from "@/constants/sections.constants";
import { SectionWrapper } from "../wrappers/SectionWrapper";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import useVRStore from "@/store/vr.store";
import LoaderBlock from "../block/LoaderBlock";

const LandingPage = () => {
  const navbarRef = useRef<HTMLElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { activeSection, scrollToSection } = useScrollSpy({
    sectionIds: SECTION_IDS,
    offset: 50,
    scrollContainer: scrollContainerRef,
  });

  useEffect(() => {
    console.log("Current active section:", activeSection);
  }, [activeSection]);
  const { isLoading } = useVRStore((state) => state);

  return (
    <>
      {isLoading && <LoaderBlock />}
      <div
        ref={scrollContainerRef}
        className="dark bg-background text-foreground w-full h-screen overflow-auto"
      >
        <Navbar
          ref={navbarRef}
          activeSection={activeSection}
          onNavigate={scrollToSection}
        />
        {SECTIONS_CONFIG.map((section) => {
          const Component = section.component;
          const isHero = section.id === "hero";

          return (
            <SectionWrapper
              key={section.id}
              id={section.id}
              className={isHero ? "min-h-[100vh]" : ""}
            >
              <Component />
            </SectionWrapper>
          );
        })}
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;
