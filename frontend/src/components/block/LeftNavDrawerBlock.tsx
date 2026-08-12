import React, { useState } from "react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FiMenu,
  FiArrowLeft,
  FiMapPin,
  FiSearch,
  FiCalendar,
  FiUser,
} from "react-icons/fi";
import { RiGlobalFill } from "react-icons/ri";
import { Mail, Award, Navigation, ChevronRight } from "lucide-react";
import useVRStore from "@/store/vr.store";
import { useNavigate } from "react-router-dom";
import type { NhaCoCong, TuyenDuong } from "@/types/area.service.type";

interface LeftNavDrawerBlockProps {
  showMedia: (mediaName: string) => void;
}

export const LeftNavDrawerBlock: React.FC<LeftNavDrawerBlockProps> = ({
  showMedia,
}) => {
  const [activeTab, setActiveTab] = useState<"hotspots" | "routes" | "nhacocong">("hotspots");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const { currentArea, areaHotspots, currentHotspot } = useVRStore();
  const navigate = useNavigate();

  const routes: TuyenDuong[] = currentArea?.metadata?.tuyen_duong || [];
  const nhaCoCongList: NhaCoCong[] = currentArea?.metadata?.nha_co_cong || [];

  // Filters
  const filteredHotspots = areaHotspots.filter((h) =>
    (h.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredRoutes = routes.filter((r) =>
    (r.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredNhaCoCong = nhaCoCongList.filter((n) =>
    (n.ten_liet_si || n.nha_cua_ai || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Drawer.Root direction="left">
      <Drawer.Trigger asChild>
        <Button
          className="w-10 h-10 md:w-12 lg:w-14 md:h-12 lg:h-14 shadow-lg rounded-full glass glass-hover flex items-center justify-center text-white cursor-pointer"
          aria-label="Menu"
        >
          <FiMenu className="!size-5 md:!size-7 lg:!size-9" />
        </Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[10000] backdrop-blur-xl bg-black/30" />
        <Drawer.Content className="left-2 top-2 bottom-2 fixed z-[10001] outline-none w-[340px] sm:w-[400px] md:w-[440px] flex">
          <div className="h-full w-full grow p-4 sm:p-5 flex flex-col rounded-[24px] glass-light text-white shadow-2xl overflow-hidden">

            {/* ── Header ── */}
            <div className="flex items-center gap-3 pb-3 border-b border-white/15">
              {selectedItem ? (
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="w-9 h-9 glass-hover bg-white/10 rounded-full flex items-center justify-center text-white cursor-pointer shrink-0"
                >
                  <FiArrowLeft className="size-5" />
                </button>
              ) : (
                <Drawer.Close asChild>
                  <Button className="w-9 h-9 glass-hover bg-white/10 rounded-full p-2 text-white shrink-0">
                    <FiArrowLeft className="size-5" />
                  </Button>
                </Drawer.Close>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base sm:text-lg text-white truncate">
                  {selectedItem
                    ? (selectedItem.ten_liet_si || selectedItem.name || selectedItem.nha_cua_ai || selectedItem.title)
                    : "Khám Phá VR"}
                </h2>
                <p className="text-xs text-white/60 truncate">
                  {selectedItem
                    ? (selectedItem.address || "Chi tiết")
                    : (currentArea?.area_name || "Long Trường")}
                </p>
              </div>
            </div>

            {/* ── Detail View ── */}
            {selectedItem ? (
              <div className="flex-1 overflow-y-auto mt-4 space-y-4 text-sm">

                {/* Hotspot detail */}
                {selectedItem.hotspot_id && (
                  <div className="space-y-3">
                    {selectedItem.preview_image && (
                      <img
                        src={selectedItem.preview_image}
                        alt={selectedItem.title}
                        className="w-full h-48 object-cover rounded-2xl border border-white/10"
                      />
                    )}
                    {selectedItem.description && (
                      <div
                        className="text-white/80 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/10 text-xs"
                        dangerouslySetInnerHTML={{ __html: selectedItem.description }}
                      />
                    )}
                    {selectedItem.address && (
                      <div className="flex items-center gap-2 text-white/60 text-xs">
                        <FiMapPin className="w-3.5 h-3.5" />
                        <span>{selectedItem.address}</span>
                      </div>
                    )}
                    {selectedItem.click_panorama_id && (
                      <Button
                        onClick={() => {
                          showMedia(selectedItem.click_panorama_id);
                          setSelectedItem(null);
                        }}
                        className="w-full glass bg-white/20 hover:bg-white/30 text-white font-bold rounded-2xl py-2.5 cursor-pointer"
                      >
                        Trải nghiệm VR 360°
                      </Button>
                    )}
                  </div>
                )}

                {/* NhaCoCong detail */}
                {selectedItem.nha_cua_ai && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                      <div>
                        <span className="text-white/50 text-xs flex items-center gap-1"><FiUser /> Chủ nhà</span>
                        <p className="font-semibold text-white mt-0.5">{selectedItem.nha_cua_ai}</p>
                      </div>
                      {selectedItem.ten_liet_si && (
                        <div>
                          <span className="text-amber-300 text-xs flex items-center gap-1"><Award /> Liệt sĩ</span>
                          <p className="font-semibold text-white mt-0.5">{selectedItem.ten_liet_si}</p>
                        </div>
                      )}
                      {(selectedItem.ngay_sinh || selectedItem.ngay_mat) && (
                        <div className="col-span-2">
                          <span className="text-white/50 text-xs flex items-center gap-1"><FiCalendar /> Sinh / Mất</span>
                          <p className="font-semibold text-white mt-0.5">
                            {selectedItem.ngay_sinh || "?"} — {selectedItem.ngay_mat || "?"}
                          </p>
                        </div>
                      )}
                    </div>

                    {selectedItem.tieu_su && (
                      <div className="space-y-1.5">
                        <h4 className="font-semibold text-white/70 text-xs">Tiểu Sử</h4>
                        <div
                          className="text-white/80 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/10 text-xs"
                          dangerouslySetInnerHTML={{ __html: selectedItem.tieu_su }}
                        />
                      </div>
                    )}

                    {selectedItem.que_quan && (
                      <div className="text-xs text-white/60">
                        <span className="font-medium">Quê quán:</span> {selectedItem.que_quan}
                      </div>
                    )}
                  </div>
                )}

                {/* Route detail */}
                {selectedItem.points && (
                  <div className="space-y-3">
                    {selectedItem.description && (
                      <div
                        className="text-white/80 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/10 text-xs"
                        dangerouslySetInnerHTML={{ __html: selectedItem.description }}
                      />
                    )}
                    {selectedItem.points.length > 0 && (
                      <div className="text-xs text-white/50">
                        {selectedItem.points.length} điểm trên tuyến
                      </div>
                    )}
                  </div>
                )}

                {/* Image Gallery */}
                {selectedItem.images && selectedItem.images.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <h4 className="font-semibold text-white/70 text-xs">Hình Ảnh</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedItem.images.map((imgUrl: string, idx: number) => (
                        <img
                          key={idx}
                          src={imgUrl}
                          alt="Hình ảnh"
                          className="w-full h-32 object-cover rounded-xl border border-white/10"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* ── Tabs ── */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-white/10 rounded-xl border border-white/15 my-3 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("hotspots")}
                    className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === "hotspots"
                        ? "bg-white/25 text-white shadow-md"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    <FiMapPin className="w-3.5 h-3.5" />
                    <span>Địa điểm ({areaHotspots.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("routes")}
                    className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === "routes"
                        ? "bg-white/25 text-white shadow-md"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Tuyến ({routes.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("nhacocong")}
                    className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === "nhacocong"
                        ? "bg-white/25 text-white shadow-md"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Nhà có công ({nhaCoCongList.length})</span>
                  </button>
                </div>

                {/* ── Search ── */}
                <div className="relative mb-3">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white/10 border-white/15 text-white text-xs placeholder:text-white/40 rounded-xl"
                  />
                </div>

                {/* ── List ── */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-2">

                  {/* Hotspots */}
                  {activeTab === "hotspots" && (
                    filteredHotspots.length === 0 ? (
                      <p className="text-xs text-white/40 text-center py-8">Chưa có địa điểm nào.</p>
                    ) : (
                      filteredHotspots.map((hotspot) => {
                        const isCurrent = currentHotspot?.hotspot_id === hotspot.hotspot_id;
                        return (
                          <div
                            key={hotspot.hotspot_id}
                            onClick={() => setSelectedItem(hotspot)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                              isCurrent
                                ? "bg-white/20 border-white/30 text-white shadow-lg"
                                : "bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                              <FiMapPin className="w-5 h-5 text-blue-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xs font-bold text-white truncate">{hotspot.title}</h3>
                              <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5">
                                {hotspot.description || "Chưa có mô tả"}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
                          </div>
                        );
                      })
                    )
                  )}

                  {/* Routes */}
                  {activeTab === "routes" && (
                    filteredRoutes.length === 0 ? (
                      <p className="text-xs text-white/40 text-center py-8">Chưa có tuyến đường nào.</p>
                    ) : (
                      filteredRoutes.map((route) => (
                        <div
                          key={route.id}
                          onClick={() => setSelectedItem(route)}
                          className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                            <Navigation className="w-5 h-5 text-emerald-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-bold text-white truncate">{route.name}</h3>
                            <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5">
                              {route.description ? route.description.replace(/<[^>]*>?/gm, '') : "Tuyến tham quan"}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
                        </div>
                      ))
                    )
                  )}

                  {/* NhaCoCong */}
                  {activeTab === "nhacocong" && (
                    filteredNhaCoCong.length === 0 ? (
                      <p className="text-xs text-white/40 text-center py-8">Chưa có thông tin nhà có công.</p>
                    ) : (
                      filteredNhaCoCong.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5 text-amber-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-bold text-white truncate">
                              {item.ten_liet_si || item.nha_cua_ai}
                            </h3>
                            <p className="text-[11px] text-white/50 truncate mt-0.5">
                              Chủ hộ: {item.nha_cua_ai}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
                        </div>
                      ))
                    )
                  )}
                </div>

                {/* ── Bottom Bar ── */}
                <div className="pt-3 mt-2 border-t border-white/15 grid grid-cols-2 gap-2 text-xs">
                  <Button
                    className="w-full h-9 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    onClick={() => navigate("/")}
                  >
                    <RiGlobalFill className="size-4 text-blue-300" />
                    <span>Trang chủ</span>
                  </Button>
                  <Button
                    className="w-full h-9 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    onClick={() => { window.location.href = "mailto:vrdiachido@gmail.com"; }}
                  >
                    <Mail className="size-4 text-emerald-300" />
                    <span>Góp ý</span>
                  </Button>
                </div>
              </>
            )}

          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default LeftNavDrawerBlock;
