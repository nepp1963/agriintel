import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Compass,
  Database,
  ExternalLink,
  Gauge,
  Info,
  Map as MapIcon,
  Pause,
  Play,
  RefreshCw,
  Satellite,
  ShieldAlert,
  Wifi,
  WifiOff,
  Wind,
} from 'lucide-react';

/**
 * BagyoTrack PH — Standalone Typhoon Path & Agronomic Impact Module for AgriIntelPH
 * - Zero fake/default typhoon data (prevents misleading advisories or liability)
 * - No-API-Key Map (OpenStreetMap) & Satellite (Esri World Imagery) base layers
 * - Responsive Desktop + Mobile layout (prevents card/badge overlap on narrow screens)
 * - Data Attribution: DOST-PAGASA | JMA (RSMC Tokyo) | NOAA / JTWC | ECMWF / Open-Meteo
 */

export interface TrackPoint {
  id: string;
  timestamp: string;
  label: string;
  lat: number;
  lon: number;
  maxWindKph: number;
  gustKph: number;
  pressureHpa: number;
  movement: string;
  category: string;
  type: 'past' | 'current' | 'forecast';
  coneRadiusKm: number;
  windRadiiKm: {
    gale62: number;
    storm89: number;
    typhoon118: number;
  };
}

export interface TcwsArea {
  signal: 1 | 2 | 3 | 4 | 5;
  provinces: string[];
  centerLat: number;
  centerLon: number;
  radiusKm: number;
  agronomicAdvisory: string;
}

export interface TyphoonBulletin {
  hasActiveStorm: boolean;
  stormId: string;
  localName: string;
  intlName: string;
  bulletinNumber: string;
  issuedAt: string;
  sourcePrimary: string;
  points: TrackPoint[];
  tcwsAreas: TcwsArea[];
}

type BaseLayerMode = 'map' | 'satellite';

const CACHE_KEY = 'agriintelph_bagyotrack_live_bulletin_v2';
const DISCLAIMER_ACK_KEY = 'agriintelph_bagyotrack_disclaimer_ack_v1';

const OFFICIAL_DISCLAIMER_TEXT =
  'For informational and agricultural planning purposes only. Track and wind data are aggregated from DOST-PAGASA, JMA, and NOAA/JTWC. Always follow official advisories, evacuation orders, and Tropical Cyclone Wind Signals issued by DOST-PAGASA and your local DRRMO.';

const EMPTY_NO_STORM_STATE: TyphoonBulletin = {
  hasActiveStorm: false,
  stormId: '',
  localName: 'NO ACTIVE TROPICAL CYCLONE',
  intlName: '',
  bulletinNumber: 'Awaiting Live Official Bulletin Feed (No Simulated Storm Displayed)',
  issuedAt: 'No live cyclone data',
  sourcePrimary: 'DOST-PAGASA / JMA / NOAA-JTWC',
  points: [],
  tcwsAreas: [],
};

function defaultAgronomicAdvisory(signal: number): string {
  if (signal >= 4) {
    return 'Extreme wind & surge hazard: halt all field operations, anchor SPIS arrays/structures, and follow DRRMO evacuation directives.';
  }
  if (signal === 3) {
    return 'Severe lodging risk for standing sugarcane & rice; secure SPIS solar arrays, pump houses, and greenhouses immediately.';
  }
  if (signal === 2) {
    return 'Clear farm drainage canals and diversion ditches; harvest mature crops if safe before gale onset.';
  }
  return 'Suspend foliar spraying and fertilizer broadcasting; inspect field bunds and weir gates.';
}

function parseLiveBulletinPayload(raw: unknown): TyphoonBulletin | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const sourceObj =
    obj.typhoon && typeof obj.typhoon === 'object'
      ? (obj.typhoon as Record<string, unknown>)
      : obj;

  if (sourceObj.active === false || sourceObj.hasActiveStorm === false) {
    return null;
  }

  const rawPoints = Array.isArray(sourceObj.points)
    ? sourceObj.points
    : Array.isArray(sourceObj.track)
    ? sourceObj.track
    : [];

  const parsedPoints: TrackPoint[] = rawPoints
    .map((p, idx): TrackPoint | null => {
      if (!p || typeof p !== 'object') return null;
      const pt = p as Record<string, unknown>;
      const lat = Number(pt.lat ?? pt.latitude);
      const lon = Number(pt.lon ?? pt.lng ?? pt.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

      const rawType = String(pt.type ?? '').toLowerCase();
      const ptType: TrackPoint['type'] =
        rawType === 'past' || rawType === 'history'
          ? 'past'
          : rawType === 'current' || rawType === 'now'
          ? 'current'
          : 'forecast';

      const maxWindKph = Number(pt.maxWindKph ?? pt.windKph ?? pt.max_wind_kph ?? 0);
      const gustKph = Number(pt.gustKph ?? pt.gust_kph ?? Math.round(maxWindKph * 1.25));
      const pressureHpa = Number(pt.pressureHpa ?? pt.pressure_hpa ?? 1000);
      const coneRadiusKm = Number(
        pt.coneRadiusKm ?? pt.cone_radius_km ?? (ptType === 'past' ? 0 : 60 + idx * 20)
      );

      const radiiObj =
        pt.windRadiiKm && typeof pt.windRadiiKm === 'object'
          ? (pt.windRadiiKm as Record<string, unknown>)
          : {};

      const ts = String(pt.timestamp ?? pt.time ?? pt.datetime ?? `Point ${idx + 1}`);
      return {
        id: String(pt.id ?? `pt-${idx}`),
        timestamp: ts,
        label: String(pt.label ?? ts),
        lat,
        lon,
        maxWindKph: Number.isNaN(maxWindKph) ? 0 : maxWindKph,
        gustKph: Number.isNaN(gustKph) ? 0 : gustKph,
        pressureHpa: Number.isNaN(pressureHpa) ? 1000 : pressureHpa,
        movement: String(pt.movement ?? 'N/A'),
        category: String(pt.category ?? 'Tropical Cyclone'),
        type: ptType,
        coneRadiusKm: Number.isNaN(coneRadiusKm) ? 0 : coneRadiusKm,
        windRadiiKm: {
          gale62: Number(radiiObj.gale62 ?? 240),
          storm89: Number(radiiObj.storm89 ?? 130),
          typhoon118: Number(radiiObj.typhoon118 ?? 55),
        },
      };
    })
    .filter((item): item is TrackPoint => item !== null);

  if (parsedPoints.length < 2) return null;

  const rawSignals = Array.isArray(sourceObj.tcwsAreas)
    ? sourceObj.tcwsAreas
    : Array.isArray(sourceObj.signals)
    ? sourceObj.signals
    : [];

  const tcwsAreas: TcwsArea[] = rawSignals
    .map((s): TcwsArea | null => {
      if (!s || typeof s !== 'object') return null;
      const sigObj = s as Record<string, unknown>;
      const sigNum = Number(sigObj.signal ?? sigObj.tcws ?? 1);
      const clampedSignal = Math.min(5, Math.max(1, Number.isNaN(sigNum) ? 1 : sigNum)) as
        | 1
        | 2
        | 3
        | 4
        | 5;
      const provinces = Array.isArray(sigObj.provinces)
        ? sigObj.provinces.map((pr) => String(pr))
        : Array.isArray(sigObj.areas)
        ? sigObj.areas.map((pr) => String(pr))
        : [];
      if (provinces.length === 0) return null;

      const centerLat = Number(sigObj.centerLat ?? sigObj.lat ?? parsedPoints[0].lat);
      const centerLon = Number(sigObj.centerLon ?? sigObj.lon ?? parsedPoints[0].lon);
      const radiusKm = Number(sigObj.radiusKm ?? 110 + clampedSignal * 35);

      return {
        signal: clampedSignal,
        provinces,
        centerLat: Number.isNaN(centerLat) ? parsedPoints[0].lat : centerLat,
        centerLon: Number.isNaN(centerLon) ? parsedPoints[0].lon : centerLon,
        radiusKm: Number.isNaN(radiusKm) ? 140 : radiusKm,
        agronomicAdvisory: String(
          sigObj.agronomicAdvisory ?? defaultAgronomicAdvisory(clampedSignal)
        ),
      };
    })
    .filter((item): item is TcwsArea => item !== null);

  return {
    hasActiveStorm: true,
    stormId: String(sourceObj.stormId ?? sourceObj.id ?? 'LIVE-STORM'),
    localName: String(sourceObj.localName ?? sourceObj.name ?? 'ACTIVE TROPICAL CYCLONE'),
    intlName: String(sourceObj.intlName ?? sourceObj.internationalName ?? ''),
    bulletinNumber: String(
      sourceObj.bulletinNumber ?? sourceObj.bulletin ?? 'Live Bulletin Feed'
    ),
    issuedAt: String(
      sourceObj.issuedAt ?? sourceObj.updatedAt ?? new Date().toLocaleString('en-PH')
    ),
    sourcePrimary: String(sourceObj.sourcePrimary ?? 'DOST-PAGASA / JMA / NOAA-JTWC'),
    points: parsedPoints,
    tcwsAreas,
  };
}

function buildConePolygon(points: TrackPoint[]): [number, number][] {
  if (points.length < 2) return [];

  const leftEdge: [number, number][] = [];
  const rightEdge: [number, number][] = [];

  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    const prev = points[i - 1] ?? curr;
    const next = points[i + 1] ?? curr;

    const dLat = next.lat - prev.lat;
    const dLon = next.lon - prev.lon;
    const headingRad = Math.atan2(dLat, dLon);

    const leftAngle = headingRad + Math.PI / 2;
    const rightAngle = headingRad - Math.PI / 2;

    const radiusDeg = Math.max(curr.coneRadiusKm, 35) / 111.32;
    const cosLat = Math.max(0.2, Math.cos((curr.lat * Math.PI) / 180));

    leftEdge.push([
      curr.lat + radiusDeg * Math.sin(leftAngle),
      curr.lon + (radiusDeg * Math.cos(leftAngle)) / cosLat,
    ]);
    rightEdge.push([
      curr.lat + radiusDeg * Math.sin(rightAngle),
      curr.lon + (radiusDeg * Math.cos(rightAngle)) / cosLat,
    ]);
  }

  const last = points[points.length - 1];
  const prevLast = points[points.length - 2];
  const endHeading = Math.atan2(last.lat - prevLast.lat, last.lon - prevLast.lon);
  const endRadiusDeg = Math.max(last.coneRadiusKm, 35) / 111.32;
  const endCosLat = Math.max(0.2, Math.cos((last.lat * Math.PI) / 180));
  const capPoints: [number, number][] = [];

  for (let step = 1; step <= 8; step++) {
    const theta = endHeading + Math.PI / 2 - (Math.PI * step) / 9;
    capPoints.push([
      last.lat + endRadiusDeg * Math.sin(theta),
      last.lon + (endRadiusDeg * Math.cos(theta)) / endCosLat,
    ]);
  }

  return [...leftEdge, ...capPoints, ...rightEdge.reverse()];
}

function getSignalColor(signal: number): string {
  switch (signal) {
    case 5:
      return '#9333ea';
    case 4:
      return '#dc2626';
    case 3:
      return '#ef4444';
    case 2:
      return '#f97316';
    default:
      return '#eab308';
  }
}

export const BagyoTrackPH: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const streetLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const overlayGroupRef = useRef<L.LayerGroup | null>(null);

  const [bulletin, setBulletin] = useState<TyphoonBulletin>(EMPTY_NO_STORM_STATE);
  const [baseLayer, setBaseLayer] = useState<BaseLayerMode>('map');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showWindRadii, setShowWindRadii] = useState<boolean>(true);
  const [showCone, setShowCone] = useState<boolean>(true);
  const [showSignals, setShowSignals] = useState<boolean>(true);
  const [panelOpen, setPanelOpen] = useState<boolean>(true);
  const [noStormCardOpen, setNoStormCardOpen] = useState<boolean>(true);

  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [feedStatus, setFeedStatus] = useState<'LIVE' | 'NO ACTIVE STORM' | 'OFFLINE'>(
    'NO ACTIVE STORM'
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [showDisclaimerModal, setShowDisclaimerModal] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISCLAIMER_ACK_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const acknowledgeDisclaimer = () => {
    setShowDisclaimerModal(false);
    try {
      localStorage.setItem(DISCLAIMER_ACK_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchLiveBulletinData = async () => {
    setIsSyncing(true);
    try {
      if (!navigator.onLine) {
        setBulletin(EMPTY_NO_STORM_STATE);
        setFeedStatus('OFFLINE');
        setIsSyncing(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://bagyo-api.vercel.app/api/typhoon', {
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        const liveBulletin = parseLiveBulletinPayload(json);
        if (liveBulletin && liveBulletin.hasActiveStorm) {
          setBulletin(liveBulletin);
          setFeedStatus('LIVE');
          localStorage.setItem(CACHE_KEY, JSON.stringify(liveBulletin));
          const currIdx = liveBulletin.points.findIndex((p) => p.type === 'current');
          setSelectedIndex(currIdx >= 0 ? currIdx : 0);
          setIsSyncing(false);
          return;
        }
      }

      localStorage.removeItem(CACHE_KEY);
      setBulletin(EMPTY_NO_STORM_STATE);
      setFeedStatus('NO ACTIVE STORM');
    } catch {
      setBulletin(EMPTY_NO_STORM_STATE);
      setFeedStatus(navigator.onLine ? 'NO ACTIVE STORM' : 'OFFLINE');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchLiveBulletinData();
  }, []);

  useEffect(() => {
    if (!isPlaying || !bulletin.hasActiveStorm || bulletin.points.length === 0) return;
    const timer = window.setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % bulletin.points.length);
    }, 1600);
    return () => window.clearInterval(timer);
  }, [isPlaying, bulletin.hasActiveStorm, bulletin.points.length]);

  const activePoint = useMemo(() => {
    if (!bulletin.hasActiveStorm || bulletin.points.length === 0) return null;
    return bulletin.points[selectedIndex] ?? bulletin.points[0];
  }, [bulletin.hasActiveStorm, bulletin.points, selectedIndex]);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [13.5, 122.0],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    });

    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
      }
    );

    streetLayer.addTo(map);

    const overlayGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    streetLayerRef.current = streetLayer;
    satelliteLayerRef.current = satelliteLayer;
    overlayGroupRef.current = overlayGroup;

    // Ensure Leaflet recalculates dimensions cleanly on mobile/responsive layout shifts
    const resizeTimer = window.setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      window.clearTimeout(resizeTimer);
      map.remove();
      mapInstanceRef.current = null;
      streetLayerRef.current = null;
      satelliteLayerRef.current = null;
      overlayGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const street = streetLayerRef.current;
    const sat = satelliteLayerRef.current;
    if (!map || !street || !sat) return;

    if (baseLayer === 'satellite') {
      if (map.hasLayer(street)) map.removeLayer(street);
      if (!map.hasLayer(sat)) sat.addTo(map);
    } else {
      if (map.hasLayer(sat)) map.removeLayer(sat);
      if (!map.hasLayer(street)) street.addTo(map);
    }
  }, [baseLayer]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = overlayGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (!bulletin.hasActiveStorm || !activePoint || bulletin.points.length === 0) {
      return;
    }

    if (showSignals) {
      bulletin.tcwsAreas.forEach((area) => {
        const color = getSignalColor(area.signal);
        L.circle([area.centerLat, area.centerLon], {
          radius: area.radiusKm * 1000,
          color,
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.16,
          dashArray: '4 4',
        })
          .bindTooltip(
            `<div style="font-family: Arial, sans-serif; font-size: 12px;">
              <strong>TCWS Signal #${area.signal}</strong><br/>
              <span>${area.provinces.join(', ')}</span>
            </div>`,
            { sticky: true }
          )
          .addTo(group);
      });
    }

    const forecastSegment = bulletin.points.filter(
      (p) => p.type === 'current' || p.type === 'forecast'
    );
    if (showCone && forecastSegment.length >= 2) {
      const coneCoords = buildConePolygon(forecastSegment);
      if (coneCoords.length > 0) {
        L.polygon(coneCoords, {
          color: '#93c5fd',
          weight: 1.5,
          opacity: 0.8,
          fillColor: '#60a5fa',
          fillOpacity: 0.2,
        }).addTo(group);
      }
    }

    const pastCoords: [number, number][] = bulletin.points
      .filter((p) => p.type === 'past' || p.type === 'current')
      .map((p) => [p.lat, p.lon]);

    if (pastCoords.length >= 2) {
      L.polyline(pastCoords, {
        color: '#a855f7',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.9,
      }).addTo(group);
    }

    const futureCoords: [number, number][] = forecastSegment.map((p) => [p.lat, p.lon]);
    if (futureCoords.length >= 2) {
      L.polyline(futureCoords, {
        color: '#8b5cf6',
        weight: 3.5,
        opacity: 0.95,
      }).addTo(group);
    }

    if (showWindRadii) {
      const rings = [
        {
          radiusKm: activePoint.windRadiiKm.gale62,
          color: '#eab308',
          label: '62 km/h (Gale Force)',
        },
        {
          radiusKm: activePoint.windRadiiKm.storm89,
          color: '#f97316',
          label: '89 km/h (Storm Force)',
        },
        {
          radiusKm: activePoint.windRadiiKm.typhoon118,
          color: '#ef4444',
          label: '118+ km/h (Typhoon Force)',
        },
      ];

      rings.forEach((ring) => {
        L.circle([activePoint.lat, activePoint.lon], {
          radius: ring.radiusKm * 1000,
          color: ring.color,
          weight: 1.5,
          fillColor: ring.color,
          fillOpacity: 0.08,
        })
          .bindTooltip(ring.label, { direction: 'top' })
          .addTo(group);
      });
    }

    bulletin.points.forEach((pt, idx) => {
      const isSelected = idx === selectedIndex;
      const markerColor =
        pt.type === 'past' ? '#c084fc' : pt.type === 'current' ? '#ef4444' : '#38bdf8';

      const marker = L.circleMarker([pt.lat, pt.lon], {
        radius: isSelected ? 9 : 6,
        color: '#ffffff',
        weight: isSelected ? 2.5 : 1.5,
        fillColor: markerColor,
        fillOpacity: 1,
      });

      marker.bindTooltip(
        `<div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4;">
          <strong>${pt.timestamp}</strong><br/>
          Max Winds: <b>${pt.maxWindKph} km/h</b> (Gusts ${pt.gustKph} km/h)<br/>
          Pressure: ${pt.pressureHpa} hPa | ${pt.movement}
        </div>`,
        { direction: 'top' }
      );

      marker.on('click', () => {
        setIsPlaying(false);
        setSelectedIndex(idx);
      });

      marker.addTo(group);
    });
  }, [activePoint, bulletin, selectedIndex, showCone, showSignals, showWindRadii]);

  return (
    <div className="relative w-full md:h-[84vh] md:min-h-[640px] bg-slate-950 text-slate-100 rounded-xl overflow-hidden border border-emerald-800/60 shadow-2xl font-sans flex flex-col">
      {/* FIRST-USE MANDATORY OFFICIAL GUIDANCE MODAL */}
      {showDisclaimerModal && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-emerald-500 rounded-xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <ShieldAlert className="w-7 h-7 shrink-0" />
              <h2 className="text-lg font-bold tracking-wide uppercase">
                Official Guidance &amp; Safety Disclaimer
              </h2>
            </div>

            <p className="text-sm leading-relaxed text-slate-200 bg-slate-950/90 border border-slate-700 rounded-lg p-4 mb-4">
              {OFFICIAL_DISCLAIMER_TEXT}
            </p>

            <div className="text-xs text-slate-400 space-y-1.5 mb-5">
              <p>
                <strong className="text-emerald-400">Aggregated Data Sources:</strong> DOST-PAGASA
                (Philippine Area of Responsibility &amp; TCWS), JMA (RSMC Tokyo), NOAA / JTWC, and
                ECMWF / Open-Meteo.
              </p>
              <p>
                This module displays live official cyclone feeds only and does not invent or
                simulate storm tracks.
              </p>
            </div>

            <button
              onClick={acknowledgeDisclaimer}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition cursor-pointer"
            >
              I Understand — Enter BagyoTrack PH
            </button>
          </div>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <div className="z-[1000] bg-slate-900/95 border-b border-emerald-900/70 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold shrink-0">
            🌀
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">BagyoTrack PH</h1>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-medium">
                AgriIntelPH Decision Module
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{bulletin.bulletinNumber}</p>
          </div>
        </div>

        {/* BASE LAYER SWITCHER, OVERLAY TOGGLES & STATUS BADGE */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
            <button
              type="button"
              onClick={() => setBaseLayer('map')}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 transition cursor-pointer ${
                baseLayer === 'map'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
            <button
              type="button"
              onClick={() => setBaseLayer('satellite')}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 transition cursor-pointer ${
                baseLayer === 'satellite'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Satellite</span>
            </button>
          </div>

          {bulletin.hasActiveStorm && (
            <>
              <button
                type="button"
                onClick={() => setShowCone((v) => !v)}
                className={`text-xs px-2.5 py-1.5 rounded border transition cursor-pointer ${
                  showCone
                    ? 'bg-sky-950/80 border-sky-500/60 text-sky-200'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                Cone
              </button>
              <button
                type="button"
                onClick={() => setShowWindRadii((v) => !v)}
                className={`text-xs px-2.5 py-1.5 rounded border transition cursor-pointer ${
                  showWindRadii
                    ? 'bg-amber-950/80 border-amber-500/60 text-amber-200'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                Wind Radii
              </button>
              <button
                type="button"
                onClick={() => setShowSignals((v) => !v)}
                className={`text-xs px-2.5 py-1.5 rounded border transition cursor-pointer ${
                  showSignals
                    ? 'bg-rose-950/80 border-rose-500/60 text-rose-200'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                TCWS Signals
              </button>
            </>
          )}

          <button
            type="button"
            onClick={fetchLiveBulletinData}
            disabled={isSyncing}
            title="Check live storm feed"
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

          <div
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
              !isOnline || feedStatus === 'OFFLINE'
                ? 'bg-rose-950/90 border-rose-500 text-rose-200'
                : feedStatus === 'LIVE'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                : 'bg-slate-800/90 border-slate-600 text-slate-200'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>
              {feedStatus} • {bulletin.issuedAt}
            </span>
          </div>
        </div>
      </div>

      {/* ALWAYS-VISIBLE PROMINENT OFFICIAL GUIDANCE BANNER */}
      <div className="z-[1000] bg-amber-950/95 border-b border-amber-500/60 px-4 py-1.5 flex items-center justify-between gap-3 text-xs text-amber-100">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{OFFICIAL_DISCLAIMER_TEXT}</span>
        </div>
        <button
          type="button"
          onClick={() => setShowDisclaimerModal(true)}
          className="shrink-0 underline text-amber-300 hover:text-white cursor-pointer"
        >
          Details
        </button>
      </div>

      {/* RESPONSIVE MAP + OVERLAYS CONTAINER */}
      <div className="relative flex-1 w-full flex flex-col">
        {/* Explicit mobile height (h-[380px]) + full flex height on desktop (md:h-full) */}
        <div ref={mapContainerRef} className="w-full h-[380px] sm:h-[440px] md:h-full z-0" />

        {/* NO ACTIVE STORM CARD: Stacked cleanly below map on mobile, floating top-left on desktop */}
        {!bulletin.hasActiveStorm && (
          <div className="m-3 md:m-0 md:absolute md:top-4 md:left-4 z-[900] md:max-w-md bg-slate-900/95 backdrop-blur-md border border-emerald-700/70 rounded-xl shadow-2xl p-4 text-xs space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Live Cyclone Monitor
              </span>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
                  NO DEFAULT / SIMULATED STORM
                </span>
                <button
                  type="button"
                  onClick={() => setNoStormCardOpen((v) => !v)}
                  className="md:hidden p-1 rounded bg-slate-800 text-slate-300"
                  aria-label="Toggle storm monitor notice"
                >
                  {noStormCardOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {noStormCardOpen && (
              <>
                <h2 className="text-base font-extrabold text-white">
                  No Active Tropical Cyclone Track Reported
                </h2>

                <p className="text-slate-300 leading-relaxed">
                  No live tropical cyclone track feed is currently active. To prevent any false
                  alarm or misleading guidance, BagyoTrack PH does not display simulated or
                  placeholder storms.
                </p>

                <div className="pt-1 flex flex-wrap gap-2">
                  <a
                    href="https://www.pagasa.dost.gov.ph/weather#tropical-cyclone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
                  >
                    <span>DOST-PAGASA Bulletins</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://www.jma.go.jp/bosai/map.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold transition"
                  >
                    <span>JMA</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://www.metoc.navy.mil/jtwc/jtwc.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold transition"
                  >
                    <span>NOAA / JTWC</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </>
            )}
          </div>
        )}

        {/* ACTIVE STORM DETAILS & TIMELINE */}
        {bulletin.hasActiveStorm && activePoint && (
          <>
            <div className="m-3 md:m-0 md:absolute md:top-3 md:left-3 z-[900] md:w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-xl shadow-2xl overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-emerald-950 to-slate-900 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Active Tropical Cyclone
                  </span>
                  <h2 className="text-base font-extrabold text-white leading-tight">
                    {bulletin.localName}{' '}
                    {bulletin.intlName && (
                      <span className="text-xs font-normal text-slate-300">
                        ({bulletin.intlName})
                      </span>
                    )}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setPanelOpen((o) => !o)}
                  className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  {panelOpen ? 'Hide' : 'Show'}
                </button>
              </div>

              {panelOpen && (
                <div className="p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Selected Position:</span>
                    <span className="font-bold text-sky-300">{activePoint.timestamp}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                        <Wind className="w-3.5 h-3.5 text-rose-400" />
                        <span>Max Winds</span>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {activePoint.maxWindKph} km/h
                      </div>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                        <Wind className="w-3.5 h-3.5 text-amber-400" />
                        <span>Gustiness</span>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {activePoint.gustKph} km/h
                      </div>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                        <Gauge className="w-3.5 h-3.5 text-sky-400" />
                        <span>Pressure</span>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {activePoint.pressureHpa} hPa
                      </div>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Movement</span>
                      </div>
                      <div className="text-sm font-bold text-white">{activePoint.movement}</div>
                    </div>
                  </div>

                  {bulletin.tcwsAreas.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                        TCWS &amp; Field Engineering Guidance
                      </div>
                      {bulletin.tcwsAreas.map((area) => (
                        <div
                          key={area.signal}
                          className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                              style={{ backgroundColor: getSignalColor(area.signal) }}
                            >
                              SIGNAL #{area.signal}
                            </span>
                            <span className="text-[11px] text-slate-300 font-medium truncate max-w-[175px]">
                              {area.provinces.join(', ')}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {area.agronomicAdvisory}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mx-3 mb-3 md:m-0 md:absolute md:bottom-3 md:left-3 md:right-3 z-[900] bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl px-4 py-3 shadow-2xl">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shrink-0"
                  title={isPlaying ? 'Pause forecast animation' : 'Play 6-hourly track forecast'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <div className="flex-1">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>6-HOURLY TRACK TIMELINE</span>
                    <span className="text-emerald-300 font-semibold">
                      {activePoint.label} ({activePoint.lat.toFixed(1)}°N,{' '}
                      {activePoint.lon.toFixed(1)}°E)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={bulletin.points.length - 1}
                    value={selectedIndex}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setSelectedIndex(Number(e.target.value));
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* MAP ATTRIBUTION & DATA SOURCES OVERLAY: Non-overlapping on mobile, bottom-left on desktop */}
        <div
          className={`mx-3 mb-3 md:m-0 md:absolute ${
            bulletin.hasActiveStorm ? 'md:bottom-24' : 'md:bottom-3'
          } md:left-3 z-[900] bg-slate-950/90 backdrop-blur-md border border-emerald-700/60 rounded-lg px-3 py-1.5 text-[11px] text-slate-200 shadow-lg flex items-center gap-2`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-emerald-400">DATA SOURCES:</strong> DOST-PAGASA | JMA (RSMC
            Tokyo) | NOAA / JTWC | ECMWF / Open-Meteo
          </span>
        </div>
      </div>

      {/* PERMANENT BOTTOM FOOTER DISCLAIMER */}
      <footer className="z-[1000] bg-slate-950 border-t border-slate-800 px-4 py-2 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{OFFICIAL_DISCLAIMER_TEXT}</span>
        </div>
        <span className="text-emerald-400 font-medium shrink-0">
          Sources: DOST-PAGASA • JMA • NOAA/JTWC • ECMWF/Open-Meteo
        </span>
      </footer>
    </div>
  );
};

export default BagyoTrackPH;