import React, { useState, useEffect } from "react";

const AddTenantDropdown = () => {
    const [tenants, setTenants] = useState([]);
    const [selectedTenant, setSelectedTenant] = useState("");
    const [error, setError] = useState(null);
    const token = localStorage.getItem("access_token");

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/custom-users/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch tenants");
                }

                const data = await response.json();
                setTenants(data); // Assuming the response is a list of users
            } catch (err) {
                setError(err.message);
                console.error("Error fetching tenants:", err);
            }
        };

        fetchTenants();
    }, [token]);

    const handleAddTenant = () => {
        if (!selectedTenant) {
            alert("Please select a tenant");
            return;
        }
        console.log("Selected Tenant ID:", selectedTenant);
        // Here you can implement adding the tenant to the property or making an API call
    };

    return (
        <div className="addTenant">
            <p>HERE</p>
            {error && <p className="text-danger">{error}</p>}
            <select 
                className="form-control" 
                value={selectedTenant} 
                onChange={(e) => setSelectedTenant(e.target.value)}
            >
                <option value="">Select Tenant</option>
                {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                        {tenant.first_name} {tenant.last_name} ({tenant.email})
                    </option>
                ))}
            </select>
            <button className="btn btn-primary mt-2" onClick={handleAddTenant}>
                Add Tenant
            </button>
        </div>
    );
};

export default AddTenantDropdown;
