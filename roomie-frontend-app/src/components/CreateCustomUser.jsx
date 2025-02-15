import React, { useState, useEffect } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';  // Import useNavigate from react-router-dom

const CreateCustomUser = () => {
    const [phoneNumber, setPhoneNumber] = useState('');  // State to hold phone number
    const [profileImage, setProfileImage] = useState(null); // State to hold profile image
    const [error, setError] = useState('');  // State for error message
    const [userId, setUserId] = useState(null);  // State to hold the fetched user ID
    const navigate = useNavigate();  // Initialize navigate to handle redirects

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError('No token found. Please log in.');
                return;
            }
    
            try {
                const userResponse = await fetch('http://127.0.0.1:8000/default-user/', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                if (!userResponse.ok) {
                    const errorData = await userResponse.json();
                    throw new Error(errorData.detail || 'Failed to fetch user details');
                }
    
                const userData = await userResponse.json();
                setUserId(userData.id);
            } catch (err) {
                setError(err.message);
            }
        };
    
        fetchUserData();
    }, []);
    
    if (!userId) {
        return <div>Loading...</div>; // Add loading indicator
    }
    
    // Handle image upload change
    const handleImageChange = (e) => {
        setProfileImage(e.target.files[0]);  // Set the selected image
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();  // Prevent default form submission behavior

        if (!userId) {
            setError('User information is missing.');
            return;
        }

        // Get the access token from localStorage (ensure the user is logged in)
        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('No token found. Please log in.');
            return;
        }

        try {
            // Prepare form data to send to the server
            const formData = new FormData();
            formData.append('phone_number', phoneNumber);  // Append phone number to form data
            if (profileImage) {
                formData.append('profile_image', profileImage);  // Append profile image to form data
            }
            formData.append('user', userId);  // Pass the user ID explicitly
            formData.append('user_rating_in_app', 5.0);  // Default rating if not provided by the user

            // Send a POST request to create a new custom user profile
            const response = await fetch('http://127.0.0.1:8000/me/', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,  // Include the token in headers for authorization
                },
                body: formData,  // Send form data with the request
            });

            // Check if the response is successful
            if (!response.ok) {
                const errorData = await response.json();  // Parse the error response
                throw new Error(errorData.detail || 'Failed to create user profile');
            }

            // Redirect to the dashboard after successful profile creation
            navigate('/dashboard');  // Use navigate() to redirect to dashboard

        } catch (err) {
            setError(err.message);  // Set the error message in case of failure
        }
    };

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Complete Your Profile</h2>

            {/* Display any error message */}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* User Profile Creation Form */}
            <Form onSubmit={handleSubmit}>
                {/* Phone number input */}
                <Form.Group className="mb-3" controlId="formPhoneNumber">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter your phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}  // Update phone number state on change
                    />
                </Form.Group>

                {/* Profile Image input */}
                <Form.Group className="mb-3" controlId="formProfileImage">
                    <Form.Label>Profile Image</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}  // Update profile image state on change
                    />
                </Form.Group>

                {/* Submit button */}
                <Button variant="primary" type="submit">
                    Create Profile
                </Button>
            </Form>
        </Container>
    );
};

export default CreateCustomUser;
