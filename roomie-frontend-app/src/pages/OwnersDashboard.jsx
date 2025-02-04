import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';  // For navigation to property details
import { Card, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';  // Use React-Bootstrap for styling

const OwnersDashboard = () => {
  const [properties, setProperties] = useState([]);  // To hold the list of properties
  const [loading, setLoading] = useState(true);  // Loading state
  const [error, setError] = useState(null);  // Error state

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("access_token");  // Get the token for authentication
        if (!token) {
          setError("No authentication token found");
          return;
        }

        const response = await fetch('http://127.0.0.1:8000/properties/', {  // Fetch the properties of the owner
          headers: {
            Authorization: `Bearer ${token}`,  // Include the token in the headers
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }

        const data = await response.json();
        setProperties(data);  // Set the properties in state
      } catch (err) {
        setError('Failed to fetch properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);  // Empty dependency array ensures this runs only once after the initial render

  if (loading) {
    return <div className="text-center"><Spinner animation="border" variant="primary" /></div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Owner's Dashboard</h2>
      <Row>
        {properties.map((property) => (
          <Col key={property.id} sm={12} md={6} lg={8}>
            <Card className="shadow-lg mb-4 rounded-lg">
              <Card.Body>
                <Card.Title className="text-primary">{property.street}, {property.town}</Card.Title>
                <Card.Text><strong>Rating:</strong> {property.property_rating}</Card.Text>
                <Card.Text><strong>Room Capacity:</strong> {property.room_capacity}</Card.Text>
                <Card.Text><strong>People Capacity:</strong> {property.people_capacity}</Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <Link to={`/property-details/${property.id}`}>
                    <Button variant="primary">Details</Button>
                  </Link>
                  
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default OwnersDashboard;
