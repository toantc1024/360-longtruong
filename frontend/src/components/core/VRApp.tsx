import { useEffect } from "react";
import VRPage from "../pages/VRPage";
import LandingPage from "../pages/LandingPage";
import TrackerBlock from "../block/TrackerBlock";
import { Toaster } from "../ui/sonner";
import NotFoundPage from "../pages/NotFoundPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import useVRStore from "@/store/vr.store";
import GlobalAudioManager from "../block/GlobalAudioManager";

const VRApp = () => {
  const { loadData } = useVRStore(state => state)
  useEffect(() => {
    (async () => {
      await loadData();
    })()
  }, [])

  return (
    <>
      <TrackerBlock />
      <Toaster />
      <BrowserRouter>
        <GlobalAudioManager />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<VRPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default VRApp;

