import React, { useState, useEffect } from 'react';
import '../styles/PagesStyles.css';

const HomePropertyComponent = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [ownerUsername, setOwnerUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
    setSelectedProperty(null);
    setLoading(true);

    fetch(`http://127.0.0.1:8000/properties/${propertyId}/`)
      .then((response) => response.json())
      .then((data) => {
        setSelectedProperty(data);
        setLoading(false);
        setShowModal(true);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedProperty && selectedProperty.owner_username) {
      setOwnerUsername(selectedProperty.owner_username);
    }
  }, [selectedProperty]);

  const sendTenancyRequest = () => {
    if (!selectedProperty) {
      console.warn("No property selected");
      return;
    }
  
    // Get the token from local storage
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('You must be logged in to send a tenancy request.');
      console.warn("No access token found in local storage");
      return;
    }
  
    // Log the selected property and token to confirm
    console.log("Sending tenancy request for property:", selectedProperty);
    console.log("Using token:", token);
  
    fetch('http://127.0.0.1:8000/tenancy-requests/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ property_id: selectedProperty.id }),
    })
      .then(async (response) => {
        console.log("Raw response:", response); // Log the raw response
  
        // Parse the response JSON
        const data = await response.json();
        console.log("Parsed response data:", data); // Log the parsed response
  
        // Check for successful request
        if (response.ok) {
          alert('Tenancy request sent successfully!');
          console.log("Tenancy request sent successfully for property ID:", selectedProperty.id);
        } else {
          // Log error response
          alert('Failed to send tenancy request: ' + (data.error || 'Please try again later.'));
          console.error("Error sending tenancy request:", data.error || 'Unknown error');
        }
      })
      .catch((error) => {
        // Log fetch error
        console.error("Fetch error:", error);
        alert('Failed to send tenancy request. Please try again later.');
      });
  };
  
  
  

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="property-container">
      <h1 className="heading">Properties</h1>
      <div className="property-content">
        <div className="property-list-container">
          <ul className="property-list">
            {properties.map((property) => (
              <li
                key={property.id}
                className="property-list-item"
                onClick={() => handleSelectProperty(property.id)}
              >
                <div className="property-address">
                  {property.street}, {property.town}, {property.county}, {property.country}
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
                <button className="request-button" onClick={sendTenancyRequest}>Request Tenancy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePropertyComponent;
