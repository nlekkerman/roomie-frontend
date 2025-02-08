import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spinner, Alert, Form, Modal } from 'react-bootstrap';

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

  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

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
  }, []);

  const toggleRoomImages = (propertyId) => {
    setShowRoomImages(prevState => ({
      ...prevState,
      [propertyId]: !prevState[propertyId],
    }));
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
        setImageUploading(false); // Stop uploading state
      })
      .catch(error => {
        setMessage({ text: "Error updating room image. Please try again.", type: "danger" });
        setImageUploading(false); // Stop uploading state
      });
  };

  const extractPublicIdFromUrl = (url) => {
    const regex = /https?:\/\/res\.cloudinary\.com\/[a-z0-9]+\/image\/upload\/v\d+\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    if (match) {
      return match[1]; // Return the public ID
    } else {
      console.error("Invalid Cloudinary URL", url); // Log the invalid URL for debugging
      return null; // Return null if regex doesn't match
    }
  };

  const handleDeleteRoomImage = async (propertyId, cloudinaryImageUrl) => {
    const token = localStorage.getItem("access_token");

    // Extract the Cloudinary public ID from the URL
    const cloudinaryPublicId = extractPublicIdFromUrl(cloudinaryImageUrl);
    if (!cloudinaryPublicId) {
      console.error("Invalid Cloudinary URL");
      return;
    }

    const formData = new FormData();
    formData.append("delete_image_public_id", cloudinaryPublicId);  // Send the Cloudinary public ID for deletion

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
    if (!propertyId) {
      console.error("Property ID is missing!");
      return;
    }

    const formData = new FormData();
    formData.append('property', propertyId); // Ensure property ID is added
    formData.append('image', imageFile);
    formData.append('description', description);

    try {
      const response = await fetch('http://127.0.0.1:8000/upload-room-image/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Image upload failed');
      }

      const responseData = await response.json();
      console.log('Room image uploaded successfully:', responseData);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };



  if (loading) {
    return <div className="text-center"><Spinner animation="border" variant="primary" /></div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Owner's Dashboard</h2>

      {message && <Alert variant={message.type}>{message.text}</Alert>} {/* Display success or error message */}

      <Row>
        {properties.map((property) => (
          <Col key={property.id} sm={12} md={12} lg={12}>
            <Card className="shadow-lg mb-4 rounded-lg">
              <Card.Body>
                <div className="position-relative">
                  <Card.Img variant="top" src={property.main_image || "default_image_url.jpg"} alt="Main Image" />
                  <Button
                    variant="link"
                    className="position-absolute top-0 end-0 m-2 text-white"
                    onClick={() => handleEditField(property.id, 'main_image')}
                  >
                    Edit
                  </Button>
                  {editingFields[property.id] === 'main_image' && (
                    <input
                      type="file"
                      onChange={(e) => handleImageChange(property.id, e)}
                      className="position-absolute bottom-0 start-0 m-2"
                    />
                  )}
                </div>

                <Card.Title className="text-primary mt-3">
                  {property.house_number} {property.street}, {property.town}, {property.county}, {property.country}
                </Card.Title>

                {['air_code', 'folio_number', 'description', 'property_rating', 'room_capacity', 'people_capacity', 'deposit_amount', 'rent_amount'].map(field => (
                  <div key={field}>
                    <strong>{field.replace('_', ' ').toUpperCase()}:</strong>
                    {editingFields[property.id] === field ? (
                      <div>
                        <Form.Control
                          type="text"
                          value={editedValues[property.id]?.[field] || property[field]}
                          onChange={(e) => handleFieldChange(property.id, field, e.target.value)}
                        />
                        <Button
                          variant="link"
                          onClick={() => handleSaveField(property.id, field)}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div>
                        {property[field]}
                        <Button
                          variant="link"
                          onClick={() => handleEditField(property.id, field)}

                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                <div className="room_image_container bg-black d-flex gap-3 w-100" >
                  |<Button
                    variant="primary"
                    className="position-absolute end-0 m-2"
                    onClick={() => setIsFormVisible(!isFormVisible)}
                  >
                    {isFormVisible ? 'Cancel' : 'Add Image'}
                  </Button>

                  {isFormVisible && (
                    <div className="form-container bg-light p-3 rounded">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <input
                        type="text"
                        placeholder="Enter image description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <Button
                        variant="success"
                        onClick={() => handleAddImageClick(property.id, imageFile, description)}
                      >
                        Upload Image
                      </Button>
                    </div>
                  )}
                  {property.room_images.map((roomImage, index) => (
                    <Col key={index} sm={12} md={4} lg={4}>



                      <div className="position-relative bg-warning mb-5 p-2">

                        <Card.Img variant="bottom" src={roomImage.image} alt={`Room Image ${index + 1}`} />
                        {activeRoomImageIndex === index && editingFields[property.id] === 'room_images' && (
                          <>
                            <input
                              type="file"
                              onChange={(e) => handleRoomImageChange(property.id, index, e)}
                              className="position-absolute bottom-0 start-0 m-2"
                            />
                            {/* Delete Button */}
                            <Button
                              variant="danger"
                              className="position-absolute bg-white top-0 start-0 m-2"
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

                        {message && (
                          <div
                            className="d-flex justify-content-center align-items-center"
                            style={{
                              position: 'fixed',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              zIndex: 1050,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              padding: '10px',
                            }}
                          >
                            <Alert variant={message.type === 'success' ? 'success' : 'danger'} style={{ width: '300px', textAlign: 'center' }}>
                              {message.text}
                            </Alert>
                          </div>
                        )}

                        <Button
                          variant="link"
                          className="position-absolute top-0 end-0 m-2 p-0 bg-dark text-white"
                          onClick={() => handleRoomImageClick(property.id, index, roomImage.image)} // Triggering the new function
                        >
                          Edit
                        </Button>
                        {/* Conditionally show the file input for the clicked image */}
                        {activeRoomImageIndex === index && editingFields[property.id] === 'room_images' && (
                          <input
                            type="file"
                            onChange={(e) => handleRoomImageChange(property.id, index, e)}  // Handle the image change
                            className="position-absolute bottom-0 start-0 m-2"
                          />
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
    </div>
  );

};

export default OwnersDashboard;
