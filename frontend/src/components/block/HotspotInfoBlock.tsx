import type { Hotspot } from "@/types/hotspots.service.type";
import {
  ArrowUpRight,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Image,
  Info,
  MapPin,
} from "lucide-react";
import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import useVRStore from "@/store/vr.store";

const formatFileSize = (bytes: number) => {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
};

const HotspotInfoBlock = ({ hotspot }: { hotspot: Hotspot | null }) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  const { panoramas } = useVRStore((state) => state);

  if (!hotspot) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 p-2 gap-4">
      <div className="col-span-1 space-y-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-white text-2xl sm:text-3xl lg:text-4xl text-shadow-sm">
            {hotspot.title}
          </h2>
          <a className="flex items-center gap-2 text-primary hover:text-primary/40 text-sm font-medium transition-colors pt-2 lg:pt-4 cursor-pointer">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{hotspot.address}</span>
          </a>
        </div>

        <div className="p-2 rounded-3xl shadow-sm">
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-white">
            <Image className="w-5 h-5 flex-shrink-0" />
            Thư viện ảnh
          </h2>
          <div className="max-w-full py-4">
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {[{ preview_image: hotspot.preview_image }, ...panoramas]
                  .filter((panorama) => panorama.preview_image)
                  .map((panorama, index) => (
                    <CarouselItem key={index}>
                      <Card className="!p-0 border-white/10 bg-transparent rounded-2xl sm:rounded-3xl">
                        <CardContent
                          className="flex rounded-2xl sm:rounded-3xl aspect-video items-center justify-center"
                          style={{
                            backgroundImage: `url(${panorama.preview_image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                          }}
                        ></CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
              </CarouselContent>
              <CarouselPrevious className="glass glass-light !text-white top-[calc(100%+0.5rem)] translate-y-0 left-0 w-8 h-8 sm:w-10 sm:h-10" />
              <CarouselNext className="glass glass-light !text-white top-[calc(100%+0.5rem)] translate-y-0 left-10 sm:left-12 translate-x-0 w-8 h-8 sm:w-10 sm:h-10" />
            </Carousel>
            <div className="mt-4 flex items-center justify-center sm:justify-end gap-2">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    "h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border-2",
                    {
                      "border-primary": current === index + 1,
                    }
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-1 space-y-4">
        <div className="glass glass-light p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-sm">
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-white">
            <Info className="w-5 h-5 flex-shrink-0" />
            Giới thiệu{" "}
          </h2>
          <div className="max-w-full text-blue-200 py-2">
            <p className="text-sm sm:text-base">{hotspot.description}</p>
          </div>
        </div>
        <div
          onClick={() => window.open(hotspot.website || "", "_blank")}
          className="glass glass-light glass-hover cursor-pointer p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-sm relative"
        >
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-white">
            Truy cập Website{" "}
          </h2>
          <div className="absolute top-0 right-0 p-3 sm:p-4 text-white">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div className="max-w-full text-blue-200 py-2 pr-8">
            <p className="text-sm sm:text-base break-all">{hotspot.website}</p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 max-h-[350px] sm:max-h-[400px] overflow-auto">
          {hotspot.documents &&
          Array.isArray(hotspot.documents) &&
          hotspot.documents.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {hotspot.documents.map((doc: any, index: number) => (
                <div
                  key={doc.id || index}
                  className="glass-light rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10"
                >
                  <div className="space-y-3">
                    {/* Document Header */}
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border bg-purple-500/20 border-purple-500/30 flex-shrink-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-xs sm:text-sm mb-1 truncate">
                            {doc.title || doc.file_name}
                          </h4>
                          <p className="text-white/60 text-xs mb-1">
                            <span className="truncate block sm:inline">
                              {doc.file_name}
                            </span>
                            <span className="hidden sm:inline"> • </span>
                            <span className="block sm:inline">
                              {doc.file_size
                                ? formatFileSize(doc.file_size)
                                : "Không rõ dung lượng"}
                            </span>
                          </p>
                          {doc.created_at && (
                            <p className="text-white/40 text-xs">
                              {new Date(doc.created_at).toLocaleDateString(
                                "vi-VN"
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                        {doc.url && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border bg-orange-500/20 border-orange-500/30 hover:bg-orange-600/30 hover:border-orange-600/40 transition-all"
                            title="Tải xuống"
                          >
                            <Download className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Document Preview - Only for PDFs */}
                    {doc.url && doc.file_type === "application/pdf" && (
                      <div className="mt-3 sm:mt-4">
                        <div className="border border-white/20 rounded-lg overflow-hidden bg-white">
                          <iframe
                            src={`${doc.url}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-48 sm:h-64"
                            title={`Preview of ${doc.title || doc.file_name}`}
                            loading="lazy"
                            onError={() => {
                              // Handle iframe error silently
                            }}
                          />
                        </div>
                        <div className="mt-2 text-center">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 sm:gap-2 text-primary hover:text-primary/80 text-xs sm:text-sm font-medium transition-colors"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            Xem toàn màn hình
                            <ExternalLink className="w-2 h-2 sm:w-3 sm:h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-light rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 text-center">
              <div className="flex flex-col items-center gap-2 sm:gap-3 py-6 sm:py-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border bg-gray-500/20 border-gray-500/30">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
                </div>
                <p className="text-white/60 text-xs sm:text-sm">
                  Chưa có tài liệu nào
                </p>
                <p className="text-white/40 text-xs">
                  Các tài liệu liên quan sẽ được hiển thị ở đây
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotspotInfoBlock;
