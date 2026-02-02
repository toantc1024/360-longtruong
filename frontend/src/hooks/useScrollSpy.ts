import { useEffect, useState, useCallback, type RefObject } from 'react';

interface UseScrollSpyProps {
    sectionIds: string[];
    offset?: number;
    scrollContainer?: RefObject<HTMLElement | HTMLDivElement | null>;
}

export const useScrollSpy = ({ sectionIds, offset = 100, scrollContainer }: UseScrollSpyProps) => {
    const [activeSection, setActiveSection] = useState<string>(sectionIds[0] || '');

    const handleScroll = useCallback(() => {
        const container = scrollContainer?.current;

        // Get scroll position from container or window
        const scrollPosition = container ? container.scrollTop + offset : window.scrollY + offset;
        const containerTop = container ? container.getBoundingClientRect().top : 0;

        // Get all section elements
        const sections = sectionIds
            .map(id => ({
                id,
                element: document.getElementById(id),
            }))
            .filter(section => section.element !== null);

        // Find the current section based on scroll position
        let currentSection = sectionIds[0];

        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            if (section.element) {
                const rect = section.element.getBoundingClientRect();

                // Calculate section position relative to container or window
                const sectionTop = container
                    ? rect.top - containerTop + container.scrollTop
                    : rect.top + window.scrollY;

                if (scrollPosition >= sectionTop) {
                    currentSection = section.id;
                    break;
                }
            }
        }

        setActiveSection(currentSection);
    }, [sectionIds, offset, scrollContainer]);

    useEffect(() => {
        const container = scrollContainer?.current;

        handleScroll(); // Set initial active section

        if (container) {
            container.addEventListener('scroll', handleScroll, { passive: true });
        } else {
            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            } else {
                window.removeEventListener('scroll', handleScroll);
            }
        };
    }, [handleScroll, scrollContainer]);

    const scrollToSection = useCallback((sectionId: string) => {
        const element = document.getElementById(sectionId);
        const container = scrollContainer?.current;

        if (element) {
            if (container) {
                // Scroll within the container
                const containerRect = container.getBoundingClientRect();
                const elementRect = element.getBoundingClientRect();
                const scrollTop = elementRect.top - containerRect.top + container.scrollTop - offset;

                container.scrollTo({
                    top: scrollTop,
                    behavior: 'smooth'
                });
            } else {
                // Fallback to window scroll
                const offsetTop = element.offsetTop - offset + 50;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    }, [offset, scrollContainer]);

    return {
        activeSection,
        scrollToSection,
    };
};
