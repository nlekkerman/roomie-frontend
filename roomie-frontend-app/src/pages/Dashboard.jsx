import React, { useState, useEffect, useContext } from 'react'; 
import { Container, Card, Button, Image, Row, Alert, Col, Modal } from 'react-bootstrap'; 
import { AuthContext } from '../context/AuthContext'; 

const Dashboard = () => {
    const { auth, refreshToken } = useContext(AuthContext); // Access auth context

    const [userData, setUserData] = useState(null);
    const [tenantRequests, setTenantRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            let token = auth.accessToken;
            console.log("TTTTTTTTTTOKEN", token);
        
            if (!token) {
                setError("No token found. Please log in.");
                setLoading(false);
                return;
            }

            try {
                // Check if token is expired before making the request
                const isExpired = await isTokenExpired(token);
                if (isExpired) {
                    token = await refreshToken();
                    if (!token) {
                        throw new Error("Failed to refresh token. Please log in.");
                    }
                }

                let response = await fetch("http://127.0.0.1:8000/me/", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || "Failed to fetch user data");
                }

                const data = await response.json();
                setUserData(data);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [auth.accessToken]);

    useEffect(() => {
        const fetchTenantRequests = async () => {
            const token = auth.accessToken;
            if (!token) return;

            try {
                const tenantRequestsResponse = await fetch('http://127.0.0.1:8000/tenant-tenancy-requests/', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!tenantRequestsResponse.ok) {
                    const errorData = await tenantRequestsResponse.json();
                    throw new Error(errorData.detail || 'Failed to fetch tenant requests');
                }

                const tenantRequestsData = await tenantRequestsResponse.json();
                setTenantRequests(tenantRequestsData);

            } catch (err) {
                console.error('Error fetching tenant requests:', err.message);
            }
        };

        if (userData && userData.status !== "default_user") {
            fetchTenantRequests();
        }
    }, [userData, auth.accessToken]);

    const handleDeleteRequest = async () => {
        const token = auth.accessToken;
        if (!token) {
            setError('No token found. Please log in.');
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/tenant-tenancy-requests/${requestToDelete.id}/`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to delete request');
            }

            setTenantRequests(prevRequests => prevRequests.filter(request => request.id !== requestToDelete.id));
            setShowModal(false);
            setMessage({ text: "Request canceled successfully!", type: "success" });
            setTimeout(() => setMessage(null), 1000);

        } catch (err) {
            setError(err.message);
        }
    };

    const handleShowModal = (request) => {
        setRequestToDelete(request);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    // Utility function to check if the token is expired
    const isTokenExpired = async (token) => {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) return true; // Invalid token format

        const payload = JSON.parse(atob(tokenParts[1])); // Decode payload
        const exp = payload.exp;
        const currentTime = Math.floor(Date.now() / 1000);

        return exp < currentTime;
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!userData) return <div>No user data available.</div>;

    const { first_name, last_name, email, phone_number, user_rating_in_app, current_address, address_history, profile_image, status } = userData;

    return (
        <Container className="mt-5 dashboard-container">
            {message && <Alert variant={message.type} className="owner-dashboard-alert">{message.text}</Alert>}

            {status === "default_user" ? (
                <div className="text-center dashboard-user-info-container">
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>User Information</Card.Title>
                            <Card.Text><strong>Full Name:</strong> {first_name} {last_name}</Card.Text>
                            <Card.Text><strong>Email:</strong> {email}</Card.Text>
                        </Card.Body>
                    </Card>
                    <Button variant="primary" href="/create-custom-profile">Complete Profile</Button>
                </div>
            ) : (
                <div className="text-center dashboard-user-info-container">
                    <h2 className="text-center mb-4">Dashboard</h2>
                    <div className="mt-4 text-center create-property-dashboard-button-container">
                        <h4>Are you the owner of a property? If so, create a property profile</h4>
                        <Button variant="primary" size="lg" href="/create-property">Create Property</Button>
                    </div>
                    <div className="text-center mb-4 dashboard-image">
                        {profile_image ? (
                            <Image src={profile_image} alt="Profile" roundedCircle style={{ width: '150px', height: '150px', objectFit: 'cover', border: '2px solid #ddd' }} />
                        ) : (
                            <Image src="https://via.placeholder.com/150" alt="Default Profile" roundedCircle style={{ width: '150px', height: '150px', objectFit: 'cover', border: '2px solid #ddd' }} />
                        )}
                    </div>

                    <Card className="mb-4 dashboard-card">
                        <Card.Body>
                            <Card.Title>User Information</Card.Title>
                            <Card.Text><strong>Full Name:</strong> {first_name} {last_name}</Card.Text>
                            <Card.Text><strong>Email:</strong> {email}</Card.Text>
                            <Card.Text><strong>Phone Number:</strong> {phone_number || 'Not provided'}</Card.Text>
                            <Card.Text><strong>User Rating:</strong> {user_rating_in_app || 'No rating yet'}</Card.Text>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4 dashboard-card">
                        <Card.Header>Current Address</Card.Header>
                        <Card.Body>
                            <Card.Text className='bg-warning'>{current_address || "No current address set"}</Card.Text>
                        </Card.Body>
                    </Card>

                    <Row className="mb-4">
                        {tenantRequests.map((request) => (
                            <Col key={request.id} md={6} lg={4} className="tenancy-request-col mb-3">
                                <Card className="tenancy-card shadow-sm">
                                    <Card.Body className="p-4">
                                        <h5 className="mb-3">
                                            Hi <strong className="bg-primary text-white px-2 py-1 rounded">{request.owner_username}</strong>,
                                            you have a request for residency at
                                            <span className="fw-bold text-success"> {request.property_address}</span>.
                                        </h5>
                                        <div className="mb-3">
                                            <p><strong>Status:</strong>
                                                <span className={`badge ${request.status === 'approved' ? 'bg-success' : request.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>
                                                    {request.status}
                                                </span>
                                            </p>
                                            <p><strong>Requested At:</strong> {new Date(request.request_date).toLocaleString()}</p>
                                        </div>
                                        {request.status === "pending" && (
                                            <div className="mt-3 d-flex justify-content-between">
                                                <Button variant="danger" onClick={() => handleShowModal(request)}>
                                                    Delete Request
                                                </Button>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <Modal show={showModal} onHide={handleCloseModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Deletion</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Are you sure you want to delete this request? This action cannot be undone.</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                            <Button variant="danger" onClick={handleDeleteRequest}>Delete</Button>
                        </Modal.Footer>
                    </Modal>

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

                    <Button variant="primary" href="/edit-profile">Edit Profile</Button>
                </div>
            )}
        </Container>
    );
};

export default Dashboard;
