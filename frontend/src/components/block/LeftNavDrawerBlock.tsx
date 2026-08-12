import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FiArrowLeft,
  FiMapPin,
  FiSearch,
  FiCalendar,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
} from "react-icons/fi";
import { Mail, Award, Navigation, ChevronRight } from "lucide-react";
import useVRStore from "@/store/vr.store";
import { useNavigate } from "react-router-dom";
import type { NhaCoCong, TuyenDuong } from "@/types/area.service.type";
import type { Hotspot } from "@/types/hotspots.service.type";

interface LeftNavDrawerBlockProps {
  showMedia: (mediaName: string) => void;
  /** When a map marker is clicked, show its detail */
  mapSelectedHotspot?: Hotspot | null;
  /** Close the map dialog */
  onCloseMap?: () => void;
}

export const LeftNavDrawerBlock: React.FC<LeftNavDrawerBlockProps> = ({
  showMedia,
  mapSelectedHotspot,
  onCloseMap,
}) => {
  const [activeTab, setActiveTab] = useState<"hotspots" | "routes" | "nhacocong">("hotspots");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const { currentArea, areaHotspots, currentHotspot } = useVRStore();
  const navigate = useNavigate();

  // When map marker is clicked, show detail in panel
  useEffect(() => {
    if (mapSelectedHotspot) {
      setSelectedItem(mapSelectedHotspot);
    }
  }, [mapSelectedHotspot]);

  const routes: TuyenDuong[] = currentArea?.metadata?.tuyen_duong || [];
  const nhaCoCongList: NhaCoCong[] = currentArea?.metadata?.nha_co_cong || [];

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

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="h-10 px-4 bg-white border border-gray-200 rounded-xl shadow-lg flex items-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        title="Mở rộng"
      >
        <img
          src="/android-chrome-512x512.png"
          alt="Long Trường Logo"
          className="w-5 h-5 rounded-full object-cover shrink-0"
        />
        <span className="text-xs font-semibold whitespace-nowrap">Danh sách địa điểm</span>
        <FiChevronRight className="w-4 h-4 shrink-0" />
      </button>
    );
  }

  return (
    <div className="w-[340px] sm:w-[400px] h-full flex flex-col bg-white text-gray-900 rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">

      {/* ── Header with Long Trường Logo ── */}
      <div className="flex items-center gap-3 p-4 pb-3 border-b border-gray-200 bg-gray-50/50">
        {selectedItem ? (
          <button
            type="button"
            onClick={() => setSelectedItem(null)}
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 cursor-pointer shrink-0 transition-colors"
          >
            <FiArrowLeft className="size-5" />
          </button>
        ) : (
          <img
            src="/android-chrome-512x512.png"
            alt="Logo VR Long Trường"
            className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0 shadow-xs"
          />
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base text-gray-900 truncate">
            {selectedItem
              ? (selectedItem.ten_liet_si || selectedItem.name || selectedItem.title || selectedItem.nha_cua_ai)
              : (currentArea?.area_name || "VR Long Trường")}
          </h2>
          <p className="text-xs text-gray-500 truncate">
            {selectedItem
              ? (selectedItem.que_quan || selectedItem.address || "Chi tiết thông tin")
              : "Phường Long Trường"}
          </p>
        </div>
        {!selectedItem && (
          <button
            onClick={() => setCollapsed(true)}
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 cursor-pointer shrink-0 transition-colors"
            title="Thu nhỏ"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Detail View ── */}
      {selectedItem ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">

          {/* Hotspot detail specific VR button */}
          {selectedItem.hotspot_id && (
            <div className="space-y-3">
              {selectedItem.preview_image && (
                <img
                  src={selectedItem.preview_image}
                  alt={selectedItem.title}
                  className="w-full h-44 object-cover rounded-xl border border-gray-200"
                />
              )}
              {selectedItem.description && (
                <div
                  className="text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs"
                  dangerouslySetInnerHTML={{ __html: selectedItem.description }}
                />
              )}
              {selectedItem.address && (
                <div className="flex items-center gap-2 text-gray-600 text-xs">
                  <FiMapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{selectedItem.address}</span>
                </div>
              )}
              {selectedItem.click_panorama_id && (
                <Button
                  onClick={() => {
                    showMedia(selectedItem.click_panorama_id);
                    setSelectedItem(null);
                    if (onCloseMap) onCloseMap();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-2.5 cursor-pointer transition-colors"
                >
                  Trải nghiệm VR 360°
                </Button>
              )}
            </div>
          )}

          {/* Unified Detail Card for NhaCoCong & Route */}
          {(selectedItem.nha_cua_ai || selectedItem.points || selectedItem.ten_liet_si || (selectedItem.name && !selectedItem.hotspot_id)) && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    selectedItem.nha_cua_ai
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-purple-100 text-purple-800 border border-purple-200"
                  }`}>
                    {selectedItem.nha_cua_ai ? (
                      <><Award className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Nhà Có Công / Gia Đình Liệt Sĩ</>
                    ) : (
                      <><Navigation className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Tuyến Đường Tham Quan</>
                    )}
                  </span>
                  {selectedItem.color && (
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300 shadow-xs shrink-0"
                      style={{ backgroundColor: selectedItem.color }}
                      title="Màu tuyến đường"
                    />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug">
                    {selectedItem.ten_liet_si || selectedItem.name || selectedItem.nha_cua_ai}
                  </h3>
                  {selectedItem.nha_cua_ai && (
                    <p className="text-xs text-gray-600 mt-1 font-medium flex items-center gap-1">
                      <FiUser className="text-gray-400 shrink-0" /> Chủ hộ: <span className="text-gray-900 font-semibold">{selectedItem.nha_cua_ai}</span>
                    </p>
                  )}
                </div>

                {/* Grid info stats (Sinh / Mất, Quê quán, GPS / Số điểm) */}
                <div className="grid grid-cols-1 gap-2 pt-2.5 border-t border-gray-200/80 text-xs text-gray-700">
                  {(selectedItem.ngay_sinh || selectedItem.ngay_mat) && (
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        <strong className="font-semibold text-gray-900">Sinh / Mất:</strong> {selectedItem.ngay_sinh || "??"} — {selectedItem.ngay_mat || "??"}
                      </span>
                    </div>
                  )}

                  {selectedItem.que_quan && (
                    <div className="flex items-start gap-2">
                      <FiMapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-semibold text-gray-900">Quê quán:</strong> {selectedItem.que_quan}
                      </span>
                    </div>
                  )}

                  {selectedItem.latitude && selectedItem.longitude && (
                    <div className="flex items-center gap-2 text-emerald-700 font-mono text-[11px]">
                      <FiMapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>GPS: {selectedItem.latitude.toFixed(5)}, {selectedItem.longitude.toFixed(5)}</span>
                    </div>
                  )}

                  {selectedItem.points && selectedItem.points.length > 0 && (
                    <div className="flex items-center gap-2 text-purple-700 font-semibold text-xs">
                      <Navigation className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Các điểm nối tuyến: {selectedItem.points.length} điểm</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description / Biography */}
              {(selectedItem.tieu_su || selectedItem.description) && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">
                    {selectedItem.tieu_su ? "Tiểu Sử Chi Tiết" : "Mô Tả Tuyến Đường"}
                  </h4>
                  <div
                    className="text-gray-800 leading-relaxed bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-xs space-y-2"
                    dangerouslySetInnerHTML={{ __html: selectedItem.tieu_su || selectedItem.description }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Image Gallery */}
          {selectedItem.images && selectedItem.images.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Hình Ảnh Thư Viện ({selectedItem.images.length})</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedItem.images.map((imgUrl: string, idx: number) => (
                  <img
                    key={idx}
                    src={imgUrl}
                    alt="Hình ảnh"
                    className="w-full h-28 object-cover rounded-xl border border-gray-200 hover:scale-102 transition-transform shadow-xs cursor-pointer"
                    onClick={() => window.open(imgUrl, "_blank")}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ── Tabs ── */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200 mx-4 mt-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("hotspots")}
              className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "hotspots"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiMapPin className="w-3.5 h-3.5" />
              <span>Địa điểm</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("routes")}
              className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "routes"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Tuyến</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("nhacocong")}
              className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "nhacocong"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Nhà có công</span>
            </button>
          </div>

          {/* ── Search ── */}
          <div className="relative mx-4 mt-3 mb-2">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-100 border-gray-200 text-gray-900 text-xs placeholder:text-gray-400 rounded-xl"
            />
          </div>

          {/* ── List ── */}
          <div className="flex-1 overflow-y-auto px-4 space-y-2">

            {/* Hotspots */}
            {activeTab === "hotspots" && (
              filteredHotspots.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">Chưa có địa điểm nào.</p>
              ) : (
                filteredHotspots.map((hotspot) => {
                  const isCurrent = currentHotspot?.hotspot_id === hotspot.hotspot_id;
                  return (
                    <div
                      key={hotspot.hotspot_id}
                      onClick={() => setSelectedItem(hotspot)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isCurrent
                          ? "bg-blue-50 border-blue-300 text-gray-900"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                        <FiMapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold text-gray-900 truncate">{hotspot.title}</h3>
                        <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                          {hotspot.description || "Chưa có mô tả"}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    </div>
                  );
                })
              )
            )}

            {/* Routes */}
            {activeTab === "routes" && (
              filteredRoutes.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">Chưa có tuyến đường nào.</p>
              ) : (
                filteredRoutes.map((route) => (
                  <div
                    key={route.id}
                    onClick={() => setSelectedItem(route)}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-purple-50 hover:border-purple-200 transition-all cursor-pointer flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Navigation className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-gray-900 truncate">{route.name}</h3>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        {route.description ? route.description.replace(/<[^>]*>?/gm, '') : "Tuyến tham quan"}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-purple-600 transition-colors" />
                  </div>
                ))
              )
            )}

            {/* NhaCoCong */}
            {activeTab === "nhacocong" && (
              filteredNhaCoCong.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">Chưa có thông tin nhà có công.</p>
              ) : (
                filteredNhaCoCong.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-amber-50 hover:border-amber-200 transition-all cursor-pointer flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-gray-900 truncate">
                        {item.ten_liet_si || item.nha_cua_ai}
                      </h3>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        Chủ hộ: {item.nha_cua_ai}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-amber-600 transition-colors" />
                  </div>
                ))
              )
            )}
          </div>

          {/* ── Bottom Bar ── */}
          <div className="p-4 mt-2 border-t border-gray-200 grid grid-cols-2 gap-2 text-xs">
            <Button
              className="w-full h-9 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              onClick={() => navigate("/")}
            >
              <FiHome className="size-4 text-blue-600" />
              <span>Trang chủ</span>
            </Button>
            <Button
              className="w-full h-9 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              onClick={() => { window.location.href = "mailto:vrdiachido@gmail.com"; }}
            >
              <Mail className="size-4 text-emerald-600" />
              <span>Góp ý</span>
            </Button>
          </div>
        </>
      )}

    </div>
  );
};

export default LeftNavDrawerBlock;
