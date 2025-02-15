import React, { useState, useEffect } from 'react';
import { Container, Card, Button,Image } from 'react-bootstrap';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [defaultUserData, setDefaultUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch the user data from the /me/ API
        const fetchUserData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError('No token found. Please log in.');
                setLoading(false);
                return;
            }

            try {
                // Fetch data from /me/ to get user info and status
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
                console.log(data);
                setUserData(data);  // Store the user data

                // If user is a default user, fetch default user data from another endpoint
                if (data.status === "default_user") {
                    const defaultUserResponse = await fetch('http://127.0.0.1:8000/default-user/', {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!defaultUserResponse.ok) {
                        const errorData = await defaultUserResponse.json();
                        throw new Error(errorData.detail || 'Failed to fetch default user data');
                    }

                    const defaultData = await defaultUserResponse.json();
                    setDefaultUserData(defaultData); // Store default user data
                }

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

    // Destructure the user data (Django's default user fields)
    const {  first_name,
        last_name,
        email,
        phone_number,
        user_rating_in_app,
        current_address,
        address_history,
        profile_image,
} = userData;

    return (
        <Container className="mt-5 dashboard-container " >
     

            {/* Display for Default User */}
            {status === "default_user" ? (
                <div className="text-center dashboard-user-info-container">
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>User Information</Card.Title>
                            <Card.Text><strong>Full Name:</strong> {defaultUserData.first_name} {defaultUserData.last_name}</Card.Text>
                            <Card.Text><strong>Email:</strong> {defaultUserData.email}</Card.Text>
                        </Card.Body>
                    </Card>
                    <Button variant="primary" href="/create-custom-profile">
                        Complete Profile
                    </Button>
                </div>
            ) : (
                // Display user info for custom users (from /me/ API)
                <div className="text-center dashboard-user-info-container">
            
            <h2 className="text-center mb-4">Dashboard</h2>
            {/* New Section: Property Profile */}
            <div className="mt-4 text-center create-property-dashboard-button-container">
                <h4>Are you the owner of a property? If so, create a property profile</h4>
                <Button variant="primary" size="lg" href="/create-property">Create Property</Button>
            </div>
            {/* Profile Image */}
            <div className="text-center mb-4 dashboard-image">
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
            <Card className="mb-4 dashboard-card">
                <Card.Body>
                    <Card.Title>User Information</Card.Title>
                    <Card.Text><strong>Full Name:</strong> {first_name} {last_name}</Card.Text>
                    <Card.Text><strong>Email:</strong> {email}</Card.Text>
                    <Card.Text><strong>Phone Number:</strong> {phone_number || 'Not provided'}</Card.Text>
                    <Card.Text><strong>User Rating:</strong> {user_rating_in_app || 'No rating yet'}</Card.Text>
                </Card.Body>
            </Card>

            {/* Address Section */}
            <Card className="mb-4 dashboard-card">
                <Card.Header>Current Address</Card.Header>
                <Card.Body>
                    <Card.Text className='text-warning'>{current_address || "No current address set"}</Card.Text>
                </Card.Body>
            </Card>

            {/* Address History */}
            <Card className="mb-4 dashboard-card">
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
       

                    <Button variant="primary" href="/edit-profile">
                        Edit Profile
                    </Button>
                </div>
            )}
        </Container>
    );
};

export default Dashboard;
