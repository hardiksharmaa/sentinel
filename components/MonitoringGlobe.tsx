"use client";

import dynamic from "next/dynamic";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function MonitoringGlobe() {
  return (
    <div className="h-[420px]">
      <Globe
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundColor="rgba(0,0,0,0)"
        width={420}
        height={420}
      />
    </div>
  );
}
