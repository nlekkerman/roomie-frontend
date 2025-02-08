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
            console.log('Property created successfully:', response.data);
        } catch (error) {
            console.error('Error creating property:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="street"
                placeholder="Street"
                value={propertyData.street}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="house_number"
                placeholder="House Number"
                value={propertyData.house_number}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="town"
                placeholder="Town"
                value={propertyData.town}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="county"
                placeholder="County"
                value={propertyData.county}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="country"
                placeholder="Country"
                value={propertyData.country}
                onChange={handleChange}
                required
            />
            <input
                type="number"
                name="room_capacity"
                placeholder="Room Capacity"
                value={propertyData.room_capacity}
                onChange={handleChange}
                required
            />
            <input
                type="number"
                name="people_capacity"
                placeholder="People Capacity"
                value={propertyData.people_capacity}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="folio_number"
                placeholder="Folio Number"
                value={propertyData.folio_number}
                onChange={handleChange}
            />
            <input
                type="text"
                name="air_code"
                placeholder="Air Code"
                value={propertyData.air_code}
                onChange={handleChange}
            />
            <textarea
                name="description"
                placeholder="Description"
                value={propertyData.description}
                onChange={handleChange}
            />
            <input
                type="number"
                name="property_rating"
                placeholder="Property Rating"
                value={propertyData.property_rating}
                onChange={handleChange}
            />
            <input
                type="number"
                name="rent_amount"
                placeholder="Rent Amount"
                value={propertyData.rent_amount}
                onChange={handleChange}
            />
            <input
                type="number"
                name="deposit_amount"
                placeholder="Deposit Amount"
                value={propertyData.deposit_amount}
                onChange={handleChange}
            />
            <input
                type="file"
                name="main_image"
                onChange={handleFileChange}
            />
            <button type="submit">Create Property</button>
        </form>
    );
};

export default CreateProperty;
