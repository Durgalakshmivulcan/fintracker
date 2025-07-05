import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import $ from 'jquery';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-fixedheader-dt/css/fixedHeader.dataTables.css';
import 'datatables.net';
import 'datatables.net-fixedheader';
import Navbar from './Navbar';

const UserPage = () => {
  const initialData = {
    entryname: '',
    date: '',
    powerbill: '',
    waterbill: '',
    emis: '',
    houserent: '',
    subscriptions: '',
    internetbill: '',
    study: '',
    entertainment: '',
    fooddrink: '',
    dwakra: '',
    groceries: '',
    health: '',
    shopping: '',
    transport: '',
    gifts: '',
    others: '',
    income: '',
  };

  const [data, setData] = useState([]);
  const [formData, setFormData] = useState(initialData);
  const [totalExpenditure, setTotalExpenditure] = useState(0);
  const [grossSavings, setGrossSavings] = useState(0);
  const [names, setNames] = useState([]);
  const [editId, setEditId] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const expenseFields = useMemo(() => [
  'powerbill', 'waterbill', 'emis', 'houserent', 'subscriptions',
  'internetbill', 'study', 'entertainment', 'fooddrink', 'dwakra',
  'groceries', 'health', 'shopping', 'transport', 'gifts', 'others',
], []);


  useEffect(() => {
    fetchEntryOptions();
    fetchData();
  }, []);

  const fetchEntryOptions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/get_entrynames');
      if (Array.isArray(res.data)) setNames(res.data);
    } catch (error) {
      console.error('Error fetching entry options:', error);
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/dashboard-data');
      setData(res.data);
    } catch (err) {
      console.error('Data fetch error:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'bills_images' && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    let total = expenseFields.reduce((sum, key) => sum + (parseFloat(formData[key]) || 0), 0);
    setTotalExpenditure(total);
    setGrossSavings((parseFloat(formData.income) || 0) - total);
  }, [formData, expenseFields]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fullForm = new FormData();
      for (const key in formData) {
        const value = formData[key] === '' || formData[key] == null ? 0 : formData[key];
        fullForm.append(key, value);
      }
      fullForm.append('total_expenditure', totalExpenditure || 0);
      fullForm.append('gross_savings', grossSavings || 0);
      if (file) {
        fullForm.append('file', file);
      }

      if (editId) {
        await axios.put(`http://localhost:5000/api/household/update/${editId}`, fullForm, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Expense updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/household', fullForm, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Expense saved successfully!');
      }

      setFormData(initialData);
      setEditId(null);
      setTotalExpenditure(0);
      setGrossSavings(0);
      setFile(null);
      setPreviewUrl(null);
      fetchData();
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to save or update expense.');
    }
  };

  useEffect(() => {
    const existingTable = $.fn.dataTable.isDataTable('#expenseTable');
    if (existingTable) {
      $('#expenseTable').DataTable().clear().destroy();
    }

    $('#expenseTable').DataTable({
      data,
      columns: [
        {
          title: 'Action',
          data: null,
          orderable: false,
          render: function (data) {
            return `
              <a href="javascript:void(0);" class="edit-btn me-2" data-id="${data.day_id}" title="Edit">
                <i class="fa fa-edit text-primary"></i>
              </a>
              <a href="javascript:void(0);" class="delete-btn" data-id="${data.day_id}" title="Delete">
                <i class="fa fa-trash text-danger"></i>
              </a>
            `;
          }
        },
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
  }, [data]);

  useEffect(() => {
    const table = $('#expenseTable').DataTable();
    $('#expenseTable').on('click', '.edit-btn', function () {
      document.querySelector('.household-form-container')?.scrollIntoView({ behavior: 'smooth' });
      const rowData = table.row($(this).closest('tr')).data();
      if (rowData) {
        const updatedFormData = {
          entryname: rowData.entryname || '',
          date: rowData.date || '',
          powerbill: rowData.power_bill || '',
          waterbill: rowData.water_bill || '',
          emis: rowData.EMIs || '',
          houserent: rowData.house_rent || '',
          subscriptions: rowData.subscriptions || '',
          internetbill: rowData.internet_bill || '',
          study: rowData.study_purpose || '',
          entertainment: rowData.entertainment || '',
          fooddrink: rowData.food_and_drink || '',
          dwakra: rowData.dwakra_bill || '',
          groceries: rowData.groceries || '',
          health: rowData.health_or_wellbeing || '',
          shopping: rowData.shopping || '',
          transport: rowData.transport || '',
          gifts: rowData.gifts || '',
          others: rowData.others || '',
          income: rowData.Income || '',
        };
        setFormData(updatedFormData);
        setEditId(rowData.day_id);
      }
    });

    $('#expenseTable').on('click', '.delete-btn', async function () {
      const rowData = table.row($(this).closest('tr')).data();
      if (rowData && rowData.day_id) {
        const confirmDelete = window.confirm('Are you sure you want to delete this entry?');
        if (confirmDelete) {
          try {
            await axios.delete(`http://localhost:5000/api/household/${rowData.day_id}`);
            alert('Deleted successfully');
            setData(prev => prev.filter(entry => entry.day_id !== rowData.day_id));
          } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete entry.');
          }
        }
      }
    });

    return () => {
      $('#expenseTable').off('click', '.edit-btn');
      $('#expenseTable').off('click', '.delete-btn');
    };
  }, [data]);

  return (
    <div className="container-fluid">
      <Navbar />
      <div className="household-form-container rounded shadow mt-1">
        <div className="container-fluid p-4 bg-light rounded shadow mx-3">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <h3 className="text-center mb-4">Household Expense & Savings Tracker Form</h3>

            <div className="row mb-4">
              <div className="col-md-4">
                <label className="form-label fw-bold">Person Name:</label>
                <select
                  className="form-select"
                  name="entryname"
                  value={formData.entryname}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Entry</option>
                  {names.map((n, idx) => (
                    <option key={n.user_id || idx} value={n.name}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Date:</label>
                <input
                  type="date"
                  className="form-control"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              {expenseFields.map((field) => (
                <div className="col-md-3 mb-3" key={field}>
                  <label className="form-label fw-bold text-capitalize">
                    {field.replace(/([A-Z])/g, ' $1')}:
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              ))}
            </div>

            <div className="row mt-4">
              <div className="col-md-3">
                <label className="form-label fw-bold">Total Expenditure:</label>
                <input
                  type="number"
                  className="form-control"
                  value={totalExpenditure.toFixed(2)}
                  readOnly
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Income:</label>
                <input
                  type="number"
                  className="form-control"
                  name="income"
                  value={formData.income}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Gross Savings:</label>
                <input
                  type="number"
                  className="form-control"
                  value={grossSavings.toFixed(2)}
                  readOnly
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Upload Bill Image:</label>
                <input
                  type="file"
                  className="form-control"
                  name="bills_images"
                  onChange={handleChange}
                  accept="image/*"
                />
              </div>
              {previewUrl && (
                <div className="col-md-3 mt-2">
                  <label className="form-label fw-bold">Preview:</label>
                  <img src={previewUrl} alt="Preview" className="img-fluid rounded border" />
                </div>
              )}
            </div>

            <div className="text-center mt-4">
              <button type="submit" className="btn btn-primary">
                {editId ? 'Update Expense' : 'Save Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <h3 className="text-center my-4">Household Expense & Savings Tracker Data</h3>
      <div className="table-responsive">
        <table id="expenseTable" className="table table-striped table-bordered" style={{ fontSize: '13px' }}>
          <thead className="table-success">
            <tr>
              <th>Action</th>
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
        </table>
      </div>
    </div>
  );
};

export default UserPage;
