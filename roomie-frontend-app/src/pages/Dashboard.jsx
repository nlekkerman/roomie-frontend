import React, { useState, useEffect } from 'react';
import { Container, Card, Image } from 'react-bootstrap';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('access_token');

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
                console.log(data)
                setUserData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!userData) return <div>No user data available.</div>;

    const {
        first_name,
        last_name,
        email,
        phone_number,
        user_rating_in_app,
        address,
        address_history,
        profile_image,
    } = userData;

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Dashboard</h2>

            {/* Profile Image */}
            <div className="text-center mb-4">
                {profile_image ? (
                    <Image
                        src={profile_image}
                        alt="Profile"
                        roundedCircle
                        style={{ width: '150px', height: '150px', objectFit: 'cover', border: '2px solid #ddd' }}
                    />
                ) : (
                    <Image
                        src="https://via.placeholder.com/150"
                        alt="Default Profile"
                        roundedCircle
                        style={{ width: '150px', height: '150px', objectFit: 'cover', border: '2px solid #ddd' }}
                    />
                )}
            </div>

            {/* User Info Card */}
            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>User Information</Card.Title>
                    <Card.Text><strong>Full Name:</strong> {first_name} {last_name}</Card.Text>
                    <Card.Text><strong>Email:</strong> {email}</Card.Text>
                    <Card.Text><strong>Phone Number:</strong> {phone_number || 'Not provided'}</Card.Text>
                    <Card.Text><strong>User Rating:</strong> {user_rating_in_app || 'No rating yet'}</Card.Text>
                </Card.Body>
            </Card>

            {/* Address Section */}
            <Card className="mb-4">
                <Card.Header>Current Address</Card.Header>
                <Card.Body>
                    <Card.Text>{address || "No current address set"}</Card.Text>
                </Card.Body>
            </Card>

            {/* Address History */}
            <Card>
                <Card.Header>Address History</Card.Header>
                <Card.Body>
                    {address_history?.length > 0 ? (
                        <ul>
                            {address_history.map((history, index) => (
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
