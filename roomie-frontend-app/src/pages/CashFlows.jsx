import React, { useState, useEffect } from 'react';
import { Button, Card, ListGroup, Spinner } from 'react-bootstrap';

const CashFlows = () => {
    const [cashFlows, setCashFlows] = useState([]);  // Filtered cash flows to display
    const [allCashFlows, setAllCashFlows] = useState([]);  // All cash flows stored separately
    const [pendingCashFlows, setPendingCashFlows] = useState([]);  // Pending cash flows to display in separate section
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filterCategory, setFilterCategory] = useState('');  // Selected category
    const [filterStatus, setFilterStatus] = useState('');      // Selected status
    const [selectedFlows, setSelectedFlows] = useState({});
    const [showFilters, setShowFilters] = useState(false);  // State to control filter buttons visibility

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
            setPendingCashFlows(data);  // Show only pending on load
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all cash flows
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

    // Handle the toggle of the filter visibility and reset cash flows accordingly
    const toggleFilters = () => {
        setShowFilters(prevState => {
            const newShowFilters = !prevState;
            if (!newShowFilters) {
                setCashFlows(allCashFlows);  // Reset to all cash flows when filters are hidden
            }
            return newShowFilters;
        });
    };
    const handleSetPaymentForFlow = async (flowId) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('No token found. Please log in.');
            return;
        }

        try {
            const flowToPay = pendingCashFlows.find(flow => flow.id === flowId);

            if (!flowToPay) {
                setError('Cash flow not found.');
                return;
            }

            const response = await fetch(
                `http://127.0.0.1:8000/user-cashflow/${flowToPay.id}/mark_to_pay_order/`,
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

            // Optionally update state to reflect changes
            setSelectedFlows(prevSelected => {
                const newSelectedFlows = { ...prevSelected };
                delete newSelectedFlows[flowId]; // Uncheck the box after payment
                return newSelectedFlows;
            });

            window.location.reload();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            {/* Button to toggle the visibility of the Card */}
            <Button
                className="toggle-filters-btn"
                variant="info"
                onClick={toggleFilters}  // Use the new toggle function
            >
                FILTER
            </Button>

            {/* Conditionally render the card and filters only when 'showFilters' is true */}
            {showFilters && (
                <Card className="payments-card">
                    <Card.Header className="payments-card-header">Explore Your Payments</Card.Header>
                    <Card.Body>
                        {/* Filter Buttons */}
                        <div className="payments-filters">
                            <Button className="filter-btn rent" variant="primary" onClick={() => handleFilterCategory('rent')}>Filter by Rent</Button>
                            <Button className="filter-btn electricity" variant="danger" onClick={() => handleFilterCategory('electricity')}>Filter by Electricity</Button>
                            <Button className="filter-btn garbage" variant="secondary" onClick={() => handleFilterCategory('garbage')}>Filter by Garbage</Button>
                            <Button className="filter-btn heating" variant="success" onClick={() => handleFilterCategory('heating')}>Filter by Heating</Button>
                            <Button className="filter-btn internet" variant="dark" onClick={() => handleFilterCategory('internet')}>Filter by Internet</Button>
                            <Button className="filter-btn paid" variant="success" onClick={() => handleFilterStatus('paid')}>Filter by Paid</Button>
                            <Button className="filter-btn pending" variant="info" onClick={() => handleFilterStatus('pending')}>Filter by Pending</Button>
                            <Button className="filter-btn all-payments" variant="warning" onClick={fetchAllCashFlows}>(All Payments)</Button>
                        </div>

                        {/* Display Cash Flows */}
                        {loading ? (
                            <Spinner className="payments-spinner" animation="border" variant="primary" />
                        ) : error ? (
                            <p className="payments-error text-danger">{error}</p>
                        ) : (
                            <>
                                {/* Only show this message when the filters are active and no cash flows are found */}
                                {showFilters && cashFlows.length === 0 && (
                                    <p className="no-payments-message">No cash flows found with the applied filters.</p>
                                )}

                                {/* Display the cash flow items */}
                                {cashFlows.length > 0 && (
                                    <ListGroup className="payments-list">
                                        {cashFlows.map((flow, index) => (
                                            <ListGroup.Item className="payments-list-item" key={index}>
                                                <div className="payment-details">
                                                    <p className="payment-category"><strong>Category:</strong> {flow.category}</p>
                                                    <p className="payment-status"><strong>Status:</strong> {flow.status}</p>
                                                    <p className="payment-amount"><strong>Amount:</strong> {flow.amount}</p>
                                                    <p className="payment-date"><strong>Date:</strong> {new Date(flow.date).toLocaleDateString()}</p>
                                                </div>
                                                {flow.status === 'paid' ? (
                                                    <p className="payment-status-paid text-success fw-bold fs-3">PAID</p>
                                                ) : (
                                                    <div className="payment-actions">
                                                        <label className="payment-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedFlows[flow.id] || false}
                                                                onChange={() => handleCheckboxChange(flow.id)}
                                                            />
                                                            <span> Set Payment</span>
                                                        </label>
                                                        <div className="payment-button-container mt-3">
                                                            <Button className="set-payment-button" variant="primary" onClick={handleSetPayment}>Set Payment</Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </>
                        )}

                    </Card.Body>
                </Card>
            )}

            <div className="pending-payments-container">
                {loading ? (
                    <Spinner animation="border" variant="primary" />
                ) : error ? (
                    <p className="text-danger">{error}</p>
                ) : (
                    <div>
                        {/* Check if there are pending payments */}
                        {pendingCashFlows.length > 0 ? (
                            <div className="pending-payments">
                                <h4>Pending Payments</h4>
                                <div className="pending-payments-list">
                                    {pendingCashFlows.map((flow) => (
                                        <div key={flow.id} className="pending-payment-item">
                                            <div className="payment-details">
                                                <p><strong>Category:</strong> {flow.category}</p>
                                                <p><strong>Status:</strong> {flow.status}</p>
                                                <p><strong>Amount:</strong> {flow.amount}</p>
                                                <p><strong>Date:</strong> {new Date(flow.date).toLocaleDateString()}</p>
                                            </div>

                                            <div className="payment-actions">
                                                <div className="payment-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        id={`payment-checkbox-${flow.id}`}
                                                        checked={selectedFlows[flow.id] || false}
                                                        onChange={() => handleCheckboxChange(flow.id)}
                                                    />
                                                    <label htmlFor={`payment-checkbox-${flow.id}`}>Pay Now</label>
                                                </div>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => handleSetPaymentForFlow(flow.id)}
                                                    disabled={!selectedFlows[flow.id]}
                                                >
                                                    Set Payment
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Display this message when no pending payments
                            <p className="no-pending-payments-message">No pending payments at the moment.</p>
                        )}
                    </div>
                )}
            </div>



        </div>
    );

};

export default CashFlows;
