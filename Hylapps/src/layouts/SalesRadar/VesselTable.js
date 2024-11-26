
  import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VesselTable.css'; // Import the CSS file

function VesselTable() {
  const [vessels, setVessels] = useState([]);

  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(`${baseURL}/api/get-tracked-vessels`);
        console.log('API Responseeeee:', response.data);
        setVessels(response.data);
      } catch (error) {
        console.error('Error fetching tracked vessels:', error);
      }
    };

    fetchVessels();
  }, []);

  return (
    <div className="table-container">
   
      <table className="vessel-table  " >
        <thead>
          <tr>
            <th>Name</th>
            <th>IMO</th>
            <th>ETA</th>
            <th>Destination</th>
          </tr>
        </thead>
        <tbody >
          {vessels.map((vessel, index) => (
            <tr key={index}>
              <td >{vessel.NAME}</td>
              <td >{vessel.IMO}</td>
              <td >{vessel.ETA}</td>
              <td >{vessel.DESTINATION}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VesselTable;

