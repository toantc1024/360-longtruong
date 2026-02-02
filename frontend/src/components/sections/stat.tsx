import { CURRENT_AREA_ID } from "@/constants/env.constants";
import { countPanoramasByHotspotId } from "@/services/panoramas.service";
import { countVisitorLogsByAreaId } from "@/services/visitor_logs.service";
import useVRStore from "@/store/vr.store";
import { useEffect, useState } from "react";
import { NumberTicker } from "@/components/magicui/number-ticket";

import { TextAnimate } from "../magicui/text-animate";
import GradientCardBlock from "../block/GradientCardBlock";
import { STATS_CONTENT } from "@/constants/content.constants";

export function StatsSection() {
  const { areaHotspots } = useVRStore((state) => state);
  const [totalPanoramas, setTotalPanoramas] = useState(0);
  const [totalVisitorLogs, setTotalVisitorLogs] = useState(0);
  useEffect(() => {
    (async () => {
      const panoramas = await Promise.all(
        areaHotspots.map((hotspot) =>
          countPanoramasByHotspotId(hotspot.hotspot_id)
        )
      );
      setTotalPanoramas(panoramas.reduce((acc, curr) => acc + curr, 0));
    })();
  }, [areaHotspots]);

  useEffect(() => {
    (async () => {
      let count = await countVisitorLogsByAreaId(CURRENT_AREA_ID);
      setTotalVisitorLogs(count);
    })();
  }, []);

  return (
    <section className="pt-8 px-4 sm:pt-12 sm:px-6 md:pt-8 lg:px-24 flex w-full justify-center">
      <div className="container">
        <h2 className="py-8  text-2xl text-center font-bold md:text-4xl lg:text-5xl">
          <TextAnimate animation="blurIn" as="h1">
            {STATS_CONTENT.title}
          </TextAnimate>
        </h2>

        <div className="mt-4 sm:mt-8 grid sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-5 justify-center">
          <GradientCardBlock className="!p-4 col-span-2">
            <span className="text-5xl md:text-6xl font-bold text-white text-shadow-md">
              <NumberTicker value={totalVisitorLogs} />+
            </span>
            <p className="mt-6 font-semibold text-xl font-bold">
              {STATS_CONTENT.views.label}
            </p>
            <p className="mt-2 text-[17px] text-white">
              {STATS_CONTENT.views.description}
            </p>
          </GradientCardBlock>
          <GradientCardBlock className="!p-4 col-span-1 !bg-accent">
            <span className="text-5xl md:text-6xl font-bold text-white text-shadow-md">
              <NumberTicker value={areaHotspots.length} />
            </span>
            <p className="mt-6 font-semibold text-xl font-bold">
              {STATS_CONTENT.locations.label}
            </p>
            <p className="mt-2 text-[17px] text-white">
              {STATS_CONTENT.locations.description}
            </p>
          </GradientCardBlock>
          <GradientCardBlock className="!p-4 col-span-1    ">
            <span className="text-5xl md:text-6xl font-bold text-white text-shadow-md">
              <NumberTicker value={totalPanoramas} />
            </span>
            <p className="mt-6 font-semibold text-xl font-bold">
              {STATS_CONTENT.panoramas.label}
            </p>
            <p className="mt-2 text-[17px] text-white">
              {STATS_CONTENT.panoramas.description}
            </p>
          </GradientCardBlock>
        </div>
      </div>
    </section>
  );
}
