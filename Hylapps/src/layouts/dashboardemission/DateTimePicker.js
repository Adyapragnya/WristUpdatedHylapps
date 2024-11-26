import React, { useState } from 'react';
import DateTime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import moment from 'moment';
import './DateTimePicker.css'; // Import your CSS file

const DateTimePicker = () => {
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDateTime(date);
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '20px', paddingTop: '10px',paddingBottom:'10px' }}>
      <DateTime
        value={selectedDateTime}
        onChange={handleDateChange}
        inputProps={{ className: 'custom-date-time-input', placeholder: 'Select Date and Time' }}
      />
      {selectedDateTime && (
        <div>
          <p>Selected Date and Time: {moment(selectedDateTime).format('YYYY-MM-DD HH:mm')}</p>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
