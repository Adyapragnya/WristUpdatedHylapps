import React, { useRef } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import html2canvas from 'html2canvas';
import './PieChartComponent.css'; // Import the CSS file

// Custom tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <span>{`${payload[0].name}: ${payload[0].value}`}</span>
      </div>
    );
  }
  return null;
};

// Prop types for the CustomTooltip component
CustomTooltip.propTypes = {
  active: PropTypes.bool,  // Indicates if the tooltip is active
  payload: PropTypes.array, // Data to be displayed in the tooltip
};

const PieChartComponent = ({ data }) => {
  const chartRef = useRef(null); // Create a ref to the chart container
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042','#7C00FE','#FF6600','#219C90','#FDDE55','#06D001','#008DDA','#E72929','#9195F6','#FFEB00','#FF77B7','#10375C','#229799','#2C4E80','#597E52','#674188','#FFC7ED','#050C9C','#640D5F','#874CCC','#C6E7FF','#FFB38E','#133E87','#FF9D3D','#FF4545','#3D0301','#00ADB5','#F9E400','#06D001','#26355D','#FF204E','#FF0080','#FFF455','#B6FFFA','#6528F7','#39B5E0','#A555EC','#0F6292','#A149FA','#542E71','#7868E6','#52734D','#FDB827','#41AEA9','#6F4E37'];
  
  // Function to download the chart as a PNG
  const downloadChart = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current, { useCORS: true }).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'pie_chart_report.png';
        link.click();
      });
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Use flexbox to align button and heading */}
      <div className="header-container">
        <h4 style={{ color: "#344767", margin: 0 }}>Chart Data</h4>
        <button className="pie-chart-button" onClick={downloadChart}>
          <i className="fa fa-download"></i>&nbsp;Download
        </button>
      </div>
  
      {/* Wrap the chart and legends together */}
      <div ref={chartRef} className="chart-container">
        <div className="pie-chart-container">
          <PieChart width={400} height={400}> {/* Increased width and height */}
            <Pie
              data={data}
              cx={200} // Center x-coordinate adjusted
              cy={200} // Center y-coordinate adjusted
              labelLine={false} // Hide label lines
              outerRadius={130} // Increased outer radius
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </div>
  
        {/* Render legends below the chart */}
        {/* <div className="legend-container">
          {data.map((entry, index) => (
            <div key={`legend-${index}`} className="legend-item">
              <div
                className="legend-color-box"
                style={{
                  backgroundColor: COLORS[index % COLORS.length],
                }}
              />
              <span>
                {entry.name} ({entry.value})
              </span>
            </div>
          ))}
        </div> */}
        <h4 style={{color:"#0F67B1"}} >Total Ships in the region</h4>
      </div>
    </div>
  );
};

// Add propTypes for validation
PieChartComponent.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default PieChartComponent;
