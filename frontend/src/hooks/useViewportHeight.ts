import { useEffect, useState } from "react";

export const useViewportHeight = () => {
  const [viewportHeight, setViewportHeight] = useState<number>(0);

  useEffect(() => {
    const updateViewportHeight = () => {
      // For mobile browsers, use the actual window inner height
      // This accounts for browser UI elements that may hide/show
      const vh = window.innerHeight;
      setViewportHeight(vh);

      // Set CSS custom property for use in CSS
      document.documentElement.style.setProperty("--vh", `${vh * 0.01}px`);
    };

    // Initial calculation
    updateViewportHeight();

    // Update on resize and orientation change
    window.addEventListener("resize", updateViewportHeight);
    window.addEventListener("orientationchange", updateViewportHeight);

    // For iOS Safari, also listen to scroll events to handle address bar hide/show
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateViewportHeight();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Only add scroll listener on mobile devices
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    if (isMobile) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateViewportHeight);
      window.removeEventListener("orientationchange", updateViewportHeight);
      if (isMobile) {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return {
    viewportHeight,
    // CSS custom property for use in inline styles
    cssHeight: viewportHeight > 0 ? `${viewportHeight}px` : "100vh",
  };
};
