import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import '../styles.css'; // Import the CSS file

const PieChart = ({ month }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchPieChartData = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/piechart`, { params: { month } });
        const categories = response.data.map((category) => category._id);
        const counts = response.data.map((category) => category.count);
        console.log('Pie chart data:', response.data);

        const chartData = {
          labels: categories,
          datasets: [
            {
              label: 'Number of Items',
              data: counts,
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
              ],
            },
          ],
        };

        setChartData(chartData);
      } catch (error) {
        console.error("Error fetching pie chart data:", error);
      }
    };

    fetchPieChartData();
  }, [month]);

  return (
    <div className="chart-container">
      <h2>Pie Chart</h2>
      {chartData ? <Pie data={chartData} /> : <div className="loading">Loading...</div>}
    </div>
  );
};

export default PieChart;
