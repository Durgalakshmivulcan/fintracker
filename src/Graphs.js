import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './Navbar';
import { useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ExpenseGraphDashboard = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear.toString());
  const [entryname, setEntryname] = useState('');
  const [entryOptions, setEntryOptions] = useState([]);
  const [chartData, setChartData] = useState(null);

  const months = useMemo(() => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], []);


  useEffect(() => {
    fetchEntryOptions();
  }, []);

  useEffect(() => {
  if (year) {
    fetchChartData();
  }
}, [year, entryname, fetchChartData]);


  const fetchEntryOptions = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/get_entrynames');

    if (Array.isArray(res.data)) {
      setEntryOptions(res.data); // Expecting: [{ user_id, name }, ...]
    } else {
      console.error("Unexpected response format:", res.data);
    }
  } catch (error) {
    console.error("Error fetching entry options:", error);
  }
};


  

const fetchChartData = useCallback(async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/graph-data', {
      params: { year, entryname }
    });

    const data = response.data;

    setChartData({
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: data.income,
          borderColor: '#198754',
          backgroundColor: '#19875433',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Expenses',
          data: data.expenses,
          borderColor: '#dc3545',
          backgroundColor: '#dc354533',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Savings',
          data: data.savings,
          borderColor: '#0dcaf0',
          backgroundColor: '#0dcaf033',
          fill: true,
          tension: 0.3
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
  }
}, [year, entryname, months]);


  return (
    <div className="container-fluid mt-4">
      <Navbar />

      {/* Filters */}
      <div className="row mb-3 mt-3">
        <div className="col-md-4">
          <label className="form-label text-white fw-bold">Year:</label>
          <select
            className="form-select"
            style={{ fontSize: '11px' }}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">Select Year</option>
            {[0, 1, 2].map((i) => {
              const yearOption = currentYear - i;
              return (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              );
            })}
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label text-white fw-bold">Person Name:</label>
          <select
            className="form-select"
            style={{ fontSize: '11px' }}
            value={entryname}
            onChange={(e) => setEntryname(e.target.value)}
          >
            <option value="">All Persons</option>
            {entryOptions.map((entry, index) => (
              <option key={entry.user_id || index} value={entry.name}>
                {entry.name}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-3 rounded">
        <h4>Monthly Income, Expenses & Savings</h4>
        {chartData ? (
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `₹${value}`
                  }
                }
              }
            }}
          />
        ) : (
          <p className="text-white">Loading chart...</p>
        )}
      </div>
    </div>
  );
};

export default ExpenseGraphDashboard;
