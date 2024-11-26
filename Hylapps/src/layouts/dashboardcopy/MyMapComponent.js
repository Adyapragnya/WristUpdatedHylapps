import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import L from 'leaflet';
import 'leaflet-fullscreen';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';


// Function to create a custom icon with rotation
const createCustomIcon = (heading) => {
  const iconUrl = '/ship-popup.png'; // Custom ship icon URL

  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="transform: rotate(${heading}deg);"><img src="${iconUrl}" style="width: 12px; height: 12px;" /></div>`,
    iconSize: [7, 7],
    
  });
};

// Function to create a small point icon for the global map
const createPointIcon = () => {
  return L.divIcon({
    className: 'point-icon',
    html: '<div style="width: 12px; height: 12px; background-color: red; border-radius: 50%;"></div>',
    iconSize: [10, 10],
    
  });
};

const MapWithMarkers = ({ vessels, selectedVessel }) => {
  const map = useMap();
  const markerRef = useRef();
  const clusterGroupRef = useRef(null);
  const [previousVessel, setPreviousVessel] = useState(null);

  useEffect(() => {
    if (map) {
      // Initialize marker cluster group
      if (!clusterGroupRef.current) {
        clusterGroupRef.current = L.markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 40, // Adjust cluster radius if needed
        });
        map.addLayer(clusterGroupRef.current);
      }

      map.whenReady(() => {
        if (selectedVessel) {
          console.log('selectedVessel:', selectedVessel);

          if (previousVessel && previousVessel.lat && previousVessel.lng) {
            const bounds = L.latLngBounds([
              [previousVessel.lat, previousVessel.lng],
              [selectedVessel.lat, selectedVessel.lng]
            ]);

            map.flyToBounds(bounds, {
              padding: [50, 50],
              duration: 2,
              easeLinearity: 0.5
            });

            setTimeout(() => {
              const customIcon = createCustomIcon(selectedVessel.heading);

              if (markerRef.current) {
                markerRef.current.remove();
              }

              markerRef.current = L.marker([selectedVessel.lat, selectedVessel.lng], { icon: customIcon })
                .addTo(map)
                .bindPopup(`
                  <div>
                    Name: ${selectedVessel.name}<br />
                    IMO: ${selectedVessel.imo}<br />
                    ETA: ${selectedVessel.eta}<br />
                    Destination: ${selectedVessel.destination}<br />
                  </div></br>
                  <div style="text-align: right;">
                    <a href="/dashboard/${selectedVessel.name}" style="cursor: pointer;">
                      <u>++View more</u>
                    </a>
                  </div>
                `)
                .openPopup();

              map.flyTo([selectedVessel.lat, selectedVessel.lng], 10, {
                duration: 2,
                easeLinearity: 0.5
              });
            }, 2000);
          } else {
            const customIcon = createCustomIcon(selectedVessel.heading);

            if (markerRef.current) {
              markerRef.current.remove();
            }

            markerRef.current = L.marker([selectedVessel.lat, selectedVessel.lng], { icon: customIcon })
              .addTo(map)
              .bindPopup(`
                <div>
                  Name: ${selectedVessel.name}<br />
                  IMO: ${selectedVessel.imo}<br />
                  ETA: ${selectedVessel.eta}<br />
                  Destination: ${selectedVessel.destination}<br />
                </div></br>
                <div style="text-align: right;">
                  <a href="/dashboard/${selectedVessel.name}" style="cursor: pointer;">
                    <u>++View more</u>
                  </a>
                </div>
              `)
              .openPopup();

            map.flyTo([selectedVessel.lat, selectedVessel.lng], 11, {
              duration: 2,
              easeLinearity: 0.5
            });
          }

          setPreviousVessel(selectedVessel);
        } else if (vessels.length > 0) {
          const validVessels = vessels.filter(vessel => vessel.lat && vessel.lng);
          if (validVessels.length > 0) {
            const bounds = L.latLngBounds(validVessels.map(vessel => [vessel.lat, vessel.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        }
      });

      return () => {
        // Clear markers from the map when the component is unmounted or when vessels change
        if (clusterGroupRef.current) {
          clusterGroupRef.current.clearLayers();
        }
      };
    }
  }, [map, selectedVessel, vessels]);

  useEffect(() => {
    // Add vessel markers to the cluster group
    if (vessels && clusterGroupRef.current) {
      clusterGroupRef.current.clearLayers(); // Clear previous markers
      vessels.forEach(vessel => {
        if (vessel.lat && vessel.lng) {
          const icon = selectedVessel && vessel.name === selectedVessel.name
            ? createCustomIcon(vessel.heading)
            : createPointIcon();
          const marker = L.marker([vessel.lat, vessel.lng], { icon }).bindPopup(`
            <strong>Name:</strong> ${vessel.name || 'No name'}<br />
            <strong>IMO:</strong> ${vessel.imo || 'N/A'}<br />
            <strong>Heading:</strong> ${vessel.heading || 'N/A'}<br />
            <strong>ETA:</strong> ${vessel.eta || 'N/A'}<br />
            <strong>Destination:</strong> ${vessel.destination || 'N/A'}<br />
            <div style="text-align: right; margin-top: 8px;">
              <a href="/dashboard/${vessel.name}" style="cursor: pointer;"><u>++View more</u></a>
            </div>
          `);

          clusterGroupRef.current.addLayer(marker); // Add marker to the cluster group
        }
      });
    }
  }, [vessels, selectedVessel]);

  return null; // We don't need to render anything directly in this component
};

MapWithMarkers.propTypes = {
  vessels: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      name: PropTypes.string,
      imo: PropTypes.number,
      heading: PropTypes.number,
      eta: PropTypes.string,
      destination: PropTypes.string,
    }).isRequired
  ).isRequired,
  selectedVessel: PropTypes.shape({
    name: PropTypes.string.isRequired,
    imo: PropTypes.number,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    heading: PropTypes.number,
    eta: PropTypes.string,
    destination: PropTypes.string,
  })
};

const MapWithFullscreen = () => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      const fullscreenControl = L.control.fullscreen({
        position: 'topright',
        title: 'View Fullscreen',
        titleCancel: 'Exit Fullscreen',
      }).addTo(map);

      const resetViewControl = L.Control.extend({
        options: {
          position: 'topleft'
        },
        onAdd() {
          const container = L.DomUtil.create('div', 'leaflet-bar');
          const button = L.DomUtil.create('a', 'leaflet-bar-part leaflet-reset-view', container);
          button.title = 'Reset View';
          button.innerHTML = '<i class="fas fa-sync-alt"></i>';
          L.DomEvent.on(button, 'click', () => {
            map.setView([0, 0], 1.15); // Reset to a default view
          });
          return container;
        }
      });

      const resetControl = new resetViewControl();
      resetControl.addTo(map);

      return () => {
        fullscreenControl.remove();
        resetControl.remove();
      };
    }
  }, [map]);

  return null;
};

const MyMapComponent = ({ vessels, zoom, center, selectedVessel }) => (
  <MapContainer center={[0, 0]} minZoom={1.2} zoom={1} maxZoom={18} 
  maxBounds={[[85, -180], [-85, 180]]} // Strict world bounds to prevent panning
  maxBoundsViscosity={8} // Makes the map rigid
style={{ height: '500px', width: '100%', backgroundColor: 'rgba(170,211,223,255)'}}>
<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" noWrap={true} />
    <MapWithMarkers vessels={vessels} selectedVessel={selectedVessel} />
    <MapWithFullscreen />
  </MapContainer>
);

MyMapComponent.propTypes = {
  vessels: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      name: PropTypes.string,
      imo: PropTypes.number,
      heading: PropTypes.number,
      eta: PropTypes.string,
      destination: PropTypes.string,
    }).isRequired
  ).isRequired,
  zoom: PropTypes.number.isRequired,
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedVessel: PropTypes.shape({
    name: PropTypes.string.isRequired,
    imo: PropTypes.number,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    heading: PropTypes.number,
    eta: PropTypes.string,
    destination: PropTypes.string,
  })
};

export default MyMapComponent;
