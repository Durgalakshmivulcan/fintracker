import React from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faFileInvoiceDollar,
  faCoins,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const location = useLocation();
  const username = 'Durga Lakshmi';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark rounded shadow mx-1" style={{ backgroundColor: "#0c0e3f" }}>
      <div className="container-fluid">
        <a className="navbar-brand d-flex align-items-center" href="#">
          <img src="/images/moneyicon1.jpg" alt="moneyicon1" width="30" height="30" className="d-inline-block align-text-top me-2" />
          Household Expense & Savings Tracker
        </a>

        <div className="collapse navbar-collapse justify-content-center">
          <ul className="navbar-nav">
            <li className="nav-item me-3">
              <a className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} href="/dashboard">
                <FontAwesomeIcon icon={faChartLine} /> Dashboard
              </a>
            </li>
            <li className="nav-item me-3">
              <a className={`nav-link ${location.pathname === '/UserPage' ? 'active' : ''}`} href="/UserPage">
                <FontAwesomeIcon icon={faFileInvoiceDollar} /> Form
              </a>
            </li>
            <li className="nav-item">
              <a className={`nav-link ${location.pathname === '/Graphs' ? 'active' : ''}`} href="/Graphs">
                <FontAwesomeIcon icon={faCoins} /> Graph
              </a>
            </li>
          </ul>
        </div>
        <div className="d-flex align-items-center text-white fw-bold" >
          <FontAwesomeIcon icon={faUserCircle} className="me-2" />
          {username}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
