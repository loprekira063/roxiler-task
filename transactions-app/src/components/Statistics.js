import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../styles.css'; // Import the CSS file

const Statistics = ({ month }) => {
  const [statistics, setStatistics] = useState({ total_sales: 0, sold_items: 0, not_sold_items: 0 });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/statistics`, { params: { month } });
        setStatistics(response.data);
      } catch (error) {
        console.error("Error fetching statistics data:", error);
      }
    };

    fetchStatistics();
  }, [month]);

  return (
    <div className="container">
      <h3>Statistics for {month}</h3>
      <div className="statistics">
        <p>Total Sales: ${statistics.total_sales}</p>
        <p>Sold Items: {statistics.sold_items}</p>
        <p>Not Sold Items: {statistics.not_sold_items}</p>
      </div>
    </div>
  );
};

export default Statistics;
