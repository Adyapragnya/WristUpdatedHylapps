import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css';
import axios from 'axios';

// Define columns for the DataGrid
const columns = [
  { name: 'AISName', header: 'Vessel Name', minWidth: 200, flex:2 },
  { name: 'GeofenceName', header: 'Geofence Name', minWidth: 200,flex:2 },
  { name: 'geofenceFlag', header: 'Status', minWidth: 200,flex:2 },
  { name: 'GeofenceInsideTime', header: 'Arrival', minWidth: 200,flex:2 },
  { name: 'GeofenceExitTime', header: 'Departure', minWidth: 200,flex:2 },
];

const formatEntries = (vesselHistories = []) => {
  let previousEntry = null; // Track the previous entry to compare
  const entries = vesselHistories.flatMap(history => 
    history.history.map(entry => {
      const currentEntry = {
        AISName: history.vesselName, // Use the vessel name from the history
        GeofenceName: entry.geofenceName || 'N/A', // Display geofence name
        geofenceFlag: entry.geofenceFlag || 'N/A', // Display geofence flag (Inside/Outside)
        GeofenceInsideTime: entry.entryTime ? entry.entryTime : 'N/A', // Format entry time
        GeofenceExitTime: entry.exitTime ? entry.exitTime : 'N/A', // Format exit time or show 'N/A'
      };

      // Skip rows where GeofenceName is 'N/A'
      if (currentEntry.GeofenceName === 'N/A') {
        return null; // Skip this row
      }

      // Compare the current row with the previous row
      if (JSON.stringify(currentEntry) === JSON.stringify(previousEntry)) {
        return null; // Skip row if it matches the previous one
      }

      // Update the previous entry for the next comparison
      previousEntry = currentEntry;

      return currentEntry;
    })
  );

  // Filter out null rows (where data was skipped)
  return entries.filter(entry => entry !== null);
};


const GeofenceHistories = ({ vesselEntries = {}, vessels = [], onRowClick }) => {
  const [dataSource, setDataSource] = useState([]);

  // Fetch vessel histories when the component is mounted
  useEffect(() => {
    const fetchVesselHistories = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(`${baseURL}/api/get-vessel-histories`);
        const formattedData = formatEntries(response.data);
        setDataSource(formattedData);
        console.log(response.data); // Optional: To inspect API response data
      } catch (error) {
        console.error('Error fetching vessel histories:', error);
      }
    };

    fetchVesselHistories();
  }, []);

  const handleRowClick = (rowData) => {
    const selectedVesselName = rowData.data.AISName ? rowData.data.AISName.trim() : '';
    console.log('Selected vessel name:', selectedVesselName); // Log vessel name
  
    if (!selectedVesselName) {
      console.warn('AISName is undefined or empty in rowData:', rowData);
      return;
    }
  
    const selectedVesselData = vessels.find(vessel => vessel.name.trim() === selectedVesselName);
    
    if (selectedVesselData) {
      console.log("Row clicked from GeofenceHistories:", selectedVesselData);
      onRowClick(selectedVesselData); // Send data to parent
    } else {
      console.warn(`Vessel data not found for: ${selectedVesselName}`);
      console.log('Available vessels:', vessels.map(v => v.name));
    }
  };

  return (
    <div className="geofence-histories">
      {dataSource.length === 0 ? (
        <p>No vessel histories to display</p>
      ) : (
        <ReactDataGrid
          columns={columns}
          dataSource={dataSource}
          style={{ minHeight: 500 }}
          pagination
          paginationPosition="bottom"
          defaultSortInfo={{ name: 'GeofenceInsideTime', dir: 'desc' }} // Default sorting by entry time
          onRowClick={handleRowClick} // Trigger row click handler
        />
      )}
    </div>
  );
};

GeofenceHistories.propTypes = {
  vesselEntries: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
  vessels: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      speed: PropTypes.number,
      heading: PropTypes.number,
      destination: PropTypes.string,
    }).isRequired
  ).isRequired,
  onRowClick: PropTypes.func.isRequired,
};

export default GeofenceHistories;
