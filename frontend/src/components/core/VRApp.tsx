import { useEffect } from "react";
import VRPage from "../pages/VRPage";
import TrackerBlock from "../block/TrackerBlock";
import { Toaster } from "../ui/sonner";
import NotFoundPage from "../pages/NotFoundPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useVRStore from "@/store/vr.store";

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
        <Routes>
          <Route path="/" element={<VRPage />} />
          <Route path="/app" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default VRApp;
