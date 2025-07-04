import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router,Route, Routes } from 'react-router-dom';
import UserPage from './UserPage';
import Dashboard from './dashboard';
import Graphs from './Graphs';

function App() {
  return (
    
    <Router>
      <Routes>
         <Route path='/Graphs' element={<Graphs />}/>
          <Route path='/UserPage' element={<UserPage />}/>
          <Route path='/dashboard' element={<Dashboard />}/>
      </Routes>
       
    </Router>
   
  );
}

export default App;
