import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css';
import axios from 'axios';

const columns = [
  { name: 'geofence', header: 'Geofence Name', minWidth: 150 },
  { name: 'seaport', header: 'Seaport', minWidth: 150 }, // New Seaport column
];

// Format entries properly for the table
const formatEntries = (geofences = [], seaports = []) => {
  return geofences.map((geofence, index) => ({
    geofence: geofence || 'N/A',
    seaport: seaports[index] || 'Unknown', // Adding seaport data
  }));
};

const GeofenceList = ({ onRowClick }) => {
  const [polygonGeofences, setPolygonGeofences] = useState([]);
  const [polylineGeofences, setPolylineGeofences] = useState([]);
  const [circleGeofences, setCircleGeofences] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [seaports, setSeaports] = useState([]); // New state for seaports

  const handleRowClick = (rowData) => {
    onRowClick(rowData.data); // Call the original onRowClick function
  };

  useEffect(() => {
    const fetchGeofences = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const [polygonRes, polylineRes, circleRes] = await Promise.all([
          axios.get(`${baseURL}/api/polygongeofences`),
          axios.get(`${baseURL}/api/polylinegeofences`),
          axios.get(`${baseURL}/api/circlegeofences`),
        ]);

        setPolygonGeofences(polygonRes.data);
        setPolylineGeofences(polylineRes.data);
        setCircleGeofences(circleRes.data);

        // Combine all geofences into one array
        const combinedGeofences = [
          ...polygonRes.data.map((geo) => geo.geofenceName),
          ...polylineRes.data.map((geo) => geo.geofenceName),
          ...circleRes.data.map((geo) => geo.geofenceName),
        ];

        // Assuming seaport data can be extracted similarly
        const combinedSeaports = [
          ...polygonRes.data.map((geo) => geo.seaport || 'Unknown'),
        //   ...polylineRes.data.map((geo) => geo.seaport || 'Unknown'),
        //   ...circleRes.data.map((geo) => geo.seaport || 'Unknown'),
        ];

        setGeofences(combinedGeofences);
        setSeaports(combinedSeaports);
       

      } catch (error) {
        console.error('Error fetching geofences:', error);
      }
    };
    fetchGeofences();
  }, []);

  // Format the combined geofences and seaports for the table
  const dataSource = formatEntries(geofences, seaports);

  return (
    <div className="geofence-message">
      {dataSource.length === 0 ? (
        <p>No geofences to display</p>
      ) : (
        <ReactDataGrid
          columns={columns}
          dataSource={dataSource}
          style={{ minHeight: 500 }}
          pagination
          paginationPosition="bottom"
          defaultSortInfo={{ name: 'entryTime', dir: 'desc' }}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
};

GeofenceList.propTypes = {
  onRowClick: PropTypes.func.isRequired,
};

export default GeofenceList;
