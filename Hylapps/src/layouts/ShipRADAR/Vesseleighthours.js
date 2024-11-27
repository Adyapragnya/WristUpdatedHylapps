import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, MenuItem, ListItemIcon, Typography } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import axios from 'axios';
import { MaterialReactTable } from 'material-react-table';

// Sorting function to order GeofenceType as Berth > Terminal > Anchorage > N/A
const sortGeofenceType = (a, b) => {
  const order = { Berth: 1, Terminal: 2, Anchorage: 3, 'N/A': 4 };
  return (order[a.GeofenceType] || 5) - (order[b.GeofenceType] || 5); // Default to a value greater than 4 for unknown types
};

const formatEntries = (trackedVessels = []) => {
  return trackedVessels
    .map(vessel => ({
      IMO: vessel.AIS?.IMO || 'N/A',
      AISName: vessel.AIS?.NAME || 'Unknown Vessel',
      GeofenceStatus: vessel.GeofenceStatus || '-',
      ETA: vessel.AIS?.ETA || 'N/A',
      Destination: vessel.AIS?.DESTINATION || 'N/A',
      GeofenceType: vessel.GeofenceType || '-',
      CaseId: vessel.CaseId || '-',
      Info1: vessel.Info1 || '-',
      ETATime: vessel.ETATime || '-',
      ETADate: vessel.ETADate || '-',
      Agent: vessel.Agent || 'N/A',
      AgentName: vessel.AgentName || 'N/A'

    }))
    .sort(sortGeofenceType); // Apply sorting here to ensure Berth is at the top
};

const Vesseleighthours = ({ vessels = [], onRowClick }) => {
  const [dataSource, setDataSource] = useState([]);
  const [trackedVessels, setTrackedVessels] = useState([]);

  useEffect(() => {
    const fetchTrackedVessels = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const trackedVesselsResponse = await axios.get(`${baseURL}/api/get-tracked-vessels`);
        setTrackedVessels(trackedVesselsResponse.data);
      } catch (error) {
        console.error('Error fetching tracked vessels:', error);
      }
    };
    fetchTrackedVessels();
  }, []);

  useEffect(() => {
    if (trackedVessels.length > 0) {
      const formattedData = formatEntries(trackedVessels);
      setDataSource(formattedData); // Always sort when data changes
    }
  }, [trackedVessels]);

  const handleRowClick = (rowData) => {
    const selectedVesselName = rowData.AISName ? rowData.AISName.trim() : '';
    if (!selectedVesselName) {
      console.warn('AISName is undefined or empty in rowData:', rowData);
      return;
    }

    const selectedVesselData = vessels.find(vessel => vessel.name.trim() === selectedVesselName);
    if (selectedVesselData) {
      onRowClick(selectedVesselData);
    } else {
      console.warn(`Vessel data not found for: ${selectedVesselName}`);
    }
  };

  const columns = useMemo(() => [
    {
      header: 'Case Id',
      accessorKey: 'CaseId',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },

    {
      header: 'IMO Number',
      accessorKey: 'IMO',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Vessel Name',
      accessorKey: 'AISName',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },

    {
      header: 'Info1',
      accessorKey: 'Info1',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'ETA Time',
      accessorKey: 'ETATime',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Agent Name',
      accessorKey: 'AgentName',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },

    
    {
      header: 'Vessel AIS ETA',
      accessorKey: 'ETA',
      cell: (info) => {
        const rawEta = info.getValue();
        // Convert the raw string to the desired format with local timezone
        const formattedEta = rawEta
          ? new Date(rawEta).toLocaleString('en-US', {
              day: '2-digit',
              month: 'short', // Jan, Feb, etc.
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false, // 24-hour format
              timeZoneName: 'short', // Include time zone abbreviation (e.g., GMT, EST)
            }).replace(',', '') // Remove the comma between date and time
          : 'N/A'; // Handle cases where ETA is missing
        return <Box sx={{ textAlign: 'center' }}>{formattedEta}</Box>;
      },
    },
    {
      header: 'Destination',
      accessorKey: 'Destination',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Region Name',
      accessorKey: 'GeofenceType',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Location',
      accessorKey: 'GeofenceStatus',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
  ], []);

  const renderRowActionMenuItems = ({ closeMenu, row }) => [
    <MenuItem
      key={0}
      onClick={() => {
        closeMenu();
        handleRowClick(row.original);
      }}
      sx={{ m: 0 }}
    >
      <ListItemIcon>
        <AccountCircle />
      </ListItemIcon>
      View Vessel Details
    </MenuItem>
  ];

  return (
    <div className="geofence-histories">
      {dataSource.length === 0 ? (
        <p>No vessels data to display</p>
      ) : (
        <MaterialReactTable
          columns={columns}
          data={dataSource}
          enableColumnResizing
          enableGrouping
          enablePagination
          enableColumnPinning
          enableExport
          enableDensityToggle={false}
          enableRowActions
          renderRowActionMenuItems={renderRowActionMenuItems}
          initialState={{
            pagination: { pageIndex: 0, pageSize: 5 },
            sorting: [{ desc: false }],
            density: 'compact',
          }}
          muiTableHeadCellProps={{
            style: { fontWeight: 'bold', padding: '8px', textAlign: 'center', color:'#0F67B1' },
          }}
          muiTableBodyRowProps={{
            style: { padding: '15px', textAlign: 'center' },
          }}
          muiTableBodyCellProps={(cell) => {
            const geofenceType = cell.row.original?.GeofenceType;
            let color = '';
            if (geofenceType === 'Berth') color = 'red';
            else if (geofenceType === 'Terminal') color = 'blue';
            else if (geofenceType === 'Anchorage') color = 'green';
            return { style: { color, padding: '15px', textAlign: 'center' } };
          }}
        />
      )}
    </div>
  );
};

Vesseleighthours.propTypes = {
  vessels: PropTypes.array.isRequired,
  onRowClick: PropTypes.func.isRequired,
};

export default Vesseleighthours;
