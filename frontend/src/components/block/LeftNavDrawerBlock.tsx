import { useState } from "react";
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
} from "react-icons/fi";
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
  const [collapsed, setCollapsed] = useState(false);

  const { currentArea, areaHotspots, currentHotspot } = useVRStore();
  const navigate = useNavigate();

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
        className="w-10 h-10 bg-white border border-gray-200 rounded-xl shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
        title="Mở rộng"
      >
        <FiChevronRight className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="w-[340px] sm:w-[400px] h-full flex flex-col bg-white text-gray-900 rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 p-4 pb-3 border-b border-gray-200">
        {selectedItem ? (
          <button
            type="button"
            onClick={() => setSelectedItem(null)}
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 cursor-pointer shrink-0 transition-colors"
          >
            <FiArrowLeft className="size-5" />
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base sm:text-lg text-gray-900 truncate">
            {selectedItem
              ? (selectedItem.title || selectedItem.name || selectedItem.nha_cua_ai || selectedItem.ten_liet_si)
              : (currentArea?.area_name || "Long Trường")}
          </h2>
          <p className="text-xs text-gray-500 truncate">
            {selectedItem
              ? (selectedItem.address || "Chi tiết")
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

          {/* Preview image */}
          {selectedItem.preview_image && (
            <img
              src={selectedItem.preview_image}
              alt={selectedItem.title}
              className="w-full h-48 object-cover rounded-xl border border-gray-200"
            />
          )}

          {/* Hotspot detail */}
          {selectedItem.hotspot_id && (
            <div className="space-y-3">
              {selectedItem.description && (
                <div
                  className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs"
                  dangerouslySetInnerHTML={{ __html: selectedItem.description }}
                />
              )}
              {selectedItem.address && (
                <div className="flex items-center gap-2 text-gray-500 text-xs">
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-2.5 cursor-pointer transition-colors"
                >
                  Trải nghiệm VR 360°
                </Button>
              )}
            </div>
          )}

          {/* NhaCoCong detail */}
          {selectedItem.nha_cua_ai && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-500 text-xs flex items-center gap-1"><FiUser /> Chủ nhà</span>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedItem.nha_cua_ai}</p>
                </div>
                {selectedItem.ten_liet_si && (
                  <div>
                    <span className="text-amber-600 text-xs flex items-center gap-1"><Award /> Liệt sĩ</span>
                    <p className="font-semibold text-gray-900 mt-0.5">{selectedItem.ten_liet_si}</p>
                  </div>
                )}
                {(selectedItem.ngay_sinh || selectedItem.ngay_mat) && (
                  <div className="col-span-2">
                    <span className="text-gray-500 text-xs flex items-center gap-1"><FiCalendar /> Sinh / Mất</span>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {selectedItem.ngay_sinh || "?"} — {selectedItem.ngay_mat || "?"}
                    </p>
                  </div>
                )}
              </div>
              {selectedItem.tieu_su && (
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-gray-500 text-xs">Tiểu Sử</h4>
                  <div
                    className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs"
                    dangerouslySetInnerHTML={{ __html: selectedItem.tieu_su }}
                  />
                </div>
              )}
              {selectedItem.que_quan && (
                <div className="text-xs text-gray-500">
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
                  className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs"
                  dangerouslySetInnerHTML={{ __html: selectedItem.description }}
                />
              )}
              {selectedItem.points.length > 0 && (
                <div className="text-xs text-gray-500">
                  {selectedItem.points.length} điểm trên tuyến
                </div>
              )}
            </div>
          )}

          {/* Image Gallery */}
          {selectedItem.images && selectedItem.images.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <h4 className="font-semibold text-gray-500 text-xs">Hình Ảnh</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedItem.images.map((imgUrl: string, idx: number) => (
                  <img
                    key={idx}
                    src={imgUrl}
                    alt="Hình ảnh"
                    className="w-full h-32 object-cover rounded-xl border border-gray-200"
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
                    className="p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                      <Navigation className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-gray-900 truncate">{route.name}</h3>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        {route.description ? route.description.replace(/<[^>]*>?/gm, '') : "Tuyến tham quan"}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
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
                    className="p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
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
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
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
              <span className="text-blue-600">⌂</span>
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
