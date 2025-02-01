import React, { useState, useEffect } from 'react';

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all properties
  useEffect(() => {
    fetch('http://127.0.0.1:8000/properties/')
      .then((response) => response.json())
      .then((data) => {
        setProperties(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  // Fetch selected property details, including tenants
  const handleSelectProperty = (propertyId) => {
    setSelectedProperty(null); // Reset selected property if already selected
    setLoading(true);
    
    fetch(`http://127.0.0.1:8000/properties/${propertyId}/`)
      .then((response) => response.json())
      .then((data) => {
        setSelectedProperty(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  };

  // Handle loading and errors
  if (loading && !selectedProperty) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger text-center">Error: {error.message}</div>;

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Properties</h1>

      <div className="row">
        {/* Left Column: List of Properties */}
        <div className="col-md-4">
          
          <ul className="list-group">
            {properties.map((property) => (
              <li
                key={property.id}
                className="list-group-item list-group-item-action"
                onClick={() => handleSelectProperty(property.id)}
                style={{ cursor: 'pointer' }}
              >
                {property.street}, {property.town}, {property.county}, {property.country}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Property Details */}
        {selectedProperty && (
          <div className="col-md-8">
            <h2>Property Details</h2>
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">{selectedProperty.street}, {selectedProperty.town}</h5>
                <p className="card-text"><strong>Property Rating:</strong> {selectedProperty.property_rating}</p>
                <p className="card-text"><strong>Room Capacity:</strong> {selectedProperty.room_capacity}</p>
                <p className="card-text"><strong>People Capacity:</strong> {selectedProperty.people_capacity}</p>
                <p className="card-text"><strong>Rent Amount:</strong> ${selectedProperty.rent_amount}</p>
                <p className="card-text"><strong>Owner:</strong> {selectedProperty.owner}</p>
                <p className="card-text"><strong>Property Supervisor:</strong> {selectedProperty.property_supervisor_name || 'N/A'}</p>

                {/* Display All Current Tenants */}
                <h5>Current Tenants</h5>
                {selectedProperty.all_current_tenant.length > 0 ? (
                  <ul className="list-group">
                    {selectedProperty.all_current_tenant.map((tenantRecord) => (
                      <li key={tenantRecord.id} className="list-group-item">
                        {tenantRecord.tenant}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No current tenants</p>
                )}

                {/* Display Tenant History */}
                <h5>Tenant History</h5>
                <ul className="list-group">
                  {selectedProperty.tenant_history && selectedProperty.tenant_history.map((tenantRecord) => (
                    <li key={tenantRecord.id} className="list-group-item">
                      {tenantRecord.tenant} ({tenantRecord.start_date} - {tenantRecord.end_date || 'Present'})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyManagement;
