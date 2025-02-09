import React, { useState, useEffect } from 'react';
import '../styles/PagesStyles.css';

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [ownerUsername, setOwnerUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // Modal visibility state

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

  const handleSelectProperty = (propertyId) => {
    setSelectedProperty(null); // Reset selected property if already selected
    setLoading(true);

    fetch(`http://127.0.0.1:8000/properties/${propertyId}/`)
      .then((response) => response.json())
      .then((data) => {
        setSelectedProperty(data);
        setLoading(false);
        setShowModal(true); // Open the modal when property is selected
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    const fetchOwnerUsername = () => {
      if (selectedProperty && selectedProperty.owner_username) {
        setOwnerUsername(selectedProperty.owner_username);
      }
    };

    fetchOwnerUsername();
  }, [selectedProperty]);

  if (loading && !selectedProperty) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger text-center">Error: {error.message}</div>;

  const closeModal = () => {
    setShowModal(false); // Close modal
  };

  return (
    <div className="property-container">
      <h1 className="heading">Properties</h1>

      <div className="property-content">
        {/* Left Column: List of Properties */}
        <div className="property-list-container">
          <ul className="property-list">
            {properties.map((property) => (
              <li
                key={property.id}
                className="property-list-item"
                onClick={() => handleSelectProperty(property.id)}
              >
                <div className="property-address">
                  <div>{property.street}, {property.town}, {property.county}, {property.country}</div>
                </div>

                <div className="property-card">
                  <div className="property-image-container">
                    {property.main_image ? (
                      <img
                        src={property.main_image}
                        alt="Property Thumbnail"
                        className="property-image-img"
                      />
                    ) : (
                      <div className="property-image-placeholder">A</div>
                    )}
                  </div>
                </div>

                <div className="property-rating">
                  <strong>Rating:</strong> {property.property_rating}
                </div>

                <div className="property-room-capacity">
                  <strong>Capacity:</strong> {property.room_capacity}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>X</button>

            <h2>Property Details</h2>
            <div className="property-detail-card">
              <div className="property-detail-body">
                {selectedProperty.main_image ? (
                  <img
                    src={selectedProperty.main_image}
                    alt="Property Main Image"
                    className="property-detail-image"
                  />
                ) : (
                  <div className="property-detail-placeholder" />
                )}

                <h5 className="property-title">
                  {selectedProperty.street}, {selectedProperty.town}, {selectedProperty.air_code}
                </h5>

                <p><strong>Owner:</strong> {ownerUsername || 'Loading...'}</p>
                <p><strong>Description:</strong> {selectedProperty.description || 'No description available'}</p>
                <p><strong>Property Rating:</strong> {selectedProperty.property_rating}</p>
                <p><strong>Room Capacity:</strong> {selectedProperty.room_capacity}</p>
                <p><strong>People Capacity:</strong> {selectedProperty.people_capacity}</p>
                <p><strong>Rent Amount:</strong> ${selectedProperty.rent_amount}</p>
                <p><strong>Deposit Amount:</strong> ${selectedProperty.deposit_amount}</p>
                <p><strong>Property Supervisor:</strong> {selectedProperty.property_supervisor_name || 'N/A'}</p>

                <h5>Current Tenants</h5>
                {selectedProperty.all_current_tenant.length > 0 ? (
                  <ul className="tenant-list">
                    {selectedProperty.all_current_tenant.map((tenantRecord) => (
                      <li key={tenantRecord.id} className="tenant-item">
                        {tenantRecord.tenant}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No current tenants</p>
                )}

                <h5>Tenant History</h5>
                <ul className="tenant-history-list">
                  {selectedProperty.tenant_history &&
                    selectedProperty.tenant_history.map((tenantRecord) => (
                      <li key={tenantRecord.id} className="tenant-history-item">
                        {tenantRecord.tenant} ({tenantRecord.start_date} - {tenantRecord.end_date || 'Present'})
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;
