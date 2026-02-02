import LOGO_VR from "@/assets/LOGO_VR.png";
export const Logo = () => (
  <div className="flex items-center gap-2 cursor-pointer">
    <img src={LOGO_VR} alt="Logo" className="w-10" />
    <span className="font-bold text-lg">Di tích Lịch sử 360</span>
  </div>
);
