import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css';
import axios from 'axios';

const columns = [
  { name: 'vesselName', header: 'Vessel Name', minWidth: 150 },
  { name: 'geofence', header: 'Geofence Name', minWidth: 150 },
  { name: 'status', header: 'Status', minWidth: 100 },
  { name: 'entryTime', header: 'Entry Time', minWidth: 150 },
  { name: 'exitTime', header: 'Exit Time', minWidth: 150 },
  { name: 'speed', header: 'Speed', minWidth: 100 },
  { name: 'heading', header: 'Heading', minWidth: 100 },
  { name: 'destination', header: 'Destination', minWidth: 150 },
];

const formatEntries = (entries = {}, vessels = []) => {
  const entriesArray = Array.isArray(entries)
    ? entries
    : Object.entries(entries || {}).map(([key, value]) => ({
        ...value,
        vesselName: key,
      }));

  return vessels.map(vessel => {
    const entry = entriesArray.find(e => e.vesselName === vessel.name) || {};

    return {
      vesselName: vessel.name,
      geofence: entry.geofence || 'N/A',
      status: entry.status || 'Outside',
      entryTime: entry.entryTime ? new Date(entry.entryTime).toLocaleString() : 'N/A',
      exitTime: entry.exitTime ? new Date(entry.exitTime).toLocaleString() : 'N/A',
      speed: vessel.speed || 'N/A',
      heading: vessel.heading || 'N/A',
      destination: vessel.destination || 'N/A',
    };
  });
};

const GeofenceMessage = ({ vesselEntries = {}, vessels = [], onRowClick }) => {
  const dataSource = formatEntries(vesselEntries, vessels);
  const [insideVessels, setInsideVessels] = useState([]);

  // useEffect(() => {
  //   const checkInsideVessels = () => {
  //     const inside = dataSource.filter(vessel => vessel.status === 'Inside');
  //     if (inside.length > 0) {
  //       setInsideVessels(inside);
  //       console.log(insideVessels);
  //     }
  //     if (insideVessels.length > 0) {
  //       sendEmail(insideVessels);
  //       setInsideVessels([]); // Clear the array after sending the email
  //     }
  //   };

  //   checkInsideVessels(); // Run initially to check on first render

  //   const interval = setInterval(() => {
  //     checkInsideVessels();
  //   }, 10000); // Check every 10 seconds

  //   // return () => clearInterval(interval); 
  // }, [dataSource]);

  // useEffect(() => {
  //   const sendEmailInterval = setInterval(() => {
  //     if (insideVessels.length > 0) {
  //       sendEmail(insideVessels);
  //       setInsideVessels([]); 
  //     }
  //   }, 1 * 1000); 

  //   return () => clearInterval(sendEmailInterval); // Clean up on unmount
  // }, [insideVessels]);

  // const sendEmail = async (vesselsData) => {
  //   try {
  //     const baseURL = process.env.REACT_APP_API_BASE_URL;
  //     await axios.post(`${baseURL}/api/send-email`, { vessels: vesselsData });
  //     console.log('Email sent successfully');
  //   } catch (error) {
  //     console.error('Error sending email:', error);
  //   }
  // };

  const handleRowClick = (rowData) => {
    onRowClick(rowData.data); // Call the original onRowClick function
  };

  return (
    <div className="geofence-message">
      {dataSource.length === 0 ? (
        <p>No vessels to display</p>
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

GeofenceMessage.propTypes = {
  vesselEntries: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        vesselName: PropTypes.string.isRequired,
        geofence: PropTypes.string.isRequired,
        entryTime: PropTypes.string,
        exitTime: PropTypes.string,
      }).isRequired
    ),
    PropTypes.objectOf(
      PropTypes.shape({
        entryTime: PropTypes.string,
        exitTime: PropTypes.string,
        geofence: PropTypes.string,
      }).isRequired
    ),
  ]).isRequired,
  vessels: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      speed: PropTypes.number,
      heading: PropTypes.number,
      destination: PropTypes.string,
    }).isRequired
  ).isRequired,
  onRowClick: PropTypes.func.isRequired,
};

export default GeofenceMessage;
