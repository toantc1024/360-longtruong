export interface SectionConfig {
  id: string;
  label: string;
  component: React.ComponentType;
}

import HeroSection from "../components/sections/hero";
import { AboutSection } from "../components/sections/about";
import { FeatureSection } from "../components/sections/feature";
import { StatsSection } from "@/components/sections/stat";

export const SECTIONS_CONFIG: SectionConfig[] = [
  {
    id: "hero",
    label: "Trang chủ",
    component: HeroSection,
  },
  {
    id: "about",
    label: "Giới thiệu",
    component: AboutSection,
  },
  {
    id: "stats",
    label: "Thống kê",
    component: StatsSection,
  },
  {
    id: "feature",
    label: "Tính năng",
    component: FeatureSection,
  },
];

export const SECTION_IDS = SECTIONS_CONFIG.map((section) => section.id);
