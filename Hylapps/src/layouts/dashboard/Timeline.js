import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FaPlay, FaPause, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import axios from 'axios';
import './Timeline.css';

const Timeline = ({ initialEvents, fetchNewEvent, selectedVessel }) => {
  const [events, setEvents] = useState(initialEvents);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  // Fetch and filter vessel history based on the selected vessel
  useEffect(() => {
    if (!selectedVessel) return;

    const fetchVesselHistory = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(`${baseURL}/api/get-vessel-histories`);
        const vesselData = response.data.find(
          (vessel) => vessel.vesselName === selectedVessel.AIS.NAME
        );

        if (vesselData && vesselData.history) {
          // Filter history entries where geofenceFlag is "Inside"
          const filteredHistory = vesselData.history.filter(
            (entry) => entry.geofenceFlag === 'Inside'
          );

          // Use a Set to track unique geofenceName-entryTime combinations
          const uniqueEvents = new Set();
          const formattedHistory = filteredHistory
            .filter((entry) => {
              const uniqueKey = `${entry.geofenceName}-${entry.entryTime}`;
              if (uniqueEvents.has(uniqueKey)) return false;
              uniqueEvents.add(uniqueKey);
              return true;
            })
            .map((entry, index) => ({
              id: entry._id.$oid || index,
              geofenceName: entry.geofenceName,
              entryTime: entry.entryTime,
              exitTime: entry.exitTime,
              timestamp: entry.TIMESTAMP,
            }));

          setEvents(formattedHistory);
        } else {
          setEvents([]); // Clear events if no data matches
        }
      } catch (error) {
        console.error('Error fetching vessel history:', error);
      }
    };

    fetchVesselHistory();
  }, [selectedVessel]);

  const nextEvent = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
  };

  const prevEvent = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length);
  };

  const playSlideshow = () => {
    if (!isPlaying) {
      const id = setInterval(nextEvent, 2000);
      setIntervalId(id);
      setIsPlaying(true);
    }
  };

  const stopSlideshow = () => {
    clearInterval(intervalId);
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => clearInterval(intervalId);
  }, [intervalId]);

  return (
    <div className="timeline" style={{ height: '100px', paddingTop: '5px'}}>
      <div className="timeline-controls" style={{ marginTop: '-50px' }}>
        <button onClick={prevEvent} disabled={isPlaying} title="Previous">
          <FaChevronLeft />
        </button>
        <button onClick={nextEvent} disabled={isPlaying} title="Next">
          <FaChevronRight />
        </button>
        <button onClick={isPlaying ? stopSlideshow : playSlideshow} title={isPlaying ? 'Stop' : 'Play'}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
      </div>
      {events.length > 0 ? (
        events.map((event, index) => (
          <div
            key={event.id}
            className="timeline-item"
            style={{ opacity: currentIndex === index ? 1 : 0.5, marginTop: '-5px' }}
          >
            <div className="timeline-marker" />
            <div className="timeline-content">
              <h3 className="timeline-title">{event.geofenceName || 'Unnamed Geofence'}</h3>
              <span className="timeline-date">Entry Time: {event.entryTime || 'N/A'}</span>
              <span className="timeline-date">Exit Time: {event.exitTime || 'N/A'}</span>
               </div>
          </div>
        ))
      ) : (
        <p>No timeline events for the selected vessel.</p>
      )}
    </div>
  );
};

Timeline.propTypes = {
  selectedVessel: PropTypes.shape({
    AIS: PropTypes.shape({
      NAME: PropTypes.string.isRequired,
    }).isRequired,
  }),
  initialEvents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ).isRequired,
  fetchNewEvent: PropTypes.func.isRequired,
};

export default Timeline;
