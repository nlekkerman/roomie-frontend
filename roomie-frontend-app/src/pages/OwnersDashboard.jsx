import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import SetPaymentComponent from "../components/SetPaymentComponent";
import { useNavigate } from "react-router-dom";
const OwnersDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRoomImages, setShowRoomImages] = useState({});
  const [editingFields, setEditingFields] = useState({});
  const [editedValues, setEditedValues] = useState({});
  const [imageUploading, setImageUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showImageInput, setShowImageInput] = useState({});
  const [activeRoomImageIndex, setActiveRoomImageIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [repairRequests, setRepairRequests] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [notifications, setNotifications] = useState([]); 
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("No authentication token found");
          return;
        }

        const response = await fetch('http://127.0.0.1:8000/properties/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }

        const data = await response.json();
        setProperties(data);
      } catch (err) {
        setError('Failed to fetch properties');
      } finally {
        setLoading(false);
      }


    };
   
    fetchProperties();
    fetchNotifications();
    // Fetch repair requests after fetching properties
    const fetchRepairRequests = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("http://127.0.0.1:8000/damage-reports/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch damage repair reports");
        }

        const data = await response.json();
        setRepairRequests(data); // Store repair requests in state
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Fetch repair requests
    fetchRepairRequests();

    
  }, []);
 
  const toggleRoomImages = (propertyId) => {
    setShowRoomImages(prevState => ({
      ...prevState,
      [propertyId]: !prevState[propertyId],
    }));
  };
  const fetchNotifications = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No authentication token found");
      return;
    }
  
    try {
      const response = await fetch("http://127.0.0.1:8000/notifications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
  
      const data = await response.json();
      setNotifications(data);
  
      // Show banner only if there are unread notifications
      setHasUnreadNotifications(data.some(notification => !notification.is_read));
    } catch (err) {
      setError("Failed to fetch notifications");
    }
  };
  

  const markNotificationsAsRead = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No authentication token found");
      return;
    }
  
    try {
      await fetch("http://127.0.0.1:8000/notifications/mark_as_read/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
   
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  const handleNotificationClick = () => {
    navigate("/notifications");
    markNotificationsAsRead(); 
  };

  // Check if there are unread notifications
  const hasNotifications = notifications.length > 0;

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status); // Set default status to the current one
    setShowModal(true);
  };
  const updateRepairStatus = async (requestId, newStatus) => {
    try {
      console.log(`🔧 Attempting to update status for Repair Request ID: ${requestId}`);
      console.log(`➡️ New status to update: ${newStatus}`);

      const response = await fetch(`http://127.0.0.1:8000/damage-reports/${requestId}/update-status/`, { // Corrected URL
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Ensure authentication
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log(`📤 Sent PATCH request to: /damage-reports/${requestId}/update-status/`); // Corrected URL
      console.log("⏳ Awaiting response...");

      if (!response.ok) {
        console.error(`❌ Failed to update status. HTTP Status: ${response.status}`);
        throw new Error("Failed to update status");
      }

      const data = await response.json();
      console.log(`✅ Status updated successfully! New status: ${data.new_status}`);

      return data.new_status;
    } catch (error) {
      console.error("❌ Error updating repair status:", error);
    }
  };


  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedRequest) return;
    console.log(`🔧 Handling status update for request ID: ${selectedRequest.id}`);

    try {
      const updatedStatus = await updateRepairStatus(selectedRequest.id, newStatus);

      if (updatedStatus) {
        console.log(`✅ Status updated successfully: ${updatedStatus}`);
        // Update the status in the repairRequests state (this should be the parent state that contains the list of requests)
        setRepairRequests((prevRequests) => {
          return prevRequests.map((request) => {
            // If the request ID matches, update the status, else return the original request
            if (request.id === selectedRequest.id) {
              return { ...request, status: updatedStatus };
            }
            return request;
          });
        });
        setSelectedRequest((prev) => ({ ...prev, status: updatedStatus }));
        setShowModal(false);
      } else {
        console.error('❌ Failed to update status.');
      }
    } catch (error) {
      console.error('❌ Error in handleStatusUpdate:', error);
    }
  };

  const handleRoomImageClick = (propertyId, index, imageUrl) => {
    // Extract Cloudinary public ID from the image URL
    const publicId = imageUrl.split('/').pop().split('.')[0];  // Extracting the public ID from the URL

    setEditingFields((prev) => ({
      ...prev,
      [propertyId]: 'room_images',  // Set it to 'room_images' field to start editing
    }));

    // Set the initial value for the room image when editing starts
    setEditedValues((prev) => ({
      ...prev,
      [propertyId]: {
        ...prev[propertyId],
        room_images: prev[propertyId]?.room_images || [],
        imageUrl: imageUrl,  // Store the clicked image URL
        publicId: publicId,  // Store the Cloudinary public ID
      },
    }));

    setActiveRoomImageIndex(index);
  };


  const handleEditField = (propertyId, field) => {
    setEditingFields((prev) => ({
      ...prev,
      [propertyId]: field,
    }));

    // Set the initial value for the field when editing starts
    setEditedValues((prev) => ({
      ...prev,
      [propertyId]: {
        ...prev[propertyId],
        [field]: properties.find(p => p.id === propertyId)[field],
      },
    }));
  };

  const handleFieldChange = (propertyId, field, value) => {
    setEditedValues((prev) => ({
      ...prev,
      [propertyId]: {
        ...prev[propertyId],
        [field]: value,
      },
    }));
  };

  const handleSaveField = (propertyId, field) => {
    const newValue = editedValues[propertyId][field];

    // Optimistically update the properties state
    setProperties(prevProperties => prevProperties.map(property =>
      property.id === propertyId ? { ...property, [field]: newValue } : property
    ));

    // Make the API call
    const token = localStorage.getItem("access_token");
    fetch(`http://127.0.0.1:8000/properties/${propertyId}/update-text-fields/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [field]: newValue }),

    })
      .then(response => response.json())
      .catch(error => {
        console.error("Error updating property:", error);
        // If failed, you might want to revert the change or notify the user
      });
  };

  const handleImageChange = (propertyId, e) => {
    const updatedProperties = properties.map(property => {
      if (property.id === propertyId) {
        return {
          ...property,
          main_image: URL.createObjectURL(e.target.files[0]),  // Temporary local URL for preview
        };
      }
      return property;
    });
    setProperties(updatedProperties);

    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append('main_image', e.target.files[0]);

    // Start image uploading
    setImageUploading(true);
    setMessage(null); // Clear any previous messages

    fetch(`http://127.0.0.1:8000/properties/${propertyId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })
      .then(response => response.json())
      .then(updatedProperty => {
        console.log("Image updated:", updatedProperty);
        setMessage({ text: "Image updated successfully!", type: "success" });
        setTimeout(() => {
          setMessage(null);
        }, 1000); // 2000 milliseconds = 2 seconds
        setShowImageInput(prev => ({ ...prev, [propertyId]: false })); // Hide image input field
        setImageUploading(false); // Stop uploading state
      })
      .catch(error => {
        console.error("Error updating image:", error);
        setMessage({ text: "Error updating image. Please try again.", type: "danger" }); setImageUploading(false); // Stop uploading state
      });
  };

  const handleRoomImageChange = (propertyId, index, e) => {
    const updatedProperties = properties.map(property => {
      if (property.id === propertyId) {
        const updatedRoomImages = [...property.room_images];

        // Get the Cloudinary public ID for the image that will be replaced
        const existingImage = updatedRoomImages[index];
        const existingImagePublicId = existingImage?.image?.split('/').pop().split('.')[0] || null;  // Extract the public ID from the existing image URL

        // Update the image with the new one (local preview for now)
        updatedRoomImages[index].image = URL.createObjectURL(e.target.files[0]);

        return { ...property, room_images: updatedRoomImages, existingImagePublicId };  // Attach public ID
      }
      return property;
    });

    setProperties(updatedProperties);
    console.log('Selected room image URL:', URL.createObjectURL(e.target.files[0]));

    // Now, send the updated image to the backend
    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append('room_image', e.target.files[0]);

    // Add the existing Cloudinary public ID (if available) to the request
    const existingImagePublicId = updatedProperties.find(property => property.id === propertyId)?.existingImagePublicId;

    if (existingImagePublicId) {
      formData.append('existing_image_public_id', existingImagePublicId);  // Add the public ID to the form data
      console.log("Existing Image Public ID to send to backend: ", existingImagePublicId);
    }

    // Start image uploading
    setImageUploading(true);
    setMessage(null); // Clear any previous messages

    fetch(`http://127.0.0.1:8000/properties/${propertyId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })
      .then(response => response.json())
      .then(updatedProperty => {
        setMessage({ text: "Room image updated successfully!", type: "success" });
        setTimeout(() => {
          setMessage(null);
        }, 1000); // 2000 milliseconds = 2 seconds
        setImageUploading(false); // Stop uploading state
      })
      .catch(error => {
        setMessage({ text: "Error updating room image. Please try again.", type: "danger" });
        setImageUploading(false); // Stop uploading state
      });
  };


  const handleDeleteRoomImage = async (propertyId, cloudinaryImageUrl) => {
    const token = localStorage.getItem("access_token");


    if (!cloudinaryImageUrl) {
      console.error("Invalid Cloudinary URL");
      return;
    }

    const formData = new FormData();
    formData.append("delete_image_public_id", cloudinaryImageUrl);  // Send the Cloudinary public ID for deletion

    try {
      const response = await fetch(`http://127.0.0.1:8000/properties/${propertyId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();
      console.log("Server Response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.detail || "Failed to delete room image");
      }
      // Remove the deleted image from the state
      setProperties(prevProperties =>
        prevProperties.map(property => {
          if (property.id === propertyId) {
            const updatedRoomImages = property.room_images.filter(
              (image) => image.image !== cloudinaryImageUrl  // Remove the deleted image
            );
            return { ...property, room_images: updatedRoomImages };
          }
          return property;
        })
      );
      setShowDeleteModal(false)

      setMessage({ text: "Room image deleted successfully!", type: "success" });
      setTimeout(() => {
        setMessage(null);
      }, 1000); // 2000 milliseconds = 2 seconds

    } catch (error) {
      console.error("Error deleting room image:", error);
      setMessage({ text: "Sorry can't remove image right now!", type: "error" });
      setTimeout(() => {
        setMessage(null);
      }, 3000); // 2000 milliseconds = 2 seconds
    }
  };
  // Function to hide the modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setImageToDelete(null); // Reset the image to delete
    setPropertyIdToDelete(null); // Reset the property ID
  };
  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file); // Set the selected image file
    }
  };
  const handleAddImageClick = async (propertyId, imageFile, description) => {
    console.log("🚀 Upload process started...");

    if (!propertyId) {
      console.error("❌ Property ID is missing!");
      return;
    }

    if (!imageFile) {
      console.error("❌ No image file selected!");
      return;
    }

    if (!description) {
      console.warn("⚠️ No description provided. Defaulting to an empty string.");
    }

    console.log("🔄 Preparing FormData...");
    const formData = new FormData();
    formData.append("property_id", propertyId);
    formData.append("image", imageFile);
    formData.append("description", description || ""); // Ensure description is never undefined

    console.log("📝 FORM DATA ENTRIES:");
    for (let [key, value] of formData.entries()) {
      console.log(`   ${key}:`, value);
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("❌ No access token found in localStorage! User may not be authenticated.");
      return;
    }

    try {
      console.log("🌍 Sending request to backend...");
      const response = await fetch("http://127.0.0.1:8000/upload-room-image/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // No 'Content-Type', as FormData sets it automatically
        },
        body: formData,
      });

      console.log(`📡 Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Image upload failed. Status: ${response.status}, Response: ${errorText}`);
        return;
      }

      const responseData = await response.json();
      console.log("✅ Room image uploaded successfully:", responseData);

      if (!responseData.image_url) {
        console.error("❌ Response does not contain 'image_url'! Backend may not be returning it.");
        return;
      }

      // Update the properties state with the new room image
      setProperties((prevProperties) =>
        prevProperties.map((property) =>
          property.id === propertyId
            ? {
              ...property,
              room_images: [
                ...property.room_images,
                {
                  image: responseData.image_url, // Ensure correct field is used
                  description: description || "",
                },
              ],
            }
            : property
        )
      );

      console.log("✅ State updated with new image.");
      await fetchUpdatedProperty(propertyId);

      // Reset UI
      setIsFormVisible(false);
      setImageFile(null);
      setDescription("");
    } catch (error) {
      console.error("❌ Error uploading image:", error);
    }
  };

  const fetchUpdatedProperty = async (propertyId) => {
    console.log("🔄 Fetching updated property data...");

    try {
      const response = await fetch(`http://127.0.0.1:8000/properties/${propertyId}/`);

      if (!response.ok) {
        console.error("❌ Failed to fetch updated property data.");
        return;
      }

      const updatedProperty = await response.json();
      console.log("✅ Updated property data:", updatedProperty);

      setProperties((prevProperties) =>
        prevProperties.map((property) =>
          property.id === propertyId ? updatedProperty : property
        )
      );
    } catch (error) {
      console.error("❌ Error fetching updated property data:", error);
    }
  };

  const handlePropertyClick = (propertyId) => {
    setSelectedPropertyId(propertyId); // Set the selected property ID
  };

  const handleBackToList = () => {
    setSelectedPropertyId(null); // Reset to show property list
  };
 
  if (loading) {
    return <div className="text-center"><Spinner animation="border" variant="primary" /></div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  
  return (
    <div className="owner-dashboard-container mt-5">
      <h2 className="owner-dashboard-title text-center mb-4">Owner's Dashboard</h2>
     {hasNotifications && (
        <div className="notification-banner" onClick={handleNotificationClick}>
          You have new notifications!
        </div>
      )}
      {message && <Alert variant={message.type} className="owner-dashboard-alert">{message.text}</Alert>}

      {/* Display the list of properties if no property is selected */}
      {selectedPropertyId === null ? (
        <div className="owner-dashboard-properties-summary mb-4">
          <h4>Your Properties</h4>
          <Row className="owner-dashboard-summary-row">
            {properties.map((property) => (
              <Col xs={12} sm={6} md={6} lg={4} key={property.id} className="owner-dashboard-summary-col">
                <Card className="owner-dashboard-summary-card mb-4">
                  <Card.Body className="owner-dashboard-summary-card-body">
                    <div className="owner-dashboard-summary-card-img-container position-relative">
                      <Card.Img
                        variant="top"
                        src={property.main_image || "default_image_url.jpg"}
                        alt="Property Image"
                        className="owner-dashboard-summary-card-img"
                      />
                    </div>
                    <Card.Title className="owner-dashboard-summary-card-title mt-3">
                      {property.house_number} {property.street}, {property.town}, {property.county}, {property.country}
                    </Card.Title>
                    <Button variant="primary" onClick={() => handlePropertyClick(property.id)}>
                      View Details
                    </Button>
                  </Card.Body>
                </Card>
              </Col>

            ))}
          </Row>
        </div>
      ) : (
        // Display the detailed property view for the selected property
        <Row className="owner-dashboard-row">
          {properties
            .filter((property) => property.id === selectedPropertyId)
            .map((property) => (
              <Col key={property.id} sm={12} md={12} lg={12} className="owner-dashboard-col">

                <div className="addTenant">hjasdbaksjdbajhsbd</div>

                <Card className="owner-dashboard-card mb-4">
                  <Card.Body className="owner-dashboard-card-body">
                    {/* Back Button to return to the list of properties */}
                    <Button
                      variant="secondary"
                      onClick={handleBackToList}
                      className="mb-3"
                    >
                      Back to Property List
                    </Button>

                    <div className="owner-dashboard-card-img-container position-relative">
                      <Card.Img
                        variant="top"
                        src={property.main_image || "default_image_url.jpg"}
                        alt="Main Image"
                        className="owner-dashboard-card-img"
                      />
                      <Button
                        variant="link"
                        className="owner-dashboard-edit-btn position-absolute top-0 end-0 m-2 text-white"
                        onClick={() => handleEditField(property.id, 'main_image')}
                      >
                        Edit
                      </Button>
                      {editingFields[property.id] === 'main_image' && (
                        <input
                          type="file"
                          onChange={(e) => handleImageChange(property.id, e)}
                          className="owner-dashboard-file-input position-absolute bottom-0 start-0 m-2"
                        />
                      )}
                    </div>

                    <Card.Title className="owner-dashboard-card-title text-primary mt-3">
                      {property.house_number} {property.street}, {property.town}, {property.county}, {property.country}
                    </Card.Title>

                    {['air_code', 'folio_number', 'description', 'property_rating', 'room_capacity', 'people_capacity', 'deposit_amount', 'rent_amount'].map(field => (
                      <div key={field} className="owner-dashboard-field">
                        <strong>{field.replace('_', ' ').toUpperCase()}:</strong>
                        {editingFields[property.id] === field ? (
                          <div className="owner-dashboard-edit-field">
                            <Form.Control
                              type="text"
                              value={editedValues[property.id]?.[field] || property[field]}
                              onChange={(e) => handleFieldChange(property.id, field, e.target.value)}
                              className="owner-dashboard-form-control"
                            />
                            <Button
                              variant="link"
                              className="owner-dashboard-save-btn"
                              onClick={() => handleSaveField(property.id, field)}
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div className="owner-dashboard-view-field">
                            {property[field]}
                            <Button
                              variant="link"
                              className="owner-dashboard-edit-btn"
                              onClick={() => handleEditField(property.id, field)}
                            >
                              Edit
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Image upload form */}
                    <div className="owner-dashboard-image-upload">
                      <Button
                        variant="primary"
                        className="owner-dashboard-toggle-form-btn position-absolute end-0 m-2"
                        onClick={() => setIsFormVisible(!isFormVisible)}
                      >
                        {isFormVisible ? 'Cancel' : 'Add Image'}
                      </Button>

                      {isFormVisible && (
                        <div className="owner-dashboard-form-container">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="owner-dashboard-file-input"
                          />
                          <input
                            type="text"
                            placeholder="Enter image description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="owner-dashboard-description-input"
                          />
                          <Button
                            variant="success"
                            className="owner-dashboard-upload-btn"
                            onClick={() => handleAddImageClick(property.id, imageFile, description)}
                          >
                            Upload Image
                          </Button>
                        </div>
                      )}

                      {/* Room Images */}
                      {property.room_images.map((roomImage, index) => (
                        <Col key={index} sm={12} md={4} lg={4} className="owner-dashboard-room-image-col">
                          <div className="owner-dashboard-room-image-container position-relative">
                            <Button
                              variant="link"
                              className="owner-dashboard-room-image-edit-btn position-absolute top-0 end-0 m-2 p-0"
                              onClick={() => handleRoomImageClick(property.id, index, roomImage.image)}
                            >
                              Edit
                            </Button>

                            <Card.Img
                              variant="bottom"
                              src={roomImage.image_url}
                              alt={`Room Image ${index + 1}`}
                              className="owner-dashboard-room-image"
                            />
                            {activeRoomImageIndex === index && editingFields[property.id] === 'room_images' && (
                              <>
                                <input
                                  type="file"
                                  onChange={(e) => handleRoomImageChange(property.id, index, e)}
                                  className="owner-dashboard-room-image-input position-absolute bottom-0 start-0 m-2"
                                />
                                <Button
                                  variant="danger"
                                  className="owner-dashboard-delete-btn position-absolute top-0 start-0 m-2"
                                  onClick={() => setShowDeleteModal(true)}
                                >
                                  ❌
                                </Button>
                              </>
                            )}
                            {showDeleteModal && (
                              <div
                                className="d-flex justify-content-center align-items-center"
                                style={{
                                  position: 'fixed',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: 'rgba(0,0,0,0.5)', // Optional: background dim effect
                                  zIndex: 1050, // Optional: Ensure it's on top
                                }}
                              >
                                <Card style={{ width: '18rem' }}>
                                  <Card.Body>
                                    <Card.Title>Confirm Deletion</Card.Title>
                                    <Card.Text>
                                      Are you sure you want to delete this image?
                                    </Card.Text>
                                    <div className="d-flex justify-content-between">
                                      <Button variant="secondary" onClick={handleCloseDeleteModal}>
                                        Cancel
                                      </Button>
                                      <Button variant="danger" onClick={() => handleDeleteRoomImage(property.id, roomImage.image)}>
                                        Confirm Delete
                                      </Button>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </div>
                            )}
                          </div>
                        </Col>
                      ))}
                    </div>

                  </Card.Body>
                </Card>
              </Col>
            ))}
        </Row>

      )}


      <div className="repair-requests-section mt-4">
        <h4>Repair Requests</h4>
        {repairRequests.length > 0 ? (
          <Row>
            {repairRequests.map((request) => (
              <Col key={request.id} md={6} lg={4} className="repair-request-col mb-3">
                <Card className="repair-card" onClick={() => handleRequestClick(request)} style={{ cursor: "pointer" }}>
                  <Card.Body>
                    <h5>Repair Request for Property: {request.property_address}</h5>
                    <p><strong>Description:</strong> {request.description}</p>
                    <p><strong>Status:</strong>
                      {/* Conditional classes for different statuses */}
                      <strong
                        className={`
              ${request.status === "in_progress" ? "bg-warning" : ""}
              ${request.status === "pending" ? "bg-danger" : ""}
              ${request.status === "resolved" ? "bg-success" : ""}
            `}
                      >
                        {request.status === "in_progress" ? "Fixing" :
                          request.status === "pending" ? "Pending" :
                            request.status === "resolved" ? "Resolved" : request.status}
                      </strong>
                    </p>                  <p><strong>Reported At:</strong> {new Date(request.reported_at).toLocaleString()}</p>
                    <p><strong>Reported by:</strong> {request.tenant}</p>
                    {/* Images Section */}
                    {request.repair_images && request.repair_images.length > 0 ? (
                      <div className="repair-images">
                        <h6>🖼 Repair Images:</h6>
                        <div className="image-grid">
                          {request.repair_images.map((image, index) => (
                            <div key={index} className="image-item">
                              <img
                                src={image.image}
                                alt={`Repair Image ${index + 1}`}
                                className="repair-image"
                                onClick={() => setSelectedImage(image.image)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="no-images">No images available.</p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p>No repair requests found.</p>
        )}

        {/* Status Update Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Update Repair Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedRequest && (
              <>
                <p><strong>Property:</strong> {selectedRequest.property_address}</p>
                <p><strong>Description:</strong> {selectedRequest.description}</p>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </Form.Select>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleStatusUpdate}>Update Status</Button>
          </Modal.Footer>
        </Modal>
      </div>
      <div className="div-test"><SetPaymentComponent /></div>

    </div>

  );
};




export default OwnersDashboard;
