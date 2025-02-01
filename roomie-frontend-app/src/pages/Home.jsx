import React from "react";
import PropertyManagement from "../components/PropertyManagement"; // Import the PropertyManagement component

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to RoomieWorld</h1>
      <p className="text-lg text-gray-700 mb-8">Find the perfect home and roommates.</p>

      {/* Include the PropertyManagement Component */}
      <PropertyManagement />
    </div>
  );
};

export default Home;
