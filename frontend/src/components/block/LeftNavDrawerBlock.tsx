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
import { Mail, Award, Navigation, X, ChevronRight } from "lucide-react";
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
    <>
      <Drawer.Root direction="left">
        <Drawer.Trigger asChild>
          <Button
            className="w-10 h-10 md:w-12 lg:w-14 md:h-12 lg:h-14 shadow-lg rounded-full hover:bg-black/20 bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white cursor-pointer transition-transform hover:scale-105"
            aria-label="Menu"
          >
            <FiMenu className="!size-5 md:!size-7 lg:!size-9" />
          </Button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[10000] backdrop-blur-xl bg-black/50" />
          <Drawer.Content className="left-2 top-2 bottom-2 fixed z-[10001] outline-none w-[340px] sm:w-[400px] md:w-[440px] flex">
            <div className="h-full w-full grow p-4 sm:p-5 flex flex-col rounded-[24px] bg-slate-950/85 backdrop-blur-2xl border border-slate-800 text-white shadow-2xl overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <Drawer.Close asChild>
                    <Button className="w-9 h-9 glass-hover bg-slate-900 border border-slate-800 rounded-full p-2 text-white">
                      <FiArrowLeft className="size-5" />
                    </Button>
                  </Drawer.Close>
                  <div>
                    <h2 className="font-bold text-base sm:text-lg text-white">Khám Phá VR</h2>
                    <p className="text-xs text-slate-400 truncate max-w-[180px]">
                      {currentArea?.area_name || "Long Trường"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 my-3 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("hotspots")}
                  className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "hotspots"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
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
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
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
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Nhà có công ({nhaCoCongList.length})</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-3">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-slate-900/80 border-slate-800 text-white text-xs placeholder:text-slate-500 rounded-xl focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Tab Content List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800">
                
                {/* 📍 Tab 1: Hotspots List */}
                {activeTab === "hotspots" && (
                  <>
                    {filteredHotspots.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-8">Chưa có địa điểm nào.</p>
                    ) : (
                      filteredHotspots.map((hotspot) => {
                        const isCurrent = currentHotspot?.hotspot_id === hotspot.hotspot_id;
                        return (
                          <div
                            key={hotspot.hotspot_id}
                            onClick={() => {
                              if (hotspot.click_panorama_id) {
                                showMedia(hotspot.click_panorama_id);
                              }
                            }}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 group ${
                              isCurrent
                                ? "bg-blue-600/20 border-blue-500/80 text-white shadow-lg"
                                : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/80 text-slate-300"
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <FiMapPin className={`w-5 h-5 ${isCurrent ? "text-blue-400 animate-bounce" : "text-blue-400"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xs font-bold text-white truncate group-hover:text-blue-300">
                                {hotspot.title}
                              </h3>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {hotspot.description || "Chưa có mô tả"}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        );
                      })
                    )}
                  </>
                )}

                {/* 🗺️ Tab 2: Routes List */}
                {activeTab === "routes" && (
                  <>
                    {filteredRoutes.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-8">Chưa có tuyến đường tham quan nào.</p>
                    ) : (
                      filteredRoutes.map((route) => (
                        <div
                          key={route.id}
                          onClick={() => setSelectedItem(route)}
                          className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/80 transition-all cursor-pointer flex items-center gap-3 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Navigation className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-bold text-white truncate group-hover:text-emerald-300">
                              {route.name}
                            </h3>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {route.description ? route.description.replace(/<[^>]*>?/gm, '') : "Tuyến tham quan"}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      ))
                    )}
                  </>
                )}

                {/* 🏛️ Tab 3: NhaCoCong List */}
                {activeTab === "nhacocong" && (
                  <>
                    {filteredNhaCoCong.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-8">Chưa có thông tin nhà có công.</p>
                    ) : (
                      filteredNhaCoCong.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/80 transition-all cursor-pointer flex items-center gap-3 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Award className="w-5 h-5 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-bold text-white truncate group-hover:text-amber-300">
                              {item.ten_liet_si || item.nha_cua_ai}
                            </h3>
                            <p className="text-[11px] text-amber-200/70 truncate mt-0.5">
                              Chủ hộ: {item.nha_cua_ai}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>

              {/* Quick Options Bottom Bar */}
              <div className="pt-3 mt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <Button
                  className="w-full h-9 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  onClick={() => navigate("/")}
                >
                  <RiGlobalFill className="size-4 text-blue-400" />
                  <span>Trang chủ</span>
                </Button>
                <Button
                  className="w-full h-9 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  onClick={() => {
                    window.location.href = "mailto:vrdiachido@gmail.com";
                  }}
                >
                  <Mail className="size-4 text-emerald-400" />
                  <span>Góp ý</span>
                </Button>
              </div>

            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Item Details Popup Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[10005] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 text-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-amber-300 truncate">
                {selectedItem.ten_liet_si || selectedItem.name || selectedItem.nha_cua_ai}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* If NhaCoCong */}
              {selectedItem.nha_cua_ai && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 flex items-center gap-1"><FiUser /> Chủ nhà:</span>
                      <p className="font-semibold text-white mt-0.5">{selectedItem.nha_cua_ai}</p>
                    </div>
                    {selectedItem.ten_liet_si && (
                      <div>
                        <span className="text-amber-400 flex items-center gap-1"><Award /> Liệt sĩ:</span>
                        <p className="font-semibold text-white mt-0.5">{selectedItem.ten_liet_si}</p>
                      </div>
                    )}
                    {(selectedItem.ngay_sinh || selectedItem.ngay_mat) && (
                      <div className="col-span-2">
                        <span className="text-slate-400 flex items-center gap-1"><FiCalendar /> Sinh / Mất:</span>
                        <p className="font-semibold text-white mt-0.5">
                          {selectedItem.ngay_sinh || "?"} — {selectedItem.ngay_mat || "?"}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedItem.tieu_su && (
                    <div className="space-y-1.5">
                      <h4 className="font-semibold text-slate-300">Tiểu Sử Chi Tiết:</h4>
                      <div
                        className="prose prose-invert max-w-none text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60"
                        dangerouslySetInnerHTML={{ __html: selectedItem.tieu_su }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* If Route */}
              {selectedItem.points && (
                <div className="space-y-3">
                  {selectedItem.description && (
                    <div
                      className="prose prose-invert max-w-none text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60"
                      dangerouslySetInnerHTML={{ __html: selectedItem.description }}
                    />
                  )}
                </div>
              )}

              {/* Image Gallery */}
              {selectedItem.images && selectedItem.images.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="font-semibold text-slate-300">Hình Ảnh:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedItem.images.map((imgUrl: string, idx: number) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt="Hình ảnh"
                        className="w-full h-32 object-cover rounded-xl border border-slate-800 hover:scale-105 transition-transform"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeftNavDrawerBlock;
