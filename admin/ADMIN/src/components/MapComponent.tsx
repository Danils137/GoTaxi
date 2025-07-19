import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapPin, Navigation, Zap } from 'lucide-react';
import api from '../services/api';

interface DriverMarker {
  id: string;
  location: { lat: number; lng: number };
  status: string;
  name?: string;
  vehicleType?: string;
}

interface ClientMarker {
  id: string;
  location: { lat: number; lng: number };
  name?: string;
}

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  type: 'driver' | 'ride' | 'pickup' | 'dropoff';
  title?: string;
  info?: string;
  status?: string; // Опциональное свойство для всех типов маркеров
}

interface MapComponentProps {
  height?: string;
  showControls?: boolean;
  markers?: MarkerData[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

const MapComponent: React.FC<MapComponentProps> = ({
  height = '400px',
  showControls = true,
  markers = [],
  center = { lat: 56.9496, lng: 24.1052 }, // Riga, Latvia default
  zoom = 12
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [drivers, setDrivers] = useState<DriverMarker[]>([]);
  const [clients, setClients] = useState<ClientMarker[]>([]);

  // Fetch online drivers and clients
  useEffect(() => {
    if (!isLoaded) return;
    
    const fetchOnlineData = async () => {
      try {
        const response = await api.get('/map/online');
        const { drivers, clients } = response.data;
        setDrivers(drivers);
        setClients(clients);
      } catch (error) {
        console.error('Error fetching online data:', error);
      }
    };
    
    fetchOnlineData();
    const interval = setInterval(fetchOnlineData, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [isLoaded]);

  // Generate markers from online data
  const activeMarkers = useMemo<MarkerData[]>(() => {
    const driverMarkers = drivers.map(driver => ({
      id: `driver-${driver.id}`,
      lat: driver.location.lat,
      lng: driver.location.lng,
      type: 'driver' as const,
      title: `Driver: ${driver.id}`,
      info: `Status: ${driver.status}`,
      status: driver.status
    }));
    
    const clientMarkers = clients.map(client => ({
      id: `client-${client.id}`,
      lat: client.location.lat,
      lng: client.location.lng,
      type: 'pickup' as const,
      title: `Client: ${client.id}`,
      info: 'Waiting for pickup',
      status: 'waiting' as const
    }));
    
    return [...driverMarkers, ...clientMarkers, ...markers];
  }, [drivers, clients, markers]);

  useEffect(() => {
    // Загружаем Google Maps API с нашим ключом
    const loadGoogleMaps = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => {
        setIsLoaded(true);
        initializeMap();
      };
      document.head.appendChild(script);
    };

    if (!window.google || !window.google.maps) {
      loadGoogleMaps();
    } else {
      setIsLoaded(true);
      initializeMap();
    }
  }, []);

  useEffect(() => {
    if (isLoaded && mapInstanceRef.current) {
      updateMarkers();
    }
  }, [markers, isLoaded]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

      // @ts-ignore - Google Maps types are available
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

    mapInstanceRef.current = map;
    updateMarkers();
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    activeMarkers.forEach(markerData => {
      // @ts-ignore - Google Maps types are available
      const marker = new google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: mapInstanceRef.current,
        title: markerData.title,
        icon: getMarkerIcon(markerData.type, markerData.status),
      });

      // Add info window
      // @ts-ignore - Google Maps types are available
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${markerData.title}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">${markerData.info}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  };

  const getMarkerIcon = (type: string, status?: string): string => {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    switch (type) {
      case 'driver':
        // Different icons for driver status
        switch (status) {
          case 'available': return `${baseUrl}green-dot.png`;
          case 'busy': return `${baseUrl}red-dot.png`;
          case 'offline': return `${baseUrl}gray-dot.png`;
          default: return `${baseUrl}blue-dot.png`;
        }
      case 'ride':
        return `${baseUrl}yellow-dot.png`;
      case 'pickup':
        return `${baseUrl}green-dot.png`;
      case 'dropoff':
        return `${baseUrl}red-dot.png`;
      default:
        return `${baseUrl}blue-dot.png`;
    }
  };

  const centerMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  };

  const toggleTraffic = () => {
    if (mapInstanceRef.current) {
      // @ts-ignore - Google Maps types are available
      const trafficLayer = new google.maps.TrafficLayer();
      trafficLayer.setMap(mapInstanceRef.current);
    }
  };

  if (!isLoaded) {
    return (
      <div 
        className="relative bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden">
      <div ref={mapRef} style={{ height, width: '100%' }} />
      
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={centerMap}
            className="bg-white dark:bg-slate-800 p-2 rounded-md shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Center map"
          >
            <Navigation className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={toggleTraffic}
            className="bg-white dark:bg-slate-800 p-2 rounded-md shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Toggle traffic"
          >
            <Zap className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      )}

      {showControls && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-800 rounded-md shadow-md p-3">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-400">Available Drivers ({activeMarkers.filter(m => m.type === 'driver').length})</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-400">Clients ({activeMarkers.filter(m => m.type === 'pickup').length})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
