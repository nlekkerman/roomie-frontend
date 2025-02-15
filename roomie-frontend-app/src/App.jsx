import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Logout from "./pages/Logout";
import Navbar from "./components/Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import CashFlows from './pages/CashFlows'; 
import DamageRepairReports from './pages/DamageRepairReports';
import AddDamageRepairReport from './components/AddDamageRepairReport';
import OwnersDashboard from './pages/OwnersDashboard';
import CreateProperty from './components/CreateProperty';
import CreateCustomUser from './components/CreateCustomUser';
import TenancyRequestComponent from './components/TenancyRequestComponent';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Redirect from root ("/") to "/home" */}
        <Route path="/" element={<Navigate to="/home" />} />

        {/* Define other routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cashflows" element={<CashFlows />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/damage-repair-reports" element={<DamageRepairReports />} />
        <Route path="/damage-repair-reports/add" element={<AddDamageRepairReport />} />
        <Route path="/owners-dashboard" element={<OwnersDashboard />} /> 
        <Route path="/create-property" element={<CreateProperty />} />
        <Route path="/create-custom-profile" element={<CreateCustomUser />} />
        <Route path="/tenancy-request-component" element={<TenancyRequestComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
