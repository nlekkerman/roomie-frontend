import React, { useState } from 'react';
import axios from 'axios';

const CreateProperty = () => {
    const [propertyData, setPropertyData] = useState({
        street: '',
        house_number: '',
        town: '',
        county: '',
        country: '',
        room_capacity: '',
        people_capacity: '',
        folio_number: '',
        air_code: '',
        description: '',
        property_rating: 5.0,
        rent_amount: '',
        deposit_amount: 0.00,
        main_image: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPropertyData({
            ...propertyData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'main_image') {
            setPropertyData({
                ...propertyData,
                [name]: files[0] // Assuming only one main image
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        for (let key in propertyData) {
            if (Array.isArray(propertyData[key])) {
                propertyData[key].forEach(file => {
                    formData.append(key, file);
                });
            } else {
                formData.append(key, propertyData[key]);
            }
        }
        // Debug: Print the form data before sending
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        // Get the token from localStorage
        const token = localStorage.getItem('access_token');

        try {
            const response = await axios.post('http://127.0.0.1:8000/properties/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`  // Add the token here
                }
            });
            setMessage({ text: "Property created successfully!", type: "success" });
            setTimeout(() => {
              setMessage(null);
            }, 1000); // 2000 milliseconds = 2 seconds
            console.log('Property created successfully:', response.data);
        } catch (error) {
            console.error('Error creating property:', error);
        }
    };

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4">Create Property</h2>
            <form onSubmit={handleSubmit} className="row g-3">
                {/* Street */}
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        name="street"
                        placeholder="Street"
                        value={propertyData.street}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                {/* House Number */}
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        name="house_number"
                        placeholder="House Number"
                        value={propertyData.house_number}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                {/* Town */}
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        name="town"
                        placeholder="Town"
                        value={propertyData.town}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                {/* County */}
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        name="county"
                        placeholder="County"
                        value={propertyData.county}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                {/* Country */}
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        name="country"
                        placeholder="Country"
                        value={propertyData.country}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                {/* Room Capacity */}
                <div className="col-md-6">
                    <input
                        type="number"
                        className="form-control"
                        name="room_capacity"
                        placeholder="Room Capacity"
                        value={propertyData.room_capacity}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* People Capacity */}
                <div className="col-md-6">
                    <input
                        type="number"
                        className="form-control"
                        name="people_capacity"
                        placeholder="People Capacity"
                        value={propertyData.people_capacity}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                {/* Folio Number */}
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        name="folio_number"
                        placeholder="Folio Number"
                        value={propertyData.folio_number}
                        onChange={handleChange}
                    />
                </div>

                {/* Air Code */}
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        name="air_code"
                        placeholder="Air Code"
                        value={propertyData.air_code}
                        onChange={handleChange}
                    />
                </div>
                
                {/* Description */}
                <div className="col-md-12">
                    <textarea
                        name="description"
                        className="form-control"
                        placeholder="Description"
                        value={propertyData.description}
                        onChange={handleChange}
                    />
                </div>

                {/* Property Rating */}
                <div className="col-md-6">
                    <input
                        type="number"
                        className="form-control"
                        name="property_rating"
                        placeholder="Property Rating"
                        value={propertyData.property_rating}
                        onChange={handleChange}
                    />
                </div>

                {/* Rent Amount */}
                <div className="col-md-6">
                    <input
                        type="number"
                        className="form-control"
                        name="rent_amount"
                        placeholder="Rent Amount"
                        value={propertyData.rent_amount}
                        onChange={handleChange}
                    />
                </div>

                {/* Deposit Amount */}
                <div className="col-md-6">
                    <input
                        type="number"
                        className="form-control"
                        name="deposit_amount"
                        placeholder="Deposit Amount"
                        value={propertyData.deposit_amount}
                        onChange={handleChange}
                    />
                </div>

                {/* Main Image */}
                <div className="col-md-6">
                    <input
                        type="file"
                        className="form-control"
                        name="main_image"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Submit Button */}
                <div className="col-12">
                    <button type="submit" className="btn btn-primary w-100 py-2">Create Property</button>
                </div>
            </form>
        </div>
    );
};

export default CreateProperty;
