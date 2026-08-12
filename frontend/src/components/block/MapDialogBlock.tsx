// components/MapDialogBlock.tsx
"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import useVRStore from "@/store/vr.store";
import { Search } from "lucide-react";
import LeftNavDrawerBlock from "./LeftNavDrawerBlock";
import { FiLogOut } from "react-icons/fi";


export default function MapDialogBlock({
    opened,
    setOpened,
    showMedia
}: {
    opened: boolean;
    setOpened: (opened: boolean) => void;
    showMedia: (mediaName: string) => void;
}) {
    const onMarkerSelectHandler = (hotspot: any) => {
        if (hotspot.geolocation?.lon && hotspot.geolocation?.lat) {
            // Set selected hotspot for highlighting
            setSelectedHotspotId(hotspot.hotspot_id);
            setMapSelectedHotspot(hotspot);

            // Fly to the hotspot location
            mapRef.current?.flyTo({
                center: [hotspot.geolocation.lon, hotspot.geolocation.lat],
                zoom: 12,
                speed: 1.2,
                curve: 1,
                easing: (t) => t
            });

            // Close search popover
            setIsSearchOpen(false);
            setSearchValue("");
        }
    };

    const center: [number, number] = import.meta.env.VITE_CENTER_GPS ? import.meta.env.VITE_CENTER_GPS.split(",").map(Number) : [106.6467328, 10.7577344];
    const zoom = 12;

    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const markerRef = useRef<maplibregl.Marker | null>(null);
    const hotspotMarkersRef = useRef<maplibregl.Marker[]>([]);

    const { areaHotspots, currentArea } = useVRStore((state) => state);
    const nhaCoCongList = currentArea?.metadata?.nha_co_cong || [];
    const routes = currentArea?.metadata?.tuyen_duong || [];

    useEffect(() => {
        if (!opened) {
            setSelectedHotspotId(null);
        }
    }, [opened])

    const [searchValue, setSearchValue] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedHotspotId, setSelectedHotspotId] = useState<number | null>(null);
    const [mapSelectedHotspot, setMapSelectedHotspot] = useState<any>(null);

    // Filter hotspots based on search value
    const filteredHotspots = useMemo(() => {
        if (!searchValue.trim()) return [];

        return areaHotspots.filter(hotspot =>
            hotspot.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
            hotspot.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
            hotspot.address?.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [areaHotspots, searchValue]);

    // Init map only once
    useEffect(() => {
        if (!mapContainer.current || mapRef.current) return;

        const goongMapKey = import.meta.env.VITE_GOONG_MAP_KEY;
        const styleUrl = goongMapKey
            ? `https://tiles.goong.io/assets/goong_map_web.json?api_key=${goongMapKey}`
            : {
                version: 8 as const,
                sources: {},
                layers: [],
                glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf"
            };

        mapRef.current = new maplibregl.Map({
            container: mapContainer.current,
            style: styleUrl,
            center,
            zoom,
            pitch: 45,
            attributionControl: false,
        });

        mapRef.current.on("load", async () => {
            let response = await fetch("./map.geojson");
            let geojson = await response.json();

            if (geojson.features) {
                geojson.features = geojson.features.map(
                    (f: any, idx: number) => ({
                        ...f,
                        id: f.id ?? idx,
                    })
                );
            }
            mapRef.current!.addSource("custom-geojson", {
                type: "geojson",
                data: geojson,
            });

            mapRef.current!.addLayer({
                id: "custom-geojson-fill",
                type: "fill",
                source: "custom-geojson",
                paint: {
                    "fill-color": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        "#2b7fff",
                        "#3b82f6",
                    ],
                    "fill-opacity": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        0.35,
                        0.08,
                    ],
                },
            });

            mapRef.current!.addLayer({
                id: "custom-geojson-line",
                type: "line",
                source: "custom-geojson",
                paint: {
                    "line-color": "#2563eb",
                    "line-width": 1.5,
                    "line-opacity": 0.6,
                },
            });

            mapRef.current?.addLayer({
                id: 'custom-geojson-labels',
                type: 'symbol',
                source: 'custom-geojson',
                layout: {
                    'text-field': ['get', 'ten_xa'],
                    'text-size': 13,
                    'text-anchor': 'center',
                    'symbol-placement': 'point'
                },
                paint: {
                    'text-color': '#1e293b',
                    'text-halo-color': '#ffffff',
                    'text-halo-width': 2
                }
            });
            let hoveredId: string | number | null = null;

            mapRef.current!.on("mousemove", "custom-geojson-fill", (e) => {
                if (e.features?.length) {
                    const featureId = e.features[0].id;

                    if (featureId !== undefined) {
                        if (hoveredId !== null && hoveredId !== featureId) {
                            mapRef.current!.setFeatureState(
                                { source: "custom-geojson", id: hoveredId },
                                { hover: false }
                            );
                        }

                        hoveredId = featureId;
                        mapRef.current!.setFeatureState(
                            { source: "custom-geojson", id: hoveredId },
                            { hover: true }
                        );
                    }
                }
            });

            mapRef.current!.on("mouseleave", "custom-geojson-fill", () => {
                if (hoveredId !== null) {
                    mapRef.current!.setFeatureState(
                        { source: "custom-geojson", id: hoveredId },
                        { hover: false }
                    );
                }
                hoveredId = null;
            });
        });

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
            markerRef.current = null;
            hotspotMarkersRef.current.forEach((marker) => marker.remove());
            hotspotMarkersRef.current = [];
        };
    }, []);

    useEffect(() => {
        if (!mapContainer.current || !mapRef.current) return;

        // Clear existing hotspot markers
        hotspotMarkersRef.current.forEach((marker) => marker.remove());
        hotspotMarkersRef.current = [];

        // 1. Add hotspot markers
        areaHotspots.forEach((hotspot) => {
            if (hotspot.geolocation?.lon && hotspot.geolocation?.lat) {
                const isSelected = selectedHotspotId === hotspot.hotspot_id;

                let element = document.createElement("div");
                element.className = "marker-container";
                element.innerHTML = `
                <div class="map-marker shadow-xl cursor-pointer ${isSelected ? 'ring-[3px] border-[0px] ring-blue-400 border-blue-400 border-none ring-opacity-60 selected' : ''}">
                    <div class="map-marker-circle ">
                        <div class="map-marker-image">
                            <img src="/android-chrome-512x512.png" alt="logo" />
                        </div>
                    </div>
                </div>
                <div class="marker-label">
                    <span class="marker-title ${isSelected ? 'font-bold text-blue-600' : ''}">${hotspot.title}</span>
                </div>
            `;

                // Add click handler to the marker element
                element.addEventListener('click', () => {
                    onMarkerSelectHandler(hotspot);
                });

                let marker = new maplibregl.Marker({
                    element: element,
                    anchor: "bottom",
                });

                marker.setLngLat([hotspot.geolocation.lon, hotspot.geolocation.lat])
                    .addTo(mapRef.current!);
                hotspotMarkersRef.current.push(marker);
            }
        });

        // 2. Add Nhà Có Công markers with VR Long Trường logo
        nhaCoCongList.forEach((item) => {
            if (item.latitude && item.longitude) {
                let element = document.createElement("div");
                element.className = "marker-container";
                element.innerHTML = `
                <div class="map-marker shadow-xl cursor-pointer border-amber-500 ring-2 ring-amber-400">
                    <div class="map-marker-circle">
                        <div class="map-marker-image">
                            <img src="/android-chrome-512x512.png" alt="logo" />
                        </div>
                    </div>
                </div>
                <div class="marker-label">
                    <span class="marker-title font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded shadow-xs border border-amber-200">
                        🎖️ ${item.ten_liet_si || item.nha_cua_ai}
                    </span>
                </div>
            `;

                element.addEventListener('click', () => {
                    setMapSelectedHotspot(item);
                    mapRef.current?.flyTo({
                        center: [item.longitude!, item.latitude!],
                        zoom: 15,
                        duration: 1000
                    });
                });

                let marker = new maplibregl.Marker({
                    element: element,
                    anchor: "bottom",
                });

                marker.setLngLat([item.longitude, item.latitude])
                    .addTo(mapRef.current!);
                hotspotMarkersRef.current.push(marker);
            }
        });

        // 3. Add Tuyến Đường markers & polylines with VR Long Trường logo
        routes.forEach((route) => {
            if (route.points && route.points.length > 0) {
                const coords: [number, number][] = route.points.map((p) => [p.lng ?? p.longitude ?? 0, p.lat ?? p.latitude ?? 0]);
                const sourceId = `route-src-${route.id}`;
                const layerId = `route-lyr-${route.id}`;

                if (mapRef.current?.getSource(sourceId)) {
                    (mapRef.current.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
                        type: 'Feature',
                        properties: {},
                        geometry: { type: 'LineString', coordinates: coords }
                    });
                } else if (mapRef.current) {
                    try {
                        mapRef.current.addSource(sourceId, {
                            type: 'geojson',
                            data: {
                                type: 'Feature',
                                properties: {},
                                geometry: { type: 'LineString', coordinates: coords }
                            }
                        });
                        mapRef.current.addLayer({
                            id: layerId,
                            type: 'line',
                            source: sourceId,
                            layout: { 'line-join': 'round', 'line-cap': 'round' },
                            paint: {
                                'line-color': route.color || '#8b5cf6',
                                'line-width': 4,
                                'line-opacity': 0.8
                            }
                        });
                    } catch (e) {
                        console.error("Error adding route layer:", e);
                    }
                }

                const firstPoint = route.points[0];
                const firstLng = firstPoint.lng ?? firstPoint.longitude;
                const firstLat = firstPoint.lat ?? firstPoint.latitude;
                if (firstLng && firstLat) {
                    let element = document.createElement("div");
                    element.className = "marker-container";
                    element.innerHTML = `
                    <div class="map-marker shadow-xl cursor-pointer border-purple-500 ring-2 ring-purple-400">
                        <div class="map-marker-circle">
                            <div class="map-marker-image">
                                <img src="/android-chrome-512x512.png" alt="logo" />
                            </div>
                        </div>
                    </div>
                    <div class="marker-label">
                        <span class="marker-title font-bold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded shadow-xs border border-purple-200">
                            🚩 Tuyến: ${route.name}
                        </span>
                    </div>
                `;

                    element.addEventListener('click', () => {
                        setMapSelectedHotspot(route);
                        mapRef.current?.flyTo({
                            center: [firstLng, firstLat],
                            zoom: 15,
                            duration: 1000
                        });
                    });

                    let marker = new maplibregl.Marker({
                        element: element,
                        anchor: "bottom",
                    });

                    marker.setLngLat([firstLng, firstLat])
                        .addTo(mapRef.current!);
                    hotspotMarkersRef.current.push(marker);
                }
            }
        });
    }, [areaHotspots, currentArea, selectedHotspotId]);





    return (
        <div
            className={`${opened ? "visible" : "hidden"
                } fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center backdrop-blur-sm z-[999]`}
        >

            {/* Left sidebar — always visible when map is open */}
            <div className="absolute top-12 md:top-4 left-4 bottom-4 z-[1005]">
              <LeftNavDrawerBlock showMedia={showMedia} mapSelectedHotspot={mapSelectedHotspot} onCloseMap={() => setOpened(false)} />
            </div>


            <div className="h-screen w-full relative">
                {/* Search Input with Popover Results */}
                <div className="absolute w-full px-4 md:px-8 flex items-start justify-between top-12 md:top-4 left-1/2 -translate-x-1/2 z-10" style={{ paddingTop: 'env(safe-area-inset-top)' }}>

                    <div className="flex-1 md:flex md:justify-center relative mr-4">
                        <div className="bg-white/80 backdrop-blur-xl shadow-md rounded-full w-full md:w-72 flex items-center px-4 py-3">
                            <Search className="w-5 h-5 text-gray-900 mr-3" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm địa điểm..."
                                className="flex-1 outline-none text-gray-700"
                                value={searchValue}
                                onChange={(e) => {
                                    setSearchValue(e.target.value);
                                    setIsSearchOpen(e.target.value.trim() !== "");
                                }}
                                onFocus={() => {
                                    if (searchValue.trim() !== "") {
                                        setIsSearchOpen(true);
                                    }
                                }}
                                onBlur={() => {
                                    // Close popover when clicking outside, but with a delay to allow clicks on results
                                    setTimeout(() => setIsSearchOpen(false), 150);
                                }}
                            />
                        </div>

                        {/* Search Results - positioned absolutely */}
                        {isSearchOpen && searchValue.trim() !== "" && (
                            <div className="absolute top-full mt-2 w-full md:w-72 bg-white/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 z-50 max-h-64 overflow-y-auto">
                                {filteredHotspots.length > 0 ? (
                                    <div className="space-y-1 p-2">
                                        {filteredHotspots.map((hotspot) => (
                                            <button
                                                key={hotspot.hotspot_id}
                                                onMouseDown={(e) => {
                                                    // Prevent input from losing focus
                                                    e.preventDefault();
                                                    onMarkerSelectHandler(hotspot);
                                                }}
                                                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-start space-x-3">
                                                    {hotspot.preview_image && (
                                                        <img
                                                            src={hotspot.preview_image}
                                                            alt={hotspot.title || ''}
                                                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm text-gray-900 truncate">
                                                            {hotspot.title}
                                                        </h4>
                                                        {hotspot.address && (
                                                            <p className="text-xs text-gray-500 truncate mt-1">
                                                                {hotspot.address}
                                                            </p>
                                                        )}
                                                        {hotspot.description && (
                                                            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                                                {hotspot.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500 text-sm">
                                        Không tìm thấy địa điểm nào
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex-shrink-0">
                        <button
                            onClick={() => setOpened(false)}
                            className="p-3 glass-hover glass text-white z-20 bg-white/80 backdrop-blur-xl rounded-full shadow-md hover:bg-white/90 transition-colors"
                        >
                            <FiLogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div ref={mapContainer} className="w-full h-full" />
            </div>
        </div >
    );
}
