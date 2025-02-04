import React, { useState, useEffect } from "react";

const AddDamageRepairReport = ({ onClose, onReportAdded }) => {
    const [description, setDescription] = useState("");
    const [repairImages, setRepairImages] = useState([]); // To store selected images
    const [error, setError] = useState(null);
    const [property, setProperty] = useState(""); // Property ID
    const [address, setAddress] = useState(""); // Full address
    const [username, setUsername] = useState(""); // Full name of tenant
    const [errorMessage, setErrorMessage] = useState(""); // Error messages
    const token = localStorage.getItem("access_token");

    useEffect(() => {
        const fetchUserProperty = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/me/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                // Check if the response is successful
                if (response.ok) {
                    const data = await response.json(); // Read the response body once here
                    
                    console.log("Fetched User Data:", data);
    
                    if (data) {
                        setUsername(`${data.first_name} ${data.last_name}`); // Set full name
                        setAddress(data.current_address.full_address || "No address found"); // Set address string
                        if (data.current_address.property_id) {
                            setProperty(data.current_address.property_id); // Set property ID from current address
                        } else {
                            setErrorMessage("No property ID associated with the tenant.");
                        }
                    }
                } else {
                    setErrorMessage("Failed to fetch tenant details. Status: " + response.status);
                }
            } catch (err) {
                setErrorMessage("Failed to fetch tenant details.");
                console.error(err); // Log the error for debugging
            }
        };
    
        fetchUserProperty();
    }, [token]); // Ensure token dependency is tracked
    

    const handleImageChange = (e) => {
        setRepairImages(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setError("Authentication required.");
            return;
        }
        if (!property) {
            setErrorMessage("Property is required.");
            return;
        }

        const formData = new FormData();
        formData.append("description", description);
        formData.append("property", property); 

        // Append images to formData
        Array.from(repairImages).forEach((image) => {
            formData.append("repair_images", image); // Assuming the backend expects 'repair_images' as key
        });
        try {
            const response = await fetch("http://127.0.0.1:8000/damage-reports/", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            

            if (!response.ok) {
                throw new Error("Failed to submit report");
            }

            const newReport = await response.json();
            onReportAdded(newReport); // Notify parent to refresh the list
            onClose(); // Close the modal or form
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="form-container">
            <h3>Add Damage Repair Report</h3>
            {error && <p className="text-danger">{error}</p>}
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Tenant Name</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        value={username} 
                        readOnly 
                    />
                </div>

                <div className="form-group">
                    <label>Property Address</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        value={address} 
                        readOnly 
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea 
                        className="form-control"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Upload Images</label>
                    <input
                        type="file"
                        className="form-control"
                        multiple
                        onChange={handleImageChange}
                    />
                </div>

                <button type="submit" className="btn btn-primary">Submit Report</button>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            </form>
        </div>
    );
};

export default AddDamageRepairReport;
