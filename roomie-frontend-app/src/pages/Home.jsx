import React from "react";
import PropertyManagement from "../components/PropertyManagement"; // Import the PropertyManagement component

const Home = () => {
  return (
    <div className="home-container">

    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
    <div className="home-header ">
      <div className="header-content">
        <h1 className="header-title">Dive in to Roomie World</h1>
        <p className="header-subtitle">Find your ideal home !</p>
      </div>
    </div>

      {/* Include the PropertyManagement Component */}
      <PropertyManagement />
    </div>
    </div>
  );
};

export default Home;
