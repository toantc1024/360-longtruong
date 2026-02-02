import { FileTextIcon } from "@radix-ui/react-icons";
import { MapPin, MousePointerClickIcon, Share2Icon } from "lucide-react";

import MapBlock from "../block/MapBlock";
import { cn } from "@/lib/utils";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { AnimatedBeamMultipleInputs } from "../block/AnimatedBeamMultipleInputs";
import { Marquee } from "../magicui/marquee";
import { AnimatedListBlock } from "../block/AnimatedListBlock";
import { TextAnimate } from "../magicui/text-animate";
import { ABOUT_FEATURES } from "@/constants/content.constants";

export function AboutSection() {
  const features = [
    {
      Icon: FileTextIcon,
      name: ABOUT_FEATURES.digitization.name,
      description: ABOUT_FEATURES.digitization.description,
      href: "#",
      cta: "",
      className: "col-span-3 lg:col-span-1",
      background: (
        <Marquee
          pauseOnHover
          className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] "
        >
          {Array(6)
            .fill(null)
            .map((_, idx) => (
              <figure
                key={idx}
                className={cn(
                  "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
                  "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                  "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
                  "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
                )}
              >
                <div className="flex flex-row items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="h-4 w-20 rounded bg-gray-300 dark:bg-gray-600" />
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-2 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </figure>
            ))}
        </Marquee>
      ),
    },
    {
      Icon: MapPin,
      name: ABOUT_FEATURES.locations.name,
      description: ABOUT_FEATURES.locations.description,
      href: "#",
      cta: "",
      className: "col-span-3 lg:col-span-2",
      background: (
        <AnimatedListBlock className="absolute right-2 top-4 h-[300px] w-full scale-75 border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-90" />
      ),
    },
    {
      Icon: Share2Icon,
      name: ABOUT_FEATURES.technology.name,
      description: ABOUT_FEATURES.technology.description,
      href: "#",
      cta: "",
      className: "col-span-3 lg:col-span-2",
      background: (
        <AnimatedBeamMultipleInputs className="absolute right-2 top-4 h-[300px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
      ),
    },
    {
      Icon: MousePointerClickIcon,
      name: ABOUT_FEATURES.interaction.name,
      description: ABOUT_FEATURES.interaction.description,
      className: "col-span-3 lg:col-span-1",
      href: "#",
      cta: "",
      background: (
        <div className="w-full h-full absolute right-0 top-10 origin-top scale-75 rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-90">
          <MapBlock opened={false} setOpened={() => {}} showMedia={() => {}} />
        </div>
        // <Calendar
        //     mode="single"
        //     selected={new Date(2022, 4, 11, 0, 0, 0)}
        //     className="absolute right-0 top-10 origin-top scale-75 rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-90"
        // />
      ),
    },
  ];

  return (
    <section className="pt-8 px-4 sm:pt-12 sm:px-6 md:pt-8 lg:px-24 flex w-full justify-center">
      <div className="container">
        <h2 className="py-8  text-2xl text-center font-bold md:text-4xl lg:text-5xl">
          <TextAnimate animation="blurIn" as="h1">
            Nền tảng thực tế ảo
          </TextAnimate>
        </h2>
        <>
          <BentoGrid>
            {features.map((feature, idx) => (
              <BentoCard key={idx} {...feature} />
            ))}
          </BentoGrid>
        </>
      </div>
    </section>
  );
}
