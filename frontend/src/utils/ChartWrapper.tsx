import { useState } from "react";
import type { ReactNode } from "react";

interface ChartWrapperProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function ChartWrapper({ title, description, children }: ChartWrapperProps) {
  const [showDesc, setShowDesc] = useState(false);

  return (
    <div>
      <div className="chart-wrapper-header">
        <h4>{title}</h4>
        <button className="info-btn" onClick={() => setShowDesc(true)} title="Click for explanation">
          ?
        </button>
      </div>

      {children}

      {showDesc && (
        <div className="chart-modal-overlay" onClick={() => setShowDesc(false)}>
          <div className="chart-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{title}</h3>
            <p>{description}</p>
            <button className="close-btn" onClick={() => setShowDesc(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
