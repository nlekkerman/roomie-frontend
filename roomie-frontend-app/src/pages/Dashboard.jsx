import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Image, Row,Alert, Col, Modal } from 'react-bootstrap';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [defaultUserData, setDefaultUserData] = useState(null);
    const [tenantRequests, setTenantRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState(null);
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

    useEffect(() => {
        const fetchTenantRequests = async () => {
            const token = localStorage.getItem('access_token');
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
                setTenantRequests(tenantRequestsData); // Store tenant-specific tenancy requests
            } catch (err) {
                console.error('Error fetching tenant requests:', err.message);
            }
        };

        // Only fetch tenant requests if the user is a tenant
        if (userData && userData.status !== "default_user") {
            fetchTenantRequests();
        }
    }, [userData]);

    const handleDeleteRequest = async () => {
        const token = localStorage.getItem('access_token');
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

            // Update tenantRequests state to remove the deleted request
            setTenantRequests(prevRequests => prevRequests.filter(request => request.id !== requestToDelete.id));
            setShowModal(false); // Close modal after deletion
            setMessage({ text: "Request canceled successfully!", type: "success" });
            setTimeout(() => {
                setMessage(null);
            }, 1000);

        } catch (err) {
            setError(err.message);
        }
    };

    const handleShowModal = (request) => {
        setRequestToDelete(request); // Set the request to delete
        setShowModal(true); // Show confirmation modal
    };

    const handleCloseModal = () => {
        setShowModal(false); // Close the modal without deleting
    };
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!userData) return <div>No user data available.</div>;

    // Destructure the user data (Django's default user fields)
    const { first_name,
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

{message && <Alert variant={message.type} className="owner-dashboard-alert">{message.text}</Alert>}

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
                            <Card.Text className='bg-warning'>{current_address || "No current address set"}</Card.Text>
                        </Card.Body>
                    </Card>

                    {/* Tenant Requests Section */}
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

                                        <div className="p-3 border rounded bg-light">
                                            <h6 className="text-primary">Tenant Information</h6>
                                            <p><strong>First Name:</strong> {request.tenant_first_name}</p>
                                            <p><strong>Last Name:</strong> {request.tenant_last_name}</p>
                                            <p><strong>Email:</strong> <a href={`mailto:${request.tenant_email}`} className="text-decoration-none">{request.tenant_email}</a></p>
                                            <p><strong>Phone:</strong> <a href={`tel:${request.tenant_phone}`} className="text-decoration-none">{request.tenant_phone || 'N/A'}</a></p>
                                            <p><strong>Roomie World Rating:</strong> <span className="fw-bold text-warning">{request.tenant_rating || 'Not Rated'}</span></p>
                                        </div>

                                        {request.status === "pending" && (
                                            <div className="mt-3 d-flex justify-content-between">
                                                {/* Only one button to delete the request */}
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

                    {/* Confirmation Modal */}
                    <Modal show={showModal} onHide={handleCloseModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Deletion</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Are you sure you want to delete this request? This action cannot be undone.
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleDeleteRequest}>
                                Delete
                            </Button>
                        </Modal.Footer>
                    </Modal>
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
