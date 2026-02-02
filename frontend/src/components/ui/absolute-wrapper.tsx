import { Z_INDEX_MAX } from "@/constants/style-values";
import React from "react";

const AbsoluteWrapper = ({
  children = null,
  top,
  left,
  bottom,
  right,
  customClassName,
  zIndex = Z_INDEX_MAX,
}: {
  children: React.ReactNode;
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
  customClassName?: string;
  zIndex?: number;
}) => {
  return (
    <div
      className={`absolute ${customClassName}`}
      style={{
        top: top,
        left: left,
        bottom: bottom,
        right: right,
        zIndex: zIndex,
      }}
    >
      {children}
    </div>
  );
};

export default AbsoluteWrapper;
