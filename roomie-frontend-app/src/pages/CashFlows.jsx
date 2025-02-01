import React, { useState, useEffect } from 'react';
import { Button, Card, ListGroup, Spinner } from 'react-bootstrap';

const CashFlows = () => {
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const [cashFlows, setCashFlows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFlows, setSelectedFlows] = useState({});  // Track selected cash flows for payment

    useEffect(() => {
        const fetchCashFlows = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError('No token found. Please log in.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `http://127.0.0.1:8000/user-cashflow/?category=${category}&status=${status}`, {
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
                setCashFlows(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCashFlows();
    }, [category, status]); // Refetch whenever category or status changes

    const handleCheckboxChange = (flowId) => {
        setSelectedFlows(prevSelected => ({
            ...prevSelected,
            [flowId]: !prevSelected[flowId]  // Toggle the checkbox state
        }));
    };

    const handleSetPayment = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('No token found. Please log in.');
            return;
        }

        try {
            // Get selected cash flows (those marked with a checkbox)
            const selectedCashFlows = cashFlows.filter(flow => selectedFlows[flow.id]);
            
            for (const flow of selectedCashFlows) {
                const response = await fetch(`http://127.0.0.1:8000/user-cashflow/${flow.id}/mark_to_pay_order/`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to update cash flow payment status');
                }
            }

            // Refresh cash flows after updates
            setSelectedFlows({});
            await fetchCashFlows();  // Re-fetch data to update statuses

        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <Spinner animation="border" variant="primary" />;
    if (error) return <div>Error: {error}</div>;

    return (
        <Card>
            <Card.Header>Payments</Card.Header>
            <Card.Body>
                {/* Filter Buttons inside the CashFlows component */}
                <div className="mb-4">
                    <Button variant="primary" onClick={() => setCategory('rent')}>Filter by Rent</Button>
                    <Button variant="danger" onClick={() => setCategory('electricity')}>Filter by Electricity</Button>
                    <Button variant="secondary" onClick={() => setCategory('garbage')}>Filter by Garbage</Button>
                    <Button variant="success" onClick={() => setCategory('heating')}>Filter by Heating</Button>
                    <Button variant="dark" onClick={() => setCategory('internet')}>Filter by Internet</Button>
                    <Button variant="warning" onClick={() => setStatus('paid')}>Filter by Paid</Button>
                    <Button variant="info" onClick={() => setStatus('pending')}>Filter by Pending</Button>
                </div>

                {/* Display Cash Flows */}
                {cashFlows.length > 0 ? (
                    <ListGroup>
                        {cashFlows.map((flow, index) => (
                            <ListGroup.Item key={index}>
                                <p><strong>Category:</strong> {flow.category}</p>
                                <p><strong>Status:</strong> {flow.status}</p>
                                <p><strong>Amount:</strong> {flow.amount}</p>
                                <p><strong>Date:</strong> {new Date(flow.date).toLocaleDateString()}</p>

                                {/* Checkbox to mark cash flow for payment */}
                                <div>
                                    <input
                                        type="checkbox"
                                        checked={selectedFlows[flow.id] || false}
                                        onChange={() => handleCheckboxChange(flow.id)}
                                    />
                                    <span> Set Payment</span>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <p>No payments found for the selected filters.</p>
                )}

                {/* Set Payment Button */}
                <div className="mt-3">
                    <Button variant="primary" onClick={handleSetPayment}>Set Payment</Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default CashFlows;
