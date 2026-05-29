/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Plus, Navigation, ZoomIn, ZoomOut, Map as MapIcon, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ItineraryItem } from '../types';

interface InteractiveMapProps {
  items: ItineraryItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onAddPoint: (lat: number, lng: number) => void;
}

export default function InteractiveMap({
  items,
  selectedItemId,
  onSelectItem,
  onAddPoint,
}: InteractiveMapProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);
  const [clickedCoords, setClickedCoords] = useState<{ x: number; y: number } | null>(null);

  // Handle clicking on map background to prepare quick coordinate addition
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // Avoid triggering if clicking an existing pin
    if ((e.target as HTMLElement).closest('.map-marker')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    // Keep coordinate within constraints
    const cleanX = Math.max(10, Math.min(x, 90));
    const cleanY = Math.max(10, Math.min(y, 90));

    setClickedCoords({ x: cleanX, y: cleanY });
  };

  const handleConfirmAdd = () => {
    if (clickedCoords) {
      onAddPoint(clickedCoords.y, clickedCoords.x);
      setClickedCoords(null);
    }
  };

  // Generate trace path connecting itinerary items in chronological order
  const generatePathD = () => {
    if (items.length < 2) return '';
    let pathString = `M ${items[0].lng} ${items[0].lat}`;
    for (let i = 1; i < items.length; i++) {
      const prev = items[i - 1];
      const cur = items[i];
      const cpX1 = prev.lng + (cur.lng - prev.lng) / 2;
      const cpY1 = prev.lat;
      const cpX2 = prev.lng + (cur.lng - prev.lng) / 2;
      const cpY2 = cur.lat;
      pathString += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${cur.lng} ${cur.lat}`;
    }
    return pathString;
  };

  const selectedItem = items.find((item) => item.id === selectedItemId);

  return (
    <div id="interactive-map-panel" className="bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 overflow-hidden shadow-2xl relative h-[450px]">
      {/* Top Banner Control bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 shadow-lg flex items-center gap-2 pointer-events-auto">
          <Compass className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="text-xs font-semibold text-slate-100 tracking-tight">Interactive SVG Canvas Map</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-white/10 backdrop-blur p-1 rounded-xl border border-white/10 shadow-lg flex items-center gap-1">
            <button
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 2.0))}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-100 transition"
              title="Zoom In"
              id="map-zoom-in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono font-medium px-1 text-slate-300 w-8 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75))}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-100 transition"
              title="Zoom Out"
              id="map-zoom-out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Styled vector map graphics container */}
      <div className="w-full h-full relative cursor-crosshair overflow-hidden bg-slate-950/40">
        <motion.svg
          onClick={handleMapClick}
          className="w-full h-full select-none"
          animate={{ scale: zoomLevel }}
          transition={{ type: 'spring', damping: 20 }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          id="custom-vector-map-svg"
        >
          {/* Stylized background grid pattern */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Styled Geographic Features (Islands and Landmasses) */}
          <path
            d="M 15 15 C 35 12, 45 32, 60 25 C 75 18, 85 45, 80 65 C 75 85, 35 92, 20 75 C 5 58, -5 18, 15 15 Z"
            fill="rgba(30, 27, 75, 0.45)"
            stroke="rgba(129, 140, 248, 0.25)"
            strokeWidth="0.6"
          />
          <path
            d="M 45 42 Q 52 35, 58 48 T 72 55 T 85 42 Q 95 62, 88 80 T 52 88 Z"
            fill="rgba(15, 23, 42, 0.4)"
            stroke="rgba(99, 102, 241, 0.15)"
            strokeWidth="0.4"
            strokeDasharray="1,1"
          />

          {/* Transit Route Line Tracers connecting coordinates */}
          {items.length >= 2 && (
            <g>
              <motion.path
                d={generatePathD()}
                fill="none"
                stroke="#10B981"
                strokeWidth="1.2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              />
              <path
                d={generatePathD()}
                fill="none"
                stroke="#34D399"
                strokeWidth="0.6"
                strokeDasharray="2,2"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* Click-to-add Pin Mock Preview */}
          <AnimatePresence>
            {clickedCoords && (
              <g className="map-marker">
                <circle cx={clickedCoords.x} cy={clickedCoords.y} r="1.5" fill="#3B82F6" className="animate-ping" />
                <circle cx={clickedCoords.x} cy={clickedCoords.y} r="0.8" fill="#2563EB" />
                <foreignObject x={clickedCoords.x - 2} y={clickedCoords.y - 6} width="4" height="4">
                  <div className="text-blue-400 animate-bounce">📍</div>
                </foreignObject>
              </g>
            )}
          </AnimatePresence>

          {/* Render Itinerary Locations pins */}
          {items.map((item, index) => {
            const isSelected = item.id === selectedItemId;
            const isHovered = item.id === activeHoverId;
            const seqNum = index + 1;

            // Determine pin color based on order or category
            let color = '#3B82F6'; // blue activity
            if (item.category === 'dining') color = '#F59E0B'; // yellow dining
            if (item.category === 'accommodation') color = '#EC4899'; // pink stay
            if (item.category === 'sightseeing') color = '#10B981'; // green sight
            if (item.category === 'transport') color = '#6366F1'; // indigo transit

            return (
              <g
                key={item.id}
                className="map-marker cursor-pointer"
                onClick={() => onSelectItem(item.id)}
                onMouseEnter={() => setActiveHoverId(item.id)}
                onMouseLeave={() => setActiveHoverId(null)}
              >
                {/* Ping wave glow for active selections */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={item.lng}
                    cy={item.lat}
                    r={isSelected ? '5' : '3.5'}
                    fill="none"
                    stroke={color}
                    strokeWidth="0.5"
                    className="animate-pulse"
                  />
                )}

                {/* Base Anchor Circle */}
                <circle cx={item.lng} cy={item.lat} r="1" fill="#1E293B" opacity="0.4" />

                {/* Vertical Pin Shaft */}
                <line x1={item.lng} y1={item.lat} x2={item.lng} y2={item.lat - 4} stroke="#CBD5E1" strokeWidth="0.5" />

                {/* Pin Header Bubble */}
                <circle
                  cx={item.lng}
                  cy={item.lat - 4}
                  r={isSelected ? '2.5' : '2'}
                  fill={color}
                  stroke="#FFFFFF"
                  strokeWidth="0.4"
                />

                {/* Sequence Number Label Inside Pin */}
                <text
                  x={item.lng}
                  y={item.lat - 3.2}
                  fill="#FFFFFF"
                  fontSize="1.6"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {seqNum}
                </text>
              </g>
            );
          })}
        </motion.svg>

        {/* Quick coordinate placement floating panel */}
        <AnimatePresence>
          {clickedCoords && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-4 bg-slate-900/95 border border-white/10 px-3 py-2.5 rounded-2xl shadow-xl z-20 flex flex-col gap-1.5 max-w-[200px]"
              id="coords-confirm-popup"
            >
              <div className="flex items-center gap-1.5 text-blue-400">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold tracking-tight text-white">Place Custom Stop?</span>
              </div>
              <p className="text-[10px] text-slate-300 font-mono leading-tight">
                Placement at {clickedCoords.x}%, {clickedCoords.y}% on SVG Map grid.
              </p>
              <div className="flex gap-1.5 mt-1">
                <button
                  onClick={handleConfirmAdd}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-[10px] font-semibold py-1 rounded-lg transition-all flex items-center justify-center gap-1 shadow"
                  id="coords-add-pin-btn"
                >
                  <Plus className="w-3 h-3" /> Add Stop
                </button>
                <button
                  onClick={() => setClickedCoords(null)}
                  className="bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-medium px-2 py-1 rounded-lg transition"
                  id="coords-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover Detail tooltip */}
        <AnimatePresence>
          {activeHoverId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute pointer-events-none bg-slate-950/90 border border-white/20 text-white px-3 py-2 rounded-xl shadow-2xl text-xs z-30 max-w-[220px]"
              style={{
                left: `${items.find((i) => i.id === activeHoverId)!.lng}%`,
                top: `${items.find((i) => i.id === activeHoverId)!.lat - 12}%`,
                transform: 'translateX(-50%)',
              }}
              id="map-hover-tooltip"
            >
              {(() => {
                const h = items.find((i) => i.id === activeHoverId);
                if (!h) return null;
                return (
                  <div>
                    <div className="font-bold flex items-center gap-1 mb-0.5 truncate text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {h.title}
                    </div>
                    {h.address && <p className="text-[10px] text-slate-300 truncate">{h.address}</p>}
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/10 text-[10px] text-indigo-200 font-mono">
                      <span>🕒 {h.duration}</span>
                      <span>💰 {h.cost === 0 ? 'Free' : `$${h.cost}`}</span>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Legend (Bottom Right overlays) */}
        <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 shadow-lg text-[10px] flex flex-col gap-1 z-10 select-none">
          <div className="font-semibold text-indigo-200 mb-0.5 border-b border-white/5 pb-0.5 tracking-tight flex items-center gap-1 leading-none">
            <Compass className="w-3 h-3 text-indigo-400" /> Map Categories
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block shadow" /> Sakura / Sights
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6] inline-block shadow" /> Arts / Activities
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] inline-block shadow" /> Food / Dinings
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#EC4899] inline-block shadow" /> Stay / Lodges
          </div>
        </div>
      </div>
    </div>
  );
}
