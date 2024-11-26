
import { Button } from 'reactstrap';
import { Padding } from '@mui/icons-material';

export default function AlertEvents() {
  const data = [
    { date: '2024-08-01', event: 'Event 1' },
    { date: '2024-08-02', event: 'Event 2' },
    { date: '2024-08-03', event: 'Event 3' },
    // Add more data as needed
  ];

  return (
    <div className="alert-timeline">
      <table className="alert-timeline-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Event</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.event}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className='btn-primary' style={{Padding:'5px',color:'blue'}}>Custom Alerts</button>
    </div>
  );
}


