import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const createCustomIcon = (heading, width, height, iconType) => {
  let iconUrl;

  // Choose the icon URL based on the iconType
  switch (iconType) {
    case 'small':
      iconUrl = '/ship-popup.png'; // Small icon URL
      break;
    case 'medium':
      iconUrl = '/ship-popup.png'; // Medium icon URL
      break;
    case 'large':
      iconUrl = '/ship-popup.png'; // Large icon URL
      break;
    case 'extra-large':
      iconUrl = '/BERTH-ICON.PNG'; // Extra-large icon URL
      break;
    default:
      iconUrl = '/ship-popup.png'; // Default small icon
  }

  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="transform: rotate(${heading}deg); width: ${width}px; height: ${height}px;">
             <img src="${iconUrl}" style="width: 100%; height: 100%;" />
           </div>`,
    iconSize: [width, height],
    // iconAnchor: [width / 2, height / 2],
   
  });
};

const createPointIcon = (width, height) => {
  return L.divIcon({
    className: 'point-icon',
    html:` <div style="width: ${width}px; height: ${height}px; background-color: red; border-radius: 50%;"></div>`,
    iconSize: [width, height],
    
  });
};

// Get icon size and type based on zoom level
const getIconForZoom = (zoom) => {
  if (zoom > 23) return { width: 50, height: 120, type: 'extra-large' }; 
  if (zoom > 20) return { width: 60, height: 80, type: 'extra-large' };
  if (zoom > 17.75) return { width: 60, height: 120, type: 'large' };
  if (zoom > 16.75) return { width: 45, height:120, type: 'large'  };
  if (zoom > 16) return { width: 35, height: 120, type: 'large'  };
  if (zoom > 15.75) return { width: 25, height: 70, type: 'large'  };
  if (zoom > 14.75) return { width: 15, height: 40, type: 'large'  };
  if (zoom > 13.75) return { width: 10, height: 35, type: 'large' };
  if (zoom > 12.75) return { width: 10, height: 35, type: 'large'   };
  if (zoom > 11.5) return { width: 9, height: 25, type: 'large'  };
  if (zoom > 10.75) return { width: 8, height: 15, type: 'large' };
  if (zoom > 9.75) return { width:8, height: 8, type: 'point' };
  if (zoom > 8.75) return { width: 8, height: 8, type: 'point'  };
  if (zoom > 7) return { width: 8, height: 8, type: 'point'  };
  if (zoom > 6) return { width: 8, height: 8, type: 'point'  };
  if (zoom > 4) return { width: 8, height: 8, type: 'point'  };
  if (zoom > 2) return { width: 7, height: 7, type: 'point' };
  return { width: 5, height: 5, type: 'point' };
};

const MapWithMarkers = ({ vessels, selectedVessel }) => {
  const map = useMap();
  const markerClusterGroupRef = useRef(null);
  const markerRef = useRef();

  useEffect(() => {
    if (map) {
      const updateMarkers = () => {
        const currentZoom = map.getZoom();
        const { width, height, type } = getIconForZoom(currentZoom);

        if (markerClusterGroupRef.current) {
          markerClusterGroupRef.current.clearLayers();
        } else {
          markerClusterGroupRef.current = L.markerClusterGroup();
          map.addLayer(markerClusterGroupRef.current);
        }

        vessels.forEach(vessel => {
          if (vessel.lat !== undefined && vessel.lng !== undefined) {
            const marker = L.marker([vessel.lat, vessel.lng], {
              icon: type === 'point'
                ? createPointIcon(width, height)
                : createCustomIcon(vessel.heading, width, height, type),
            });

            marker.bindPopup(`
              <strong>Name:</strong> ${vessel.name || 'No name'}<br />
              <strong>IMO:</strong> ${vessel.imo || 'N/A'}<br />
              <strong>Heading:</strong> ${vessel.heading || 'N/A'}<br />
              <strong>ETA:</strong> ${vessel.eta || 'N/A'}<br />
              <strong>Destination:</strong> ${vessel.destination || 'N/A'}
              <div style="text-align: right;">
                <a href="/dashboard/${vessel.name}" style="cursor: pointer;">
                  <u>++View more</u>
                </a>
              </div>
            `);

            markerClusterGroupRef.current.addLayer(marker);
          } else {
            console.error(`Invalid coordinates for vessel: ${JSON.stringify(vessel)}`);
          }
        });

        markerClusterGroupRef.current.on('clustermouseover', (event) => {
          const cluster = event.layer;
          const vesselCount = cluster.getAllChildMarkers().length;
          cluster.bindPopup(`
            <div>
              <strong>Vessels in the area:</strong> ${vesselCount}
            </div>
          `).openPopup();
        });
      };

      const flyToVessel = () => {
        if (selectedVessel) {
          const { width, height, type } = getIconForZoom(map.getZoom());

          if (markerRef.current) {
            markerRef.current.remove();
          }

          const customIcon = createCustomIcon(selectedVessel.heading, width, height, type);

          markerRef.current = L.marker([selectedVessel.lat, selectedVessel.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
              <div>
                Name: ${selectedVessel.name}<br />
              </div>
              <div style="text-align: right;">
                <a href="/dashboard/${selectedVessel.name}" style="cursor: pointer;">
                  <u>++View more</u>
                </a>
              </div>
            `)
            .openPopup();

          map.flyTo([selectedVessel.lat, selectedVessel.lng], 15, {
            animate: true,
            duration: 1,
          });

          // Update markers after flying to the vessel to ensure the correct icon size
          updateMarkers();
        }
      };

      map.on('zoomend', () => {
        updateMarkers(); // Update markers on zoom events
      });
      updateMarkers(); // Initial update on component mount
      flyToVessel(); // Fly to selected vessel if any
    }
  }, [map, vessels, selectedVessel]);

  return null;
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
  }),
};

export default MapWithMarkers;