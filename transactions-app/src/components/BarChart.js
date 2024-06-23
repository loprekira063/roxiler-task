import axios from 'axios';
import { ArcElement, BarElement, CategoryScale, Chart, LinearScale, Title } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import '../styles.css';

Chart.register(ArcElement, CategoryScale, LinearScale, Title, BarElement);

const BarChart = ({ month }) => {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchBarChartData = async () => {
      try {
        const response = await axios.get('http://localhost:5001/barchart', { params: { month } });
        const chartData = {
          labels: Object.keys(response.data),
          datasets: [
            {
              label: 'Number of Items',
              data: Object.values(response.data),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
          ],
        };
        setData(chartData);
      } catch (error) {
        console.error("Error fetching the bar chart data:", error);
      }
    };

    fetchBarChartData();
  }, [month]);

  if (!data || !data.datasets || !data.labels) {
    return <div className="loading">Loading...</div>;
  }
  return <div className="chart-container"><Bar data={data} /></div>;
};

export default BarChart;
