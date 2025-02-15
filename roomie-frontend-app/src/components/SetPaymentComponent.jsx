import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Spinner } from "react-bootstrap";

const SetPaymentComponent = () => {
  const [payments, setPayments] = useState([]); // Ensure it's an array
  const [loading, setLoading] = useState(false);

  // Fetch property payments
  useEffect(() => {
    setLoading(true);
    const url = "http://127.0.0.1:8000/property-payments/";
    console.log("Fetching data from:", url);  // Log the API endpoint

    axios
      .get(url)
      .then((res) => {
        console.log("Response data received:", res.data);  // Log the response data

        // Check if the response is an array, and log accordingly
        if (Array.isArray(res.data)) {
          console.log("Data is an array. Setting payments:", res.data);
          setPayments(res.data);
        } else {
          console.error("Unexpected response format", res.data);
          setPayments([]); // In case of unexpected response format
        }
      })
      .catch((err) => {
        console.error("Error fetching payments:", err);
        toast.error("Failed to load payments");
      })
      .finally(() => setLoading(false));
  }, []);

  // Mark a payment as paid
  const markAsPaid = async (paymentId) => {
    console.log(`Marking payment ${paymentId} as paid`);  // Log the payment being marked as paid
    try {
      await axios.patch(`http://127.0.0.1:8000/property-payments/${paymentId}/mark-as-paid/`);
      toast.success("Payment marked as paid!");
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId ? { ...p, status: "paid" } : p
        )
      );
    } catch (err) {
      console.error("Error marking payment as paid:", err);
      toast.error("Failed to update payment");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Property Payments</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <div className="row">
          {Array.isArray(payments) && payments.length > 0 ? (
            payments.map((payment) => (
              <div key={payment.id} className="col-md-4 mb-4">
                <Card className="shadow-sm">
                  <Card.Body>
                    <Card.Title className="text-uppercase">{payment.category}</Card.Title>
                    <p>
                      <strong>Amount:</strong> ${payment.amount}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`fw-bold ${
                          payment.status === "paid" ? "text-success" : "text-danger"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </p>
                    <p>
                      <strong>Due Date:</strong> {payment.deadline ? payment.deadline : "N/A"}
                    </p>
                    {payment.status !== "paid" && (
                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={() => markAsPaid(payment.id)}
                      >
                        Mark as Paid
                      </Button>
                    )}
                    {/* Log property_billings */}
                    <div className="mt-3">
                      <h5>Billings</h5>
                      {payment.property_billings && payment.property_billings.length > 0 ? (
                        payment.property_billings.map((billing, index) => (
                          <div key={index}>
                            <p><strong>Tenant:</strong> {billing.tenant}</p>
                            <p><strong>Amount:</strong> ${billing.amount}</p>
                            <p><strong>Status:</strong> {billing.status}</p>
                            <p><strong>Deadline:</strong> {billing.deadline}</p>
                            <p><strong>Category:</strong> {billing.category}</p>
                            {/* Log each billing */}
                            {console.log(`Billing ${index}:`, billing)}
                          </div>
                        ))
                      ) : (
                        <p>No billings available for this payment.</p>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))
          ) : (
            <div className="alert alert-info">No property payments available.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SetPaymentComponent;
