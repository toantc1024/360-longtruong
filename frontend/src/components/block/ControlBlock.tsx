import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import AbsoluteWrapper from "../ui/absolute-wrapper";
import {
  FiArrowLeft,
  FiHome,
  FiMenu,
  FiShare2,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import { Mail, Map } from "lucide-react";
import { Drawer } from "vaul";
import { PiInfoFill } from "react-icons/pi";
import useVRStore from "@/store/vr.store";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import HotspotInfoDialogBlock from "./HotspotInfoDialogBlock";
import ShareDialogBlock from "./ShareDialogBlock";
import SearchDialogBlock from "./SearchDialogBlock";
import PanoramaCarouselBlock from "./PanoramaCarouselBlock";
import ChatbotDialogBlock from "./ChatbotDialogBlock";
import TutorialDialogBlock from "./TutorialDialogBlock";
import { RiGlobalFill } from "react-icons/ri";
import MapDialogBlock from "./MapDialogBlock";
import { useNavigate } from "react-router-dom";
import AssetActionPillBlock from "./AssetActionPillBlock";

const ControlBlock = ({
  showMedia,
  muteAllAudio,
  unmuteAllAudio,
  getAudioState,
}: {
  showMedia: (mediaName: string) => void;
  muteAllAudio?: () => void;
  unmuteAllAudio?: () => void;
  getAudioState?: () => Promise<any>;
}) => {
  console.log(unmuteAllAudio, muteAllAudio, getAudioState);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const {
    currentArea,
    getHotspotById,
    currentHotspot,
    currentPanorama,
    setCurrentPanoramaById,
    panoramas,
  } = useVRStore((state) => state);
  const navigate = useNavigate();
  const actionPills = [
    {
      id: "introduction",
      label: "Thông tin",
      icon: PiInfoFill,
    },
    { id: "share", label: "Chia sẻ", icon: FiShare2 },
  ];
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  useEffect(() => {
    if (currentPanorama) {
      setValue(currentPanorama.title);
    }
  }, [currentPanorama]);

  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  return (
    <>
      {/* Left Navigation */}
      <AbsoluteWrapper
        top="0"
        zIndex={2}
        left="0"
        customClassName="glass flex m-1 md:m-2 items-center px-1 md:px-2 h-auto rounded-4xl py-1 md:py-2 flex gap-1 md:gap-2 flex-col shadow-sm"
      >
        <Drawer.Root direction="left">
          <Drawer.Trigger asChild>
            <Button
              className="w-10 h-10 md:w-12 lg:w-14 md:h-12 lg:h-14 shadow-lg rounded-full hover:bg-black/10 bg-black/30 ring-1 ring-black/10 flex items-center justify-center"
              aria-label="Menu"
            >
              <FiMenu className="!size-5 md:!size-7 lg:!size-9" />
            </Button>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-[10] backdrop-blur-xl bg-black/40" />
            <Drawer.Content
              className="left-1 md:left-2 top-1 md:top-2 bottom-1 md:bottom-2 fixed z-10 outline-none w-[280px] md:w-[310px] flex"
              style={
                {
                  "--initial-transform": "calc(100% + 8px)",
                } as React.CSSProperties
              }
            >
              <div className="h-full w-full grow p-4 md:p-5 flex flex-col rounded-[16px] glass">
                <div className="">
                  <Drawer.Title className="flex items-center font-medium mb-4 text-white text-lg md:text-xl">
                    <Drawer.Close>
                      <Button className="w-10 h-10 md:w-12 md:h-12 glass-hover glass rounded-full p-2">
                        <FiArrowLeft className="!size-6 md:!size-8" />
                      </Button>
                    </Drawer.Close>
                    <div className="ml-3 md:ml-4">Tùy chọn</div>
                  </Drawer.Title>
                  <div className="space-y-3">
                    <Button
                      className="w-full h-10 md:h-12 text-left flex items-center justify-start gap-3 glass text-white rounded-full glass glass-hover text-sm md:text-base"
                      onClick={() => {
                        navigate("/");
                      }}
                    >
                      <RiGlobalFill className="size-4 md:size-5" />
                      Về trang chủ
                    </Button>
                    <Button
                      className="w-full h-10 md:h-12 text-left flex items-center justify-start gap-3 glass text-white rounded-full glass glass-hover text-sm md:text-base"
                      onClick={() => {
                        // mailto
                        window.location.href = "mailto:vrdiachido@gmail.com";
                      }}
                    >
                      <Mail className="size-4 md:size-5" />
                      Góp ý
                    </Button>
                  </div>
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>

        {/* Top left nav */}
        {[
          {
            icon: (
              <>
                <FiHome className="!size-5 md:!size-7 lg:!size-9" />
              </>
            ),
            onClick: () => {
              if (currentArea?.main_hotspot_id) {
                const panoramaId = getHotspotById(
                  Number(currentArea.main_hotspot_id)
                )?.click_panorama_id;
                if (panoramaId) {
                  showMedia(panoramaId);
                }
              }
            },
            label: "Home",
          },
        ].map((item, idx) => (
          <Button
            key={idx}
            className="w-10 h-10 md:w-12 lg:w-14 md:h-12 lg:h-14 shadow-lg rounded-full glass-hover bg-white/10 flex items-center justify-center cursor-pointer "
            onClick={item.onClick}
            aria-label={item.label}
          >
            {item.icon}
          </Button>
        ))}

        <Button
          onClick={() => {
            setIsMapDialogOpen(!isMapDialogOpen);
          }}
          className="w-10 h-10 md:w-12 lg:w-14 md:h-12 lg:h-14 shadow-lg rounded-full glass-hover bg-white/10 flex items-center justify-center cursor-pointer"
        >
          <Map className="!size-5 md:!size-7 lg:!size-9" />
        </Button>

        {/* Audio Control Button */}
        {/* {muteAllAudio && unmuteAllAudio && getAudioState && (
          <AudioControlBlock
            muteAllAudio={muteAllAudio}
            unmuteAllAudio={unmuteAllAudio}
            getAudioState={getAudioState}
          />
        )} */}

        <TutorialDialogBlock />
      </AbsoluteWrapper>

      {/* Top Right Navigation */}
      <div className="fixed top-1 right-1 z-50 flex flex-col gap-1">
        <MapDialogBlock
          showMedia={showMedia}
          opened={isMapDialogOpen}
          setOpened={setIsMapDialogOpen}
        />
        <ChatbotDialogBlock />
        <SearchDialogBlock showMedia={showMedia} />
      </div>

      <div className="absolute w-full  top-0 flex flex-col items-center justify-center">
        {currentHotspot && (
          <div className="py-2 my-1 font-bold text-white text-shadow-xl text-md lg:text-2xl glass rounded-full px-8 border-b border-white/10 max-w-[50vw] overflow-hidden text-ellipsis whitespace-nowrap">
            {currentHotspot?.title}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <AbsoluteWrapper
        zIndex={1}
        customClassName="bottom-0 left-0 w-full flex flex-col justify-center items-center rounded-t-xl"
      >
        <div className="w-full glass-light border-b border-white/10">
          <div className="relative">
            <div className="z-[1] flex gap-2 py-2 px-2 overflow-x-auto scrollbar-hide justify-start lg:justify-center">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="glass glass-hover hover:text-white text-white rounded-full w-[200px] justify-between overflow-hidden"
                  >
                    <span className="truncate capitalize">
                      Bạn đang ở {currentPanorama?.title}
                    </span>
                    <ChevronsUpDown className="opacity-50 shrink-0 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="border-none w-[250px] !rounded-xl bg-transparent  p-0"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Command className="glass border-b-none rounded-xl">
                    <CommandInput
                      placeholder="Tìm panorama"
                      className="h-9 enforce  text-white placeholder:text-white/60 placeholder:font-bold svg:text-white"
                    />
                    <CommandList>
                      <CommandEmpty className="text-white p-4 text-center">
                        Không tìm thấy panorama
                      </CommandEmpty>
                      <CommandGroup className="!">
                        {panoramas.map((panorama, index) => (
                          <CommandItem
                            className={cn(
                              `!text-white glass rounded-lg cursor-pointer glass-light border-1 ${
                                index === panoramas.length - 1 ? "" : "mb-1"
                              } font-bold`,
                              value === panorama.title
                                ? "!bg-white/40 text-white"
                                : ""
                            )}
                            key={panorama.panorama_id}
                            defaultChecked={
                              currentPanorama?.title === panorama.title
                            }
                            value={panorama.title}
                            onSelect={(currentValue) => {
                              setValue(currentValue);
                              setOpen(false);
                              setCurrentPanoramaById(panorama.panorama_id);
                              showMedia(panorama.panorama_id);
                            }}
                          >
                            {panorama.title}
                            <Check
                              className={cn(
                                "ml-auto",
                                value === panorama.title
                                  ? "opacity-0"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <AssetActionPillBlock
                hotspot={currentHotspot}
                showMedia={showMedia}
              />

              {actionPills.map((pill) => {
                const IconComponent = pill.icon;

                if (pill.id === "introduction") {
                  return (
                    <HotspotInfoDialogBlock
                      key={pill.id}
                      hotspot={currentHotspot}
                      panoramas={panoramas}
                      pill={pill}
                    />
                  );
                }

                if (pill.id === "share") {
                  return (
                    <ShareDialogBlock
                      key={pill.id}
                      pill={pill}
                      shareData={{
                        title:
                          currentHotspot?.title ||
                          currentPanorama?.title ||
                          "VR Experience",
                        description:
                          currentHotspot?.description ||
                          "Khám phá không gian ảo 360° tuyệt đẹp",
                        url:
                          typeof window !== "undefined"
                            ? window.location.href
                            : "",
                      }}
                    />
                  );
                }

                return (
                  <Button
                    key={pill.id}
                    className=" shadow-lg rounded-full glass glass-hover flex items-center justify-center cursor-pointer "
                  >
                    {IconComponent && (
                      <IconComponent className="w-3 h-3 mr-1" />
                    )}
                    {pill.id === "search" ? currentPanorama?.title : pill.label}
                  </Button>
                );
              })}

              {/* Carousel Toggle Button */}
              <Button
                className="shadow-lg rounded-full glass glass-hover flex items-center justify-center cursor-pointer"
                onClick={() => setIsBottomNavVisible(!isBottomNavVisible)}
                aria-label={
                  isBottomNavVisible ? "Hide carousel" : "Show carousel"
                }
              >
                {isBottomNavVisible ? (
                  <FiChevronDown className="w-3 h-3 mr-1" />
                ) : (
                  <FiChevronUp className="w-3 h-3 mr-1" />
                )}
                {isBottomNavVisible ? "Ẩn" : "Hiện"}
              </Button>
            </div>
          </div>
        </div>

        <PanoramaCarouselBlock
          isBottomNavVisible={isBottomNavVisible}
          showMedia={showMedia}
        />
      </AbsoluteWrapper>
    </>
  );
};

export default ControlBlock;
