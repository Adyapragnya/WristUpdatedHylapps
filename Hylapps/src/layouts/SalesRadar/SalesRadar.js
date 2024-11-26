import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, MenuItem, ListItemIcon, Modal, TextField, Button, Typography, Select, Checkbox, ListItemText } from '@mui/material';
import { AccountCircle, Send } from '@mui/icons-material';
import axios from 'axios';
import { MaterialReactTable } from 'material-react-table';

// Sorting function to order GeofenceType as Berth > Terminal > Anchorage > N/A
const sortPriority = (a, b) => {
  const order = { IncreaseProfit: 1, Grow: 2, Defend: 3,Maintain: 4,Cut: 5, 'N/A': 6 };
  return (order[a.Priority] || 6) - (order[b.Priority] || 6); // Default to a value greater than 4 for unknown types
};

const formatEntries = (salesData = [], trackedVessels = []) => {
  return salesData
    .map(sale => {
      // Find the matching tracked vessel by IMO number
      const matchingVessel = trackedVessels.find(vessel => vessel.AIS.IMO === sale.IMO);

      // If a matching vessel is found, merge the relevant data
      if (matchingVessel) {
        return {
          SalesQutationNumber: sale.SalesQuotationNumber || '_',
          CaseId: sale.CaseId || '-',
          SalesResponsible: sale.SalesResponsible || 'N/A',
          CustomerOwner: sale.CustomerOwner || 'N/A',
          AISName: matchingVessel.AIS?.NAME || 'Unknown Vessel',
          IMO: matchingVessel.AIS?.IMO || '-',
          ETA: matchingVessel.AIS?.ETA || 'N/A',
          Destination: matchingVessel.AIS?.DESTINATION || 'N/A',
          RegionName: matchingVessel.GeofenceStatus || '-',
          GeofenceStatus: matchingVessel.GeofenceStatus || '-',
          Priority: sale.Priority || 'N/A',
          DateOfLastSentQuote: sale.DateOfLastSentQuote || 'N/A',
        };
      }
      // Return a placeholder if no matching vessel is found
      return {
        SalesQutationNumber: sale.SalesQuotationNumber || '_',
        CaseId: sale.CaseId || '-',
        SalesResponsible: sale.SalesResponsible || 'N/A',
        CustomerOwner: sale.CustomerOwner || 'N/A',
        AISName: 'Unknown Vessel',
        IMO: sale.IMO || '-',
        ETA: 'N/A',
        Destination: 'N/A',
        RegionName: 'N/A',
        GeofenceStatus: 'N/A',
        Priority: sale.Priority || 'N/A',
        DateOfLastSentQuote: sale.DateOfLastSentQuote || 'N/A',
      };
    })
    .sort(sortPriority); // Apply sorting based on GeofenceType
};




const Operationtable = ({ vessels = [], onRowClick }) => {
  const [dataSource, setDataSource] = useState([]);
  const [trackedVessels, setTrackedVessels] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [email, setEmail] = useState('');
  const [selectedNames, setSelectedNames] = useState([]); // For multi-select
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    const fetchTrackedVessels = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const trackedVesselsResponse = await axios.get(`${baseURL}/api/get-tracked-vessels`);
        setTrackedVessels(trackedVesselsResponse.data);
        console.log(trackedVesselsResponse);
      } catch (error) {
        console.error('Error fetching tracked vessels:', error);
      }
    };
    fetchTrackedVessels();
  }, []);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const salesDataResponse = await axios.get(`${baseURL}/api/get-upload-sales-data`);
        setSalesData(salesDataResponse.data);
        console.log(salesDataResponse);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };
    fetchSalesData();
  }, []);
  
  useEffect(() => {
    // Once tracked vessels and sales data are fetched, format and set the table data
    if (salesData.length > 0 && trackedVessels.length > 0) {
      const formattedData = formatEntries(salesData, trackedVessels);
      setDataSource(formattedData); // Update the data source for the table
    }
  }, [salesData, trackedVessels]);
 

  useEffect(() => {
    // Fetch users (names and emails) for the modal
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/get-users`);
        setUsersList(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

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
      header: 'Sales Qutation Number',
      accessorKey: 'SalesQutationNumber',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Case Id',
      accessorKey: 'CaseId',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Sales Responsible',
      accessorKey: 'SalesResponsible',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Customer Owner',
      accessorKey: 'CustomerOwner',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },

    {
      header: 'Vessel Name',
      accessorKey: 'AISName',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'IMO',
      accessorKey: 'IMO',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    
    {
      header: 'Priority',
      accessorKey: 'Priority',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },

    {
      header: 'Date Of Last Sent Quote',
      accessorKey: 'DateOfLastSentQuote',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },

    {
      header: 'ETA',
      accessorKey: 'ETA',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Destination',
      accessorKey: 'Destination',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Region Name',
      accessorKey: 'RegionName',
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
    </MenuItem>,
    <MenuItem
      key={1}
      onClick={() => {
        closeMenu();
        setSelectedVessel(row.original);
        setOpenModal(true); // Open the modal to send alert
      }}
      sx={{ m: 0 }}
    >
      <ListItemIcon>
        <Send />
      </ListItemIcon>
      Send Alert
    </MenuItem>,
  ];

  const handleCloseModal = () => {
    setOpenModal(false);
    setEmail('');
    setSelectedNames([]); // Reset the selection
  };

  const handleSendAlert = async () => {
    if (selectedNames.length === 0 || !email) {
      alert('Please select at least one user and enter an email.');
      return;
    }

    try {
      // Send the alert email (this is a placeholder for your backend API logic)
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/send-alert`, {
        names: selectedNames,
        email,
        vessel: selectedVessel?.AISName,
      });
      if (response.data.success) {
        alert('Alert sent successfully!');
      } else {
        alert('Failed to send alert.');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error sending alert:', error);
      alert('An error occurred while sending the alert.');
    }
  };

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
          enableDensityToggle
          enableRowActions
          renderRowActionMenuItems={renderRowActionMenuItems}
          initialState={{
            pagination: { pageIndex: 0, pageSize: 10 },
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
            const Priority = cell.row.original?.Priority;
            let color = '';
            if (Priority === 'IncreaseProfit') color = 'green';
            else if (Priority === 'Grow') color = 'blue';
            else if (Priority === 'Defend') color = 'red';
            else if (Priority === 'Maintain') color = 'brown';
            else if (Priority === 'Cut') color = 'orange';
            return { style: { color, padding: '15px', textAlign: 'center' } };
          }}
        />
      )}

      {/* Modal for sending alert */}
      <Modal open={openModal} onClose={handleCloseModal}>
  <Box
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      bgcolor: 'background.paper', // Light background for the modal
      padding: 4,
      borderRadius: 3,
      boxShadow: 24,
      width: 600, // Adjusted width for better spacing
      maxHeight: '80vh', // Maximum height for responsiveness
      overflowY: 'auto', // Make the modal scrollable if content overflows
    }}
  >
    <Typography variant="h6" mb={2} sx={{ fontWeight: 'bold' }}>
      Send Alert
    </Typography>

    {/* Multi-Select for User Names */}
    <Box sx={{ mb: 3 }}>
      <Typography variant="body1" sx={{ mb: 1 }} style={{ textAlign: 'left' }}>
        User Names
      </Typography>
      <Select
        multiple
        fullWidth
        value={selectedNames}
        onChange={(e) => setSelectedNames(e.target.value)}
        renderValue={(selected) => selected.join(', ')}
        sx={{
          borderRadius: 2, // Rounded corners for the select input
        }}
      >
        {usersList.map((user) => (
          <MenuItem key={user.id} value={user.name}>
            <Checkbox checked={selectedNames.includes(user.name)} />
            <ListItemText primary={user.name} />
          </MenuItem>
        ))}
      </Select>
    </Box>

    {/* Dropdown for User Email */}
    <Box sx={{ mb: 3 }}>
      <Typography variant="body1" sx={{ mb: 1 }} style={{ textAlign: 'left' }}>
      User Email
      </Typography>
      <Select
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{
          borderRadius: 2, // Rounded corners for the select input
        }}
      >
        {usersList.map((user) => (
          <MenuItem key={user.id} value={user.email}>
            {user.email}
          </MenuItem>
        ))}
      </Select>
    </Box>

    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Button variant="outlined" onClick={handleCloseModal} sx={{ flex: 1 }}>
        Cancel
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSendAlert}
        sx={{
          flex: 1,
          backgroundColor: '#1976d2', // Custom color
          '&:hover': {
            backgroundColor: '#1565c0', // Darker on hover
          },
        }}
      >
        Send
      </Button>
    </Stack>
  </Box>
</Modal>


    </div>
  );
};

Operationtable.propTypes = {
  vessels: PropTypes.array.isRequired,
  onRowClick: PropTypes.func.isRequired,
};

export default Operationtable;
