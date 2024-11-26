import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Select from 'react-select';
import './AlertForm.css';
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

const AlertForm = ({ vessels }) => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [message, setMessage] = useState('');
  const [shipParameter, setShipParameter] = useState('');
  const [operator, setOperator] = useState('');
  const [parameterValue, setParameterValue] = useState('');
  const [whatsapp, setWhatsApp] = useState(false);
  const [email, setEmail] = useState(false);
  const [vesselOptions, setVesselOptions] = useState([]);
  const [destinationOptions, setDestinationOptions] = useState([]);
  
  // State to store the last sent alert
  const [lastAlert, setLastAlert] = useState(null);

  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/get-tracked-vessels`);
        if (!response.ok) {
          throw new Error('Failed to fetch vessels');
        }

        const vessels = await response.json();
        const vesselOptions = vessels.map(v => ({
          value: v.AIS.NAME,
          label: `${v.AIS.NAME} | ${v.SpireTransportType}`,
          destination: v.AIS.DESTINATION
        }));
        setVesselOptions(vesselOptions);

        const destinations = [...new Set(vessels.map(v => v.AIS.DESTINATION))].map(dest => ({
          value: dest,
          label: dest,
        }));
        setDestinationOptions(destinations);
      } catch (error) {
        console.error('Error fetching vessels:', error);
        Swal.fire('Error', 'Failed to fetch vessels.', 'error');
      }
    };

    fetchVessels();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!whatsapp && !email) {
      return Swal.fire('Error', 'Please select at least WhatsApp or Email.', 'error');
    }

    // Prepare the alert data
    const alertData = {
      fromDate,
      toDate,
      message,
      shipParameter,
      operator,
      parameterValue,
      whatsapp,
      email,
    };

    // Compare with last alert
    if (JSON.stringify(lastAlert) === JSON.stringify(alertData)) {
      return Swal.fire('Info', 'No changes detected. Alert not sent.', 'info');
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to save this alert?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/alert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(alertData),
        });

        console.log(alertData);
        if (!response.ok) {
          throw new Error('Failed to save alert');
        }

        // Save the alert as the last sent alert
        setLastAlert(alertData);

        Swal.fire('Saved!', 'Your alert has been saved.', 'success');
        // Optionally reset the form here
        setFromDate('');
        setToDate('');
        setMessage('');
        setShipParameter('');
        setOperator('');
        setParameterValue('');
        setWhatsApp(false);
        setEmail(false);
      } catch (error) {
        console.error('Error saving alert:', error);
        Swal.fire('Error', 'Failed to save alert. Please try again.', 'error');
      }
    }
  };

  const handleShipParameterChange = (selectedOption) => {
    setShipParameter(selectedOption);
    setOperator('');
    setParameterValue('');
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="alert-form-container">
      <form className="alert-form" onSubmit={handleSubmit}>
        <h2 className="text-center" style={{ color: "#0F67B1" }}>Create Alerts</h2>
        <hr />

        {/* Ship Parameter selection row */}
        <div className="form-row" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <label style={{ flex: 1 }}>
            Ship Parameter:
            <select value={shipParameter} onChange={(e) => handleShipParameterChange(e.target.value)} style={{ width: '100%' }}>
              <option value="">Select Ship Parameter</option>
              <option value="speed">Speed</option>
              <option value="eta">ETA</option>
              <option value="destination">Destination</option>
            </select>
          </label>
        </div>

        {/* Speed parameter input */}
        {shipParameter === 'speed' && (
          <div className="form-row" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <label style={{ flex: 1 }}>
              Operator:
              <select value={operator} onChange={(e) => setOperator(e.target.value)} style={{ width: '100%' }}>
                <option value="">Select Operator</option>
                <option value="=">=</option>
                <option value="<">&lt;</option>
                <option value=">">&gt;</option>
              </select>
            </label>
            <label style={{ flex: 1 }}>
              Speed Value:
              <input
                type="number"
                value={parameterValue}
                onChange={(e) => setParameterValue(e.target.value)}
                placeholder="Enter speed"
                style={{ width: '100%' }}
              />
            </label>
          </div>
        )}

        {/* ETA parameter input */}
        {shipParameter === 'eta' && (
          <div className="form-row" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <label style={{ flex: 1 }}>
              Operator:
              <select value={operator} onChange={(e) => setOperator(e.target.value)} style={{ width: '100%' }}>
                <option value="">Select Operator</option>
                <option value="before">Before</option>
                <option value="after">After</option>
                <option value="range">Range</option>
              </select>
            </label>
            {(operator === 'before' || operator === 'after') && (
              <label style={{ flex: 1 }}>
                ETA Date:
                <input
                  type="date"
                  value={parameterValue}
                  onChange={(e) => setParameterValue(e.target.value)}
                  min={getTodayDate()}
                  style={{ width: '100%' }}
                />
              </label>
            )}
            {operator === 'range' && (
              <div className="date-range" style={{ display: 'flex', gap: '20px', flex: 2 }}>
                <label style={{ flex: 1 }}>
                  From Date:
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    min={getTodayDate()}
                    style={{ width: '100%' }}
                  />
                </label>
                <label style={{ flex: 1 }}>
                  To Date:
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    min={fromDate || getTodayDate()}
                    style={{ width: '100%' }}
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* Destination parameter input */}
        {shipParameter === 'destination' && (
          <div className="form-row" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <label style={{ flex: 1 }}>
              Select Destination:
              <Select
                options={destinationOptions}
                value={destinationOptions.find(d => d.value === parameterValue)}
                onChange={(selectedOption) => setParameterValue(selectedOption.value)}
                style={{ width: '100%' }}
              />
            </label>
          </div>
        )}

        <div className="message-input">
          <label>
            Message:
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
            />
          </label>
        </div>

        <div className="checkbox-group">

        <label className="checkbox-wrapper-46">
              <input
                type="checkbox"
                className="inp-cbx"
                checked={email}
                onChange={(e) => setEmail(e.target.checked)}
              />
              <div className="cbx">
                <span className="cbx-span"></span>&nbsp;&nbsp;
                <span>Email</span>
              </div>
            </label>
            <label className="checkbox-wrapper-46">
              <input
                type="checkbox"
                className="inp-cbx"
                checked={whatsapp}
                onChange={(e) => setWhatsApp(e.target.checked)}
              />
              <div className="cbx">
                <span className="cbx-span"></span>&nbsp;&nbsp;
                <span>WhatsApp</span>
              </div>
            </label>

           
          </div>

          <div className="button-group">
          <button type="submit">Save Alert</button>
        </div>
      </form>
    </div>
  );
};

AlertForm.propTypes = {
  vessels: PropTypes.array.isRequired,
};

export default AlertForm;

