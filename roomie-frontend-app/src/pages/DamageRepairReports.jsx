import React, { useState, useEffect } from "react";
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
        <div className="container mt-4">
            <h2 className="mb-4">🛠 Damage Repair Reports</h2>
            <button className="btn btn-primary mb-3" onClick={() => setShowForm(true)}>+ Add Report</button>

            {showForm && (
                <AddDamageRepairReport
                    onClose={() => setShowForm(false)}
                    onReportAdded={(newReport) => setReports([newReport, ...reports])}
                />
            )}

            {loading ? (
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : error ? (
                <p className="alert alert-danger">{error}</p>
            ) : reports.length > 0 ? (
                <div className="row">
                    {reports.map((report) => (
                        <div key={report.id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">Repair Request for:</h5>
                                    <p className="text-muted">{report.property_address}</p>
                                    <p><strong>Description:</strong> {report.description}</p>
                                    <p>
                                        <strong>Status:</strong>
                                        <span className={`badge ms-2 ${
                                            report.status === "pending" ? "bg-danger" :
                                            report.status === "in_progress" ? "bg-warning" :
                                            report.status === "resolved" ? "bg-success" : "bg-secondary"
                                        }`}>
                                            {report.status === "in_progress" ? "Fixing" : report.status}
                                        </span>
                                    </p>
                                    <p><strong>Reported At:</strong> {new Date(report.reported_at).toLocaleString()}</p>
                                    <p><strong>Resolved At:</strong> {report.resolved_at ? new Date(report.resolved_at).toLocaleString() : "Not Resolved Yet"}</p>
                                    <p><strong>Reported by:</strong> {report.tenant}</p>

                                    {/* Images Section */}
                                    {report.repair_images && report.repair_images.length > 0 ? (
                                        <div>
                                            <h6>🖼 Repair Images:</h6>
                                            <div className="row">
                                                {report.repair_images.map((image, index) => (
                                                    <div key={index} className="col-4 mb-2">
                                                        <img
                                                            src={image.image}
                                                            alt={`Repair Image ${index + 1}`}
                                                            className="img-fluid rounded"
                                                            onClick={() => setSelectedImage(image.image)}
                                                            style={{ cursor: "pointer" }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-muted">No images available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center">No damage repair reports found.</p>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" onClick={() => setSelectedImage(null)}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-body text-center">
                                <img src={selectedImage} alt="Full Image" className="img-fluid" />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setSelectedImage(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DamageRepairReports;
