
  
  import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';


// Import necessary Leaflet CSS
import 'leaflet/dist/leaflet.css';

const MyMapComponent = () => {
  const position = [51.50853, -0.12574 ]; // Example position for the map center

  return (
    <MapContainer center={position} zoom={1.5} style={{ height: '450px', width: '100%', borderRadius:'12px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

{/* <TileLayer
        url="https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      /> */}

{/* 
<TileLayer
          url="https://api.mapbox.com/styles/v1/nairabhishek02/cln4dwsct038501pbfhj71gpw/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibmFpcmFiaGlzaGVrMDIiLCJhIjoiY2xuNGJtdWdzMDFmajJpcm83cWVqeWVteCJ9.rVvmWN6oFL-9hKYmtUGkaw"
          attribution="Powered By Hyla" 
        /> */}

      {/* <Marker position={position}>
        <Popup>
          A pretty CSS3 popup.<br />Easily customizable.
        </Popup>
      </Marker> */}
    </MapContainer>
  );
};

export default MyMapComponent;



