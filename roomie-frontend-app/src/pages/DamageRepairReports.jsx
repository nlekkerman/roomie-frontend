import React, { useState, useEffect } from "react";
import { Button, Card, Spinner, Row, Col, Modal } from "react-bootstrap";
import AddDamageRepairReport from "../components/AddDamageRepairReport";

const DamageRepairReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [token, setToken] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem("access_token");
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const fetchReports = async () => {
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
            console.log(data)
            
            setReports(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [token]);

    return (
        <div className="container">
            <h2 className="mb-4 text-center">🛠 Damage Repair Reports</h2>
            <Button onClick={() => setShowForm(true)}>+ Add Report</Button>

            {showForm && (
                <AddDamageRepairReport
                    onClose={() => setShowForm(false)}
                    onReportAdded={(newReport) => setReports([newReport, ...reports])}
                />
            )}
            {loading ? (
                <Spinner animation="border" variant="primary" />
            ) : error ? (
                <p className="text-danger">{error}</p>
            ) : reports.length > 0 ? (
                <Row>
                    {reports.map((report) => (
                        <Col key={report.id} sm={12} md={6} lg={4}>
                            <Card className="shadow-lg mb-4">
                                <Card.Body>
                                    <Card.Title className="fw-bold text-primary">
                                        Repair Request for:
                                    </Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        <strong></strong> {report.property_address}
                                    </Card.Subtitle>
                                    <Card.Text><strong>Description:</strong>{report.description}</Card.Text>
                                    <Card.Text>
                                        <strong>Status:</strong>{" "}
                                        <span className={`badge ${report.status === "pending" ? "bg-warning" : report.status === "in_progress" ? "bg-primary" : "bg-success"}`}>
                                            {report.status}
                                        </span>
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Reported At:</strong> {new Date(report.reported_at).toLocaleString()}
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Resolved At:</strong>{" "}
                                        {report.resolved_at ? new Date(report.resolved_at).toLocaleString() : "Not Resolved Yet"}
                                    </Card.Text>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        <strong>Reported by:</strong> {report.tenant}
                                    </Card.Subtitle>
                                    {/* Images Section */}
                                    {report.repair_images && report.repair_images.length > 0 ? (
                                        <div>
                                            <h6 className="mt-3">🖼 Repair Images:</h6>
                                            <Row>
                                                {report.repair_images.map((image, index) => (
                                                    <Col key={index} xs={4} className="mb-2">
                                                        <img
                                                            src={image.image}
                                                            alt={`Repair Image ${index + 1}`}
                                                            className="img-fluid rounded shadow-sm"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => setSelectedImage(image.image)}
                                                        />
                                                    </Col>
                                                ))}
                                            </Row>
                                        </div>
                                    ) : (
                                        <p className="text-muted">No images available.</p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <p>No damage repair reports found.</p>
            )}

            {/* Image Modal */}
            <Modal show={!!selectedImage} onHide={() => setSelectedImage(null)} centered>
                <Modal.Body className="text-center">
                    {selectedImage && <img src={selectedImage} alt="Full Image" className="img-fluid rounded" />}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedImage(null)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default DamageRepairReports;
