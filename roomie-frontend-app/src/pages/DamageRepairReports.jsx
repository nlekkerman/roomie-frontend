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
        <div className="container">
            <h2 className="title">🛠 Damage Repair Reports</h2>
            <button className="add-report-btn" onClick={() => setShowForm(true)}>+ Add Report</button>

            {showForm && (
                <AddDamageRepairReport
                    onClose={() => setShowForm(false)}
                    onReportAdded={(newReport) => setReports([newReport, ...reports])}
                />
            )}
            {loading ? (
                <div className="spinner">Loading...</div>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : reports.length > 0 ? (
                <div className="reports-grid">
                    {reports.map((report) => (
                        <div key={report.id} className="report-card">
                            <div className="report-card-body">
                                <h3 className="report-title">Repair Request for:</h3>
                                <p className="property-address">{report.property_address}</p>
                                <p><strong>Description:</strong> {report.description}</p>
                                <p><strong>Status:</strong> <span className={`status-badge ${report.status}`}>{report.status}</span></p>
                                <p><strong>Reported At:</strong> {new Date(report.reported_at).toLocaleString()}</p>
                                <p><strong>Resolved At:</strong> {report.resolved_at ? new Date(report.resolved_at).toLocaleString() : "Not Resolved Yet"}</p>
                                <p><strong>Reported by:</strong> {report.tenant}</p>

                                {/* Images Section */}
                                {report.repair_images && report.repair_images.length > 0 ? (
                                    <div className="repair-images">
                                        <h6>🖼 Repair Images:</h6>
                                        <div className="image-grid">
                                            {report.repair_images.map((image, index) => (
                                                <div key={index} className="image-item">
                                                    <img
                                                        src={image.image}
                                                        alt={`Repair Image ${index + 1}`}
                                                        className="repair-image"
                                                        onClick={() => setSelectedImage(image.image)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="no-images">No images available.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No damage repair reports found.</p>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedImage} alt="Full Image" className="modal-image" />
                        <button className="close-modal-btn" onClick={() => setSelectedImage(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DamageRepairReports;
