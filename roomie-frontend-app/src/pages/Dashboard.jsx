import React, { useState, useEffect } from 'react';
import { Container, Card } from 'react-bootstrap';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('access_token');
            console.log('Token from localStorage:', token);

            if (!token) {
                setError('No token found. Please log in.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:8000/me/', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to fetch user data');
                }

                const data = await response.json();
                setUserData(data);
            } catch (err) {
                console.error('API Error:', err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Handle loading and error states
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    // Ensure the user data is available before trying to display it
    if (!userData) {
        return <div>No user data available.</div>;
    }

    // Destructure the user data for easier access
    const {
        user,
        user_rating_in_app,
        phone_number,
        address,
        first_name,
        last_name,
        email,
        has_address,
        address_history,
    } = userData;

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Dashboard</h2>

            {/* User Info Card */}
            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>User Information</Card.Title>
                    <Card.Text>
                        <strong>Full Name:</strong> {first_name} {last_name}
                    </Card.Text>
                    <Card.Text>
                        <strong>Email:</strong> {email}
                    </Card.Text>
                    <Card.Text>
                        <strong>Phone Number:</strong> {phone_number || 'Not provided'}
                    </Card.Text>
                    <Card.Text>
                        <strong>User Rating:</strong> {user_rating_in_app || 'No rating yet'}
                    </Card.Text>
                </Card.Body>
            </Card>

            {/* Display the current address */}
            <Card className="mb-4">
                <Card.Header>Current Address</Card.Header>
                <Card.Body>
                    <Card.Text>
                        {userData?.current_address || "No current address set"}
                    </Card.Text>
                </Card.Body>
            </Card>

            {/* Display the address history */}
            <Card>
                <Card.Header>Address History</Card.Header>
                <Card.Body>
                    {userData?.address_history?.length > 0 ? (
                        <ul>
                            {userData.address_history.map((history, index) => (
                                <li key={index}>
                                    <p><strong>Address:</strong> {history.address || "No Address"}</p>
                                    <p><strong>Start Date:</strong> {new Date(history.start_date).toLocaleDateString()}</p>
                                    <p><strong>End Date:</strong> {history.end_date ? new Date(history.end_date).toLocaleDateString() : "Present"}</p>
                                    <hr />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No address history available.</p>
                    )}
                </Card.Body>
            </Card>

        </Container>
    );
};

export default Dashboard;
