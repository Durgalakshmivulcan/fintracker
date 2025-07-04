import React, { useEffect, useState } from 'react';
import axios from 'axios';
import $ from 'jquery';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-fixedheader-dt/css/fixedHeader.dataTables.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net';
import 'datatables.net-fixedheader';
import Navbar from './Navbar';

const ExpenseDashboard = () => {
  const [data, setData] = useState([]);
  const [years, setYears] = useState([]);
  const [names, setNames] = useState([]);
  const [filters, setFilters] = useState({ year: '', month: '', name: '' });

  // Fetch entry names
  useEffect(() => {
    fetchEntryOptions();
  }, []);
  // Fetch dashboard data
  useEffect(() => {
    axios.get('http://localhost:5000/api/dashboard-data')
      .then(res => setData(res.data))
      .catch(err => console.error('Data fetch error:', err));

    const currentYear = new Date().getFullYear();
    setYears([currentYear, currentYear + 1, currentYear + 2]);
  }, []);

  const fetchEntryOptions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/get_entrynames');

      if (Array.isArray(res.data)) {
        setNames(res.data);
      } else {
        console.error("Unexpected response format:", res.data);
      }
    } catch (error) {
      console.error("Error fetching entry options:", error);
    }
  };

  // DataTable rendering
  useEffect(() => {
    const filtered = data.filter(row => {
      const { year, month, name } = filters;

      const rowDate = row.date || '';
      const rowYear = rowDate.substring(0, 4);
      const rowMonth = rowDate.substring(5, 7);
      const rowName = row.entryname || '';

      const matchYear = year ? rowYear === year : true;
      const matchMonth = month ? rowMonth === month.padStart(2, '0') : true;
      const matchName = name ? rowName.toLowerCase() === name.toLowerCase() : true;

      return matchYear && matchMonth && matchName;
    });

    const existingTable = $.fn.dataTable.isDataTable('#expenseTable');
    if (existingTable) {
      $('#expenseTable').DataTable().clear().destroy();
    }

    $('#expenseTable').DataTable({
      data: filtered,
      columns: [
        { title: 'Name', data: 'entryname' },
        { title: 'Date', data: 'date' },
        { title: 'Power Bill', data: 'power_bill' },
        { title: 'Water Bill', data: 'water_bill' },
        { title: 'EMIs', data: 'EMIs' },
        { title: 'House Rent', data: 'house_rent' },
        { title: 'DWAKRA Bill', data: 'dwakra_bill' },
        { title: 'Subscriptions', data: 'subscriptions' },
        { title: 'Internet Bill', data: 'internet_bill' },
        { title: 'Study', data: 'study_purpose' },
        { title: 'Entertainment', data: 'entertainment' },
        { title: 'Food & Drink', data: 'food_and_drink' },
        { title: 'Groceries', data: 'groceries' },
        { title: 'Health', data: 'health_or_wellbeing' },
        { title: 'Shopping', data: 'shopping' },
        { title: 'Transport', data: 'transport' },
        { title: 'Gifts', data: 'gifts' },
        { title: 'Others', data: 'others' },
        { title: 'Total Expenditure', data: 'total_expenditure' },
        { title: 'Income', data: 'Income' },
        { title: 'Savings', data: 'gross_savings' },
        {
          title: 'Bills Image',
          data: 'bills_images',
          render: function (data) {
            return data
              ? `<img src="http://localhost:5000${data}" width="60" height="60" />`
              : 'No Image';
          }

        },
      ],
      fixedHeader: true,
      pageLength: 35,
    });
    return () => {
      if ($.fn.dataTable.isDataTable('#expenseTable')) {
        $('#expenseTable').DataTable().destroy();
      }
    };
  }, [data, filters]);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id]: value }));
  };

  function calculateSum() {
    var total = [];
    $('#expenseTable tbody tr:visible').each(function () {
      $(this).find('td').each(function (index) {
        if (index > 1 && index < 51) {
          var value = parseFloat($(this).text()) || 0;
          total[index] = (total[index] || 0) + value;
        }
      });
    });

    $("#sum-power").text((total[2] || 0).toFixed(2));
    $("#sum-water").text((total[3] || 0).toFixed(2));
    $("#sum-emis").text((total[4] || 0).toFixed(2));
    $("#sum-house").text((total[5] || 0).toFixed(2));
    $("#sum-dwakra").text((total[6] || 0).toFixed(2));
    $("#sum-subs").text((total[7] || 0).toFixed(2));
    $("#sum-internet").text((total[8] || 0).toFixed(2));
    $("#sum-study").text((total[9] || 0).toFixed(2));
    $("#sum-entertainment").text((total[10] || 0).toFixed(2));
    $("#sum-food").text((total[11] || 0).toFixed(2));
    $("#sum-groceries").text((total[12] || 0).toFixed(2));
    $("#sum-health").text((total[13] || 0).toFixed(2));
    $("#sum-shopping").text((total[14] || 0).toFixed(2));
    $("#sum-transport").text((total[15] || 0).toFixed(2));
    $("#sum-gifts").text((total[16] || 0).toFixed(2));
    $("#sum-others").text((total[17] || 0).toFixed(2));
    $("#sum-expenditure").text((total[18] || 0).toFixed(2));
    $("#sum-income").text((total[19] || 0).toFixed(2));
    $("#sum-savings").text((total[20] || 0).toFixed(2));
  }

  $("#sumButton").on("click", function () {
      calculateSum();
  });
  return (
    <div className="container-fluid">
      <Navbar />
      <div className="row mt-3">
            <div className="col-lg-9 col-md-9 col-9">
            </div>
            <div className="col-lg-3 col-md-3 col-3" >
                <button id="sumButton" className="btn btn-success mb-3" style={{float:'right',fontSize:'11px',fontWeight:'bold'}}>Calculate Sum</button>
            </div>
        </div>
      <div className="row my-3" style={{ fontSize: '11px' }}>
        <div className="col-md-4">
          <label className="form-label fw-bold text-dark">Year:</label>
          <select id="year" className="form-select" onChange={handleFilterChange}>
            <option value="">Select Year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label fw-bold text-dark">Month:</label>
          <select id="month" className="form-select" onChange={handleFilterChange}>
            <option value="">Select Month</option>
            {[...Array(12)].map((_, i) => {
              const val = (i + 1).toString().padStart(2, '0');
              const label = new Date(0, i).toLocaleString('default', { month: 'long' });
              return <option key={val} value={val}>{label}</option>;
            })}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label fw-bold text-dark">Entry Name:</label>
          <select id="name" className="form-select" onChange={handleFilterChange}>
            <option value="">Select Entry Name</option>
            {names.map((n, idx) => (
              <option key={n.user_id || idx} value={n.name}>
                {n.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="table-responsive">
        <table id="expenseTable" className="table table-striped table-bordered" style={{ fontSize: '10px' }}>
          <thead className="table-success">
            <tr>
              <th>Person Name</th>
              <th>Date</th>
              <th>Power Bill</th>
              <th>Water Bill</th>
              <th>EMIs</th>
              <th>House Rent</th>
              <th>Dwakra Bill</th>
              <th>Subscriptions</th>
              <th>Internet Bill</th>
              <th>Study Purpose</th>
              <th>Entertainment</th>
              <th>Food & Drink</th>
              <th>Groceries</th>
              <th>Health Or Wellbeing</th>
              <th>Shopping</th>
              <th>Transport</th>
              <th>Gifts</th>
              <th>Others</th>
              <th>Total Expenditure</th>
              <th>Income</th>
              <th>Gross Savings</th>
              <th>Bills</th>
            </tr>
          </thead>
          <tfoot className="table-success">
                <tr>
                    <th colSpan="2" className="text-center">Total</th>
                    <th id="sum-power"></th>
                    <th id="sum-water"></th>
                    <th id="sum-emis"></th>
                    <th id="sum-house"></th>
                    <th id="sum-dwakra"></th>
                    <th id="sum-subs"></th>
                    <th id="sum-internet"></th>
                    <th id="sum-study"></th>
                    <th id="sum-entertainment"></th>
                    <th id="sum-food"></th>
                    <th id="sum-groceries"></th>
                    <th id="sum-health"></th>
                    <th id="sum-shopping"></th>
                    <th id="sum-transport"></th>
                    <th id="sum-gifts"></th>
                    <th id="sum-others"></th>
                    <th id="sum-expenditure"></th>
                    <th id="sum-income"></th>
                    <th id="sum-savings"></th>
                    <th></th>
                </tr>
            </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ExpenseDashboard;
