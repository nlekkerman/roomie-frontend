import React from "react";
import HomePropertyComponent from "../components/HomePropertyComponent"; // Import the PropertyManagement component
import { AuthContext } from '../context/AuthContext'; 
const Home = () => {

  
  console.log(localStorage.getItem("access_token"))
  return (
    <div className="home-container">

    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
    <div className="home-header ">
      <div className="header-content">
        <h1 className="header-title">Dive in to The Roomie World</h1>
        <p className="header-subtitle">Find your ideal home !</p>
      </div>
    </div>

      {/* Include the PropertyManagement Component */}
      <HomePropertyComponent />
    </div>
    </div>
  );
};

export default Home;
