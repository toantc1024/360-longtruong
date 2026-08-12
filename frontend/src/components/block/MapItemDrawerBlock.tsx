import { useState, useEffect } from "react";
import type { Hotspot } from "@/types/hotspots.service.type";
import { MapPin, X, Compass, ExternalLink, Music } from "lucide-react";
import { Button } from "../ui/button";
import { RiDirectionFill } from "react-icons/ri";
import {
  Carousel,
  CarouselItem,
  CarouselContent,
  CarouselPrevious,
  CarouselNext,
} from "../ui/carousel";
import type { Panorama } from "@/types/panoramas.service.type";
import { getPanoramasByHotspotId } from "@/services/panoramas.service";

export default function MapItemDrawerBlock({
  currentHotspot,
  setCurrentHotspot,
  showMedia,
  closeDrawer,
}: {
  currentHotspot: Hotspot | null;
  setCurrentHotspot: (hotspot: Hotspot | null) => void;
  showMedia: (mediaName: string) => void;
  closeDrawer: () => void;
}) {
  const [panoramas, setPanoramas] = useState<Panorama[]>([]);

  useEffect(() => {
    (async () => {
      if (currentHotspot) {
        let items = await getPanoramasByHotspotId(currentHotspot.hotspot_id);
        setPanoramas(items);
      } else {
        setPanoramas([]);
      }
    })();
  }, [currentHotspot, currentHotspot?.hotspot_id]);

  if (!currentHotspot) return null;

  const audioUrl = (currentHotspot as any)?.metadata?.audio_url;

  return (
    <div className="fixed top-16 right-4 sm:right-6 z-[9999] w-[92vw] sm:w-[420px] max-h-[calc(100vh-6rem)] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4 transition-all">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-700 flex items-start justify-between gap-3 bg-slate-800">
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
            Chi Tiết Địa Điểm
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug truncate">
            {currentHotspot.title || "Địa điểm chưa đặt tên"}
          </h2>
          {currentHotspot.address && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 font-medium mt-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">{currentHotspot.address}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCurrentHotspot(null)}
          className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors shrink-0"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Body (Scrollable Overflow) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-sm leading-relaxed text-slate-200">
        {/* Preview Image if available */}
        {currentHotspot.preview_image && (
          <div className="rounded-xl overflow-hidden border border-slate-700 aspect-video">
            <img
              src={currentHotspot.preview_image}
              alt={currentHotspot.title || ""}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Audio indicator */}
        {audioUrl && (
          <div className="flex items-center gap-2 p-3 bg-blue-900/30 border border-blue-800/40 rounded-xl text-blue-300 text-xs font-semibold">
            <Music className="w-4 h-4 shrink-0" />
            <span>Đang phát thuyết minh: {currentHotspot.title || "Địa điểm"}</span>
          </div>
        )}

        {/* Description */}
        <div className="space-y-1.5">
          <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider">
            Mô tả chi tiết
          </h3>
          <div
            className="text-slate-200 text-xs sm:text-sm leading-relaxed bg-slate-800 p-3.5 rounded-xl border border-slate-700 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: currentHotspot.description || "Chưa có mô tả cho địa điểm này." }}
          />
        </div>

        {/* Website link */}
        {currentHotspot.website && (
          <a
            href={currentHotspot.website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3 bg-blue-900/30 border border-blue-800/40 rounded-xl text-blue-300 hover:bg-blue-800/40 transition-colors text-xs font-semibold"
          >
            <span className="truncate pr-2">Website: {currentHotspot.website}</span>
            <ExternalLink className="w-4 h-4 shrink-0" />
          </a>
        )}

        {/* Panoramas Carousel */}
        {panoramas.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-700">
            <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-400" />
              Ảnh VR 360° ({panoramas.length})
            </h3>
            <div className="px-6">
              <Carousel className="w-full">
                <CarouselContent className="-ml-2">
                  {panoramas.map((p) => (
                    <CarouselItem
                      key={p.panorama_id}
                      onClick={() => {
                        showMedia(p.panorama_id);
                        closeDrawer();
                      }}
                      className="pl-2 basis-1/2 sm:basis-1/3 cursor-pointer group"
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 group-hover:border-blue-500 transition-all">
                        <img
                          src={p.preview_image}
                          alt={p.title || ""}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <RiDirectionFill className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="w-7 h-7 bg-slate-800 text-white border-slate-700 hover:bg-slate-700" />
                <CarouselNext className="w-7 h-7 bg-slate-800 text-white border-slate-700 hover:bg-slate-700" />
              </Carousel>
            </div>
          </div>
        )}
      </div>

      {/* Footer Action */}
      {currentHotspot.click_panorama_id && (
        <div className="p-4 border-t border-slate-700 bg-slate-800">
          <Button
            onClick={() => {
              showMedia(currentHotspot.click_panorama_id ?? "");
              closeDrawer();
            }}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-2.5 gap-2 shadow-lg cursor-pointer"
          >
            <RiDirectionFill className="w-5 h-5" /> Trải Nghiệm VR 360° Ngay
          </Button>
        </div>
      )}
    </div>
  );
}
