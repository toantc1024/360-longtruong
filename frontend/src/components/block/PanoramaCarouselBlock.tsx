import {
  Carousel,
  CarouselPrevious,
  CarouselNext,
  CarouselItem,
  CarouselContent,
} from "../ui/carousel";
import useVRStore from "@/store/vr.store";

const PanoramaCarouselBlock = ({
  isBottomNavVisible,
  showMedia,
}: {
  isBottomNavVisible: boolean;
  showMedia: (panorama_id: string) => void;
}) => {
  const {
    currentHotspot,
    currentArea,
    currentPanorama,
    panoramas,
    setCurrentPanoramaById,
  } = useVRStore((state) => state);
  return (
    <>
      {console.log({
        hotspotId: currentHotspot?.hotspot_id,
        areaId: currentArea?.main_hotspot_id,
        panoramas: panoramas,
      })}
      {/* Carousel Section with Animation */}
      <div
        className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${
          isBottomNavVisible ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="w-full flex glass flex-col items-center justify-center px-2 py-4">
          <div className="px-12 lg:px-16 w-full">
            <Carousel className="h-16 md:h-20 w-full max-w-full md:max-w-md lg:max-w-[60vw] mx-auto">
              <CarouselContent className="-ml-2 md:-ml-4">
                {panoramas.map((panorama, index) => (
                  <CarouselItem
                    onClick={() => {
                      setCurrentPanoramaById(panorama.panorama_id);
                      showMedia(panorama.panorama_id);
                    }}
                    className={`pl-2 relative md:pl-4 basis-1/3 lg:basis-1/6 cursor-pointer`}
                    key={index}
                  >
                    <div
                      className={`overflow-hidden object-cover group border-0 !border-white/10 p-0  h-16 relative md:h-20 rounded-xl bg-white/10 ${
                        currentPanorama?.panorama_id === panorama.panorama_id
                          ? "border-2 border-white"
                          : ""
                      }`}
                    >
                      <img
                        src={panorama.preview_image}
                        alt={panorama.title}
                        className="rounded-lg group-hover:scale-[1.2] transition-all ease-in-out duration-150 w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="glass glass-hover text-white hover:text-gray-100 w-8 h-8 lg:w-10 lg:h-10" />
              <CarouselNext className="glass glass-hover text-white hover:text-gray-100 w-8 h-8 lg:w-10 lg:h-10" />
            </Carousel>
          </div>
        </div>
      </div>
    </>
  );
};

export default PanoramaCarouselBlock;
