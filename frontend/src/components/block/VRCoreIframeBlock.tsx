import React from "react";

const VRCoreIframeBlock = ({ ref }: { ref?: React.Ref<HTMLIFrameElement> }) => {
  return (
    <div className="h-full w-full absolute top-0 left-0 z-[0]">
      <iframe
        id="vr_core"
        className="w-full h-full border-0 block"
        ref={ref}
        src="/vr_core/index.htm"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          outline: "none",
        }}
        allowFullScreen
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default VRCoreIframeBlock;
