import { SnapToFarmButton } from "./SnapToFarmButton";
import { useFarmPlanningCursor } from "../hooks/useFarmPlanningCursor";
import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { area as turfArea, polygon as turfPolygon, kinks as turfKinks } from '@turf/turf';

// Fix for default Leaflet marker icon paths in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map click events for vertex logging
function MapClickHandler({ onAddVertex }) {
  useMapEvents({
    click(e) {
      onAddVertex(e.latlng);
    },
  });
  return null;
}

export default function FarmPlanningSurveyEngine() {
  const mapRef = React.useRef(null);
  const [vertices, setVertices] = useState([
    { lat: 13.9350, lng: 121.3610 },
    { lat: 13.9360, lng: 121.3650 },
    { lat: 13.9330, lng: 121.3670 },
    { lat: 13.9310, lng: 121.3620 }
  ]);
  const [mapStyle, setMapStyle] = useState('satellite'); // 'satellite' or 'plain'
  const [targetCrop, setTargetCrop] = useState('High-Value Vegetables (Onion/Garlic)');
  const [soilTexture, setSoilTexture] = useState('Sandy Loam / Light Texture');
  const [terrainSlope, setTerrainSlope] = useState(2);

  // Handle adding vertex
  const handleAddVertex = (latlng) => {
    setVertices((prev) => [...prev, latlng]);
  };

  // Handle removing last vertex
  const handleUndoVertex = () => {
    setVertices((prev) => prev.slice(0, -1));
  };

  // Handle reset boundary
  const handleResetBoundary = () => {
    setVertices([]);
  };

  // Calculate accurate geodesic area and check topology using Turf.js
  const { areaHectares, areaSqMeters, hasSelfIntersections } = useMemo(() => {
    if (!vertices || vertices.length < 3) {
      return { areaHectares: 0, areaSqMeters: 0, hasSelfIntersections: false };
    }

    try {
      // Turf expects [longitude, latitude] coordinates with a closed ring
      const coords = vertices.map(v => [v.lng, v.lat]);
      coords.push([vertices[0].lng, vertices[0].lat]); // Close the polygon

      const poly = turfPolygon([coords]);
      
      // Check for self-intersections (bowties)
      const kinksResult = turfKinks(poly);
      const isSelfIntersecting = kinksResult.features.length > 0;

      // Compute geodesic area on WGS84 ellipsoid
      const sqm = turfArea(poly);
      const hectares = sqm / 10000;

      return {
        areaHectares: hectares,
        areaSqMeters: sqm,
        hasSelfIntersections: isSelfIntersecting
      };
    } catch (err) {
      console.error("Spatial computation error:", err);
      return { areaHectares: 0, areaSqMeters: 0, hasSelfIntersections: false };
    }
  }, [vertices]);

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 shadow-md">
        <div>
          <h1 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            🌱 Smart Farm Planning & Field Survey Engine
          </h1>
          <p className="text-xs text-slate-400">Map boundary via Mobile GPS or Drone Survey, auto-derive hydraulic layout & crop plans</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-700 shadow-sm transition">
            📁 Load Plan (JSON)
          </button>
          <button className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition">
            💾 Save Plan (JSON)
          </button>
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-700 shadow-sm transition">
            🖨️ Print Dossier
          </button>
        </div>
      </header>

      {/* GIS Metadata Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2.5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs shrink-0">
        <div>
          <span className="text-slate-500 block uppercase font-medium">Active GIS Site</span>
          <span className="text-emerald-400 font-semibold">📍 Southern Luzon (Batangas)</span>
        </div>
        <div>
          <span className="text-slate-500 block uppercase font-medium">Decimal Degrees (DD)</span>
          <span className="text-slate-300 font-mono">13.93410° N, 121.36320° E</span>
        </div>
        <div>
          <span className="text-slate-500 block uppercase font-medium">DMS Coordinates</span>
          <span className="text-slate-300 font-mono">13° 56′ 2.8″ N, 121° 21′ 47.5″ E</span>
        </div>
        <div>
          <span className="text-slate-500 block uppercase font-medium">UTM Grid Reference</span>
          <span className="text-slate-300 font-mono">Zone 51N (E 539,129, N 1,540,749)</span>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Sidebar Controls */}
        <aside className="w-full lg:w-96 bg-slate-900/80 border-r border-slate-800 p-5 flex flex-col gap-6 overflow-y-auto shrink-0">
          
          {/* Section 1: Field Survey & Boundary Inputs */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center text-[10px]">1</span>
              FIELD SURVEY & BOUNDARY INPUTS
            </h2>
            
            <button 
              onClick={() => alert("Click directly on the map to log GPS vertices sequentially.")}
              className="w-full py-2.5 px-4 bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-800/60 text-emerald-300 font-medium rounded-xl text-xs transition flex items-center justify-center gap-2"
            >
              📍 Log Mobile GPS Boundary Vertex
            </button>
            <div className="flex gap-2">
              <button 
                onClick={handleUndoVertex}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition border border-slate-700"
              >
                Undo Last Vertex
              </button>
              <button 
                onClick={handleResetBoundary}
                className="flex-1 py-2 px-3 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 font-medium rounded-lg text-xs transition border border-rose-800/50"
              >
                Reset Boundary
              </button>
            </div>
          </div>

          {/* Section 2: Soil & Topography Profiles */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center text-[10px]">2</span>
              SOIL & TOPOGRAPHY PROFILES
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Target Crop Profile</label>
              <select 
                value={targetCrop}
                onChange={(e) => setTargetCrop(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-600"
              >
                <option>High-Value Vegetables (Onion/Garlic)</option>
                <option>Rice (Lowland Paddy)</option>
                <option>Corn (Yellow / White)</option>
                <option>Fruit Orchards (Mango/Banana)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Soil Texture Class</label>
              <select 
                value={soilTexture}
                onChange={(e) => setSoilTexture(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-600"
              >
                <option>Sandy Loam / Light Texture</option>
                <option>Clay Loam / Medium Texture</option>
                <option>Heavy Clay / Vertisol</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Mean Terrain Slope (%)</span>
                <span className="text-emerald-400 font-semibold">{terrainSlope}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="30" 
                value={terrainSlope}
                onChange={(e) => setTerrainSlope(Number(e.target.value))}
                className="accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
            Engine Version: 2.4.1-geodesic <br/>
            Spatial projection engine initialized via Turf.js WGS84.
          </div>
        </aside>

        {/* Map Workspace */}
        <main className="flex-1 flex flex-col relative bg-slate-900">
          
          {/* Map Overlay Top Info */}
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
            <div className="bg-slate-950/80 backdrop-blur border border-slate-800 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 shadow-lg pointer-events-auto">
              SPATIAL POLYGON BOUNDARY ({vertices.length} vertices)
              {hasSelfIntersections && (
                <span className="ml-2 px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded text-[10px]">
                  ⚠️ Self-Intersection Detected
                </span>
              )}
            </div>
            
            <div className="bg-emerald-950/90 backdrop-blur border border-emerald-800/80 px-4 py-2 rounded-xl text-xs font-bold text-emerald-400 shadow-lg pointer-events-auto">
              Est. Calculated Area: {areaHectares.toFixed(2)} ha 
              <span className="text-[10px] text-slate-400 font-normal ml-1">({Math.round(areaSqMeters).toLocaleString()} m²)</span>
            </div>
          </div>

          {/* Map Style Controls */}
          <div className="absolute top-16 left-4 z-20 bg-slate-950/80 backdrop-blur border border-slate-800 p-1 rounded-xl flex gap-1 shadow-lg pointer-events-auto">
            <button 
              onClick={() => setMapStyle('plain')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${mapStyle === 'plain' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              Plain Map View
            </button>
            <button 
              onClick={() => setMapStyle('satellite')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${mapStyle === 'satellite' ? 'bg-emerald-600 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              Satellite View
            </button>
          </div>

          {/* Leaflet Map */}
          <div className="w-full h-full relative">

            <MapContainer center={[13.9341, 121.3632]} zoom={15} style={{ width: '100%', height: '100%' }} zoomControl={false}>
              {mapStyle === 'satellite' ? (
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS Community'
                  url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                  maxZoom={19}
                />
              ) : (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  maxZoom={19}
                />
              )}

              <MapClickHandler onAddVertex={handleAddVertex} />

              {/* Render Polygon Boundary */}
              {vertices.length >= 3 && (
                <Polygon 
                  positions={vertices} 
                  pathOptions={{ 
                    color: hasSelfIntersections ? '#f43f5e' : '#10b981', 
                    weight: 3, 
                    fillColor: hasSelfIntersections ? '#f43f5e' : '#10b981', 
                    fillOpacity: 0.3 
                  }} 
                />
              )}

              {/* Render Numbered Vertex Markers */}
              {vertices.map((v, idx) => {
                const customIcon = L.divIcon({
                  className: 'custom-vertex-marker',
                  html: `<div style="background-color: ${hasSelfIntersections ? '#f43f5e' : '#10b981'}; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid #0f172a; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">${idx + 1}</div>`,
                  iconSize: [22, 22],
                  iconAnchor: [11, 11]
                });
                return (
                  <Marker key={idx} position={[v.lat, v.lng]} icon={customIcon}>
                    <Popup>
                      <div className="text-slate-900 text-xs font-sans">
                        <strong>Vertex #{idx + 1}</strong><br/>
                        Lat: {v.lat.toFixed(5)}<br/>
                        Lng: {v.lng.toFixed(5)}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Map Footer Instruction */}
          <div className="absolute bottom-2 left-4 right-4 z-20 text-center pointer-events-none">
            <span className="bg-slate-950/80 backdrop-blur border border-slate-800 text-slate-400 text-[11px] px-3 py-1 rounded-lg shadow pointer-events-auto">
              * Click anywhere on the map to pin survey points or adjust polygon vertices.
            </span>
          </div>

        </main>

      </div>
    </div>
  );
}
```
