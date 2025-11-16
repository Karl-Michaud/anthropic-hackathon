"use client";

interface ZoomComponentProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function ZoomComponent({ zoom, onZoomIn, onZoomOut }: ZoomComponentProps) {
  const percentage = Math.round(zoom * 100);

  return (
    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-gray-200">
      {/* Zoom Out Button */}
      <button
        onClick={onZoomOut}
        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors active:scale-95"
        aria-label="Zoom out"
      >
        <span className="text-lg font-medium text-gray-700">−</span>
      </button>

      {/* Zoom Percentage */}
      <div className="min-w-[60px] text-center">
        <span className="text-sm font-medium text-gray-700">{percentage}%</span>
      </div>

      {/* Zoom In Button */}
      <button
        onClick={onZoomIn}
        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors active:scale-95"
        aria-label="Zoom in"
      >
        <span className="text-lg font-medium text-gray-700">+</span>
      </button>
    </div>
  );
}
