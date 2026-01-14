"use client";

import { Html, useProgress } from "@react-three/drei";

const CanvasLoader: React.FC = () => {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="flex flex-col items-center">
        <span className="text-sm font-semibold text-gray-500">
          Loading {progress.toFixed(0)}%
        </span>
      </div>
    </Html>
  );
};

export default CanvasLoader;
