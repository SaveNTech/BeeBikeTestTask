import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Scooter, ScooterStatus } from "../types";
import { StatusBadge } from "./StatusBadge";

const STATUS_COLORS: Record<ScooterStatus, string> = {
  available: "#34d399",
  in_use: "#60a5fa",
  maintenance: "#fbbf24",
  offline: "#8b909c",
};

function makeIcon(status: ScooterStatus) {
  const color = STATUS_COLORS[status];
  // Available scooters get a radar-ping ring so the map reads as "live" at a glance.
  const ping = status === "available" ? `<span class="marker-ping" style="background:${color}"></span>` : "";
  return L.divIcon({
    className: "scooter-marker",
    html: `${ping}<span class="marker-dot" style="background:${color}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export function ScooterMap({ scooters }: { scooters: Scooter[] }) {
  const center: [number, number] =
    scooters.length > 0 ? [scooters[0].latitude, scooters[0].longitude] : [55.7558, 37.6173];

  return (
    <div className="map-wrapper">
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {scooters.map((scooter) => (
          <Marker
            key={scooter.id}
            position={[scooter.latitude, scooter.longitude]}
            icon={makeIcon(scooter.status)}
          >
            <Popup>
              <div className="map-popup">
                <strong>{scooter.number}</strong>
                <div>{scooter.model}</div>
                <StatusBadge status={scooter.status} />
                <div>Заряд: {scooter.battery_level}%</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
