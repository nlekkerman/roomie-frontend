import React, { useState, useEffect } from 'react';
import { Button, Card, ListGroup, Spinner } from 'react-bootstrap';

const CashFlows = () => {
    const [cashFlows, setCashFlows] = useState([]);  // Filtered cash flows to display
    const [allCashFlows, setAllCashFlows] = useState([]);  // All cash flows stored separately
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filterCategory, setFilterCategory] = useState('');  // Selected category
    const [filterStatus, setFilterStatus] = useState('');      // Selected status
    const [selectedFlows, setSelectedFlows] = useState({});
    // Fetch all cash flows
    // Fetch ONLY pending cash flows on load
    const fetchPendingCashFlows = async () => {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('No token found. Please log in.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/user-cashflow/filter-by-status/?status=pending', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch pending cash flows');
            }

            const data = await response.json();
            setCashFlows(data);  // Show only pending on load
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const fetchAllCashFlows = async () => {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('No token found. Please log in.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/user-cashflow/', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cash flows');
            }

            const data = await response.json();
            setAllCashFlows(data);  // Store all cash flows
            setCashFlows(data);      // Display all cash flows
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch category-based cash flows
    const fetchCategoryCashFlow = async (category) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('No token found. Please log in.');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const url = `http://127.0.0.1:8000/user-cashflow/filter-by-category/?category=${category}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cash flows');
            }

            const data = await response.json();
            setCashFlows(data);  // Update filtered cash flows
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch status-based cash flows (Paid or Pending)
    const fetchStatusCashFlows = async (status) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('No token found. Please log in.');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const url = `http://127.0.0.1:8000/user-cashflow/filter-by-status/?status=${status}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cash flows');
            }

            const data = await response.json();
            setCashFlows(data);  // Update filtered cash flows
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle filter by status button click (Paid or Pending)
    const handleFilterStatus = (status) => {
        setFilterStatus(status);  // Update status filter
        fetchStatusCashFlows(status);  // Call fetchStatusCashFlows
    };

    // Handle filter by category button click
    const handleFilterCategory = (category) => {
        setFilterCategory(category);  // Update category filter
        fetchCategoryCashFlow(category);  // Call fetchCategoryCashFlow
    };

    // Fetch pending cash flows on mount
    useEffect(() => {
        fetchPendingCashFlows();  // Only pending on first load
    }, []);
    const handleCheckboxChange = (flowId) => {
        setSelectedFlows(prevSelected => ({
            ...prevSelected,
            [flowId]: !prevSelected[flowId], // Toggle checkbox

        }));

    };

    // Set payments for selected cash flows
    const handleSetPayment = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('No token found. Please log in.');
            return;
        }

        try {
            const selectedCashFlows = cashFlows.filter(flow => selectedFlows[flow.id]);

            for (const flow of selectedCashFlows) {
                const response = await fetch(
                    `http://127.0.0.1:8000/user-cashflow/${flow.id}/mark_to_pay_order/`,
                    {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to update cash flow payment status');
                }
            }

            setSelectedFlows({});
            window.location.reload();
        } catch (err) {
            setError(err.message);
        }
    };
    return (
        <Card>
            <Card.Header>Payments</Card.Header>
            <Card.Body>
                {/* Filter Buttons */}
                <div className="mb-4">
                    <Button variant="primary" onClick={() => handleFilterCategory('rent')}>Filter by Rent</Button>
                    <Button variant="danger" onClick={() => handleFilterCategory('electricity')}>Filter by Electricity</Button>
                    <Button variant="secondary" onClick={() => handleFilterCategory('garbage')}>Filter by Garbage</Button>
                    <Button variant="success" onClick={() => handleFilterCategory('heating')}>Filter by Heating</Button>
                    <Button variant="dark" onClick={() => handleFilterCategory('internet')}>Filter by Internet</Button>
                    <Button variant="success" onClick={() => handleFilterStatus('paid')}>Filter by Paid</Button>
                    <Button variant="info" onClick={() => handleFilterStatus('pending')}>Filter by Pending</Button>
                    <Button variant="warning" onClick={fetchAllCashFlows}>(All Payments)</Button>
                </div>

                {/* Display Cash Flows */}
                {loading ? (
                    <Spinner animation="border" variant="primary" />
                ) : error ? (
                    <p className="text-danger">{error}</p>
                ) : cashFlows.length > 0 ? (
                    <ListGroup>
                        {cashFlows.map((flow, index) => (
                            <ListGroup.Item key={index}>
                                <p><strong>Category:</strong> {flow.category}</p>
                                <p><strong>Status:</strong> {flow.status}</p>
                                <p><strong>Amount:</strong> {flow.amount}</p>
                                <p><strong>Date:</strong> {new Date(flow.date).toLocaleDateString()}</p>
                                {flow.status === 'paid' ? (
                                    // Show "PAID" if the status is paid
                                    <p className="text-success fw-bold fs-3">PAID</p>
                                ) : (
                                    // Otherwise, show checkbox and button
                                    <>
                                        <input
                                            type="checkbox"
                                            checked={selectedFlows[flow.id] || false}
                                            onChange={() => handleCheckboxChange(flow.id)}
                                        />
                                        <span> Set Payment</span>
                                        <div className="mt-3">
                                            <Button variant="primary" onClick={handleSetPayment}>Set Payment</Button>
                                        </div>
                                    </>
                                )}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <p>No cash flows found.</p>
                )}
            </Card.Body>
        </Card>
    );
};

export default CashFlows;
