import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAuthorization, getNotificationCount, uploadDocument } from "../AuthIntegration";

export default function SubmitPage({ onLogout }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ providerId: "", patientId: "", patientName: "", disease: "", treatment: "" });
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [documentId, setDocumentId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentStatus, setDocumentStatus] = useState("");
  const [documentError, setDocumentError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const loadNotificationCount = async () => {
    try {
      const response = await getNotificationCount();
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error(error);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadNotificationCount();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      await createAuthorization({
        providerId: Number(formData.providerId),
        patientId: formData.patientId,
        patientName: formData.patientName,
        disease: formData.disease,
        treatment: formData.treatment,
        status: "PENDING",
      });
      setStatusMessage("Authorization request submitted.");
      setFormData((prev) => ({
        providerId: prev.providerId,
        patientId: "",
        patientName: "",
        disease: "",
        treatment: "",
      }));
    } catch (error) {
      console.error(error);
      setErrorMessage("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();

    if (!documentId.trim() || !selectedFile) {
      setDocumentError("Please enter a request ID and choose a file.");
      return;
    }

    setIsUploading(true);
    setDocumentStatus("");
    setDocumentError("");

    try {
      await uploadDocument(documentId, selectedFile);
      setDocumentStatus(`Document uploaded for request ${documentId}.`);
      setDocumentId("");
      setSelectedFile(null);
      e.target.reset();
    } catch (error) {
      console.error(error);
      setDocumentError("Document upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="form-card">
      <div className="top-bar">
        <div>
          <h1>Provider Submission</h1>
          <p>Send a new authorization request.</p>
        </div>
        <div className="top-bar-actions">
          <button
            type="button"
            className="notification-btn"
            onClick={() => navigate("/notifications")}
          >
            <span className="bell">🔔</span>
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="providerId">Provider ID</label>
          <input
            id="providerId"
            name="providerId"
            type="number"
            value={formData.providerId}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter provider ID"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="patientId">Patient ID</label>
          <input
            id="patientId"
            name="patientId"
            type="text"
            value={formData.patientId}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter patient ID"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="patientName">Provider Name</label>
          <input
            id="patientName"
            name="patientName"
            type="text"
            value={formData.patientName}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="disease">Disease</label>
          <input
            id="disease"
            name="disease"
            type="text"
            value={formData.disease}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter disease"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="treatment">Treatment</label>
          <input
            id="treatment"
            name="treatment"
            type="text"
            value={formData.treatment}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter treatment details"
            required
          />
        </div>

        {statusMessage && <div className="message success">{statusMessage}</div>}
        {errorMessage && <div className="message error">{errorMessage}</div>}

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      <form className="document-section" onSubmit={handleUploadDocument}>
        <h2>Upload supporting document</h2>
        <p>Use the request ID from the authorization and upload the file for payer access.</p>

        <div className="form-group">
          <label htmlFor="documentId">Request ID</label>
          <input
            id="documentId"
            name="documentId"
            type="number"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            className="form-input"
            placeholder="Enter the request ID"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="documentFile">Choose document</label>
          <input
            id="documentFile"
            name="documentFile"
            type="file"
            className="form-input document-input"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            required
          />
        </div>

        {documentStatus && <div className="message success">{documentStatus}</div>}
        {documentError && <div className="message error">{documentError}</div>}

        <button type="submit" className="submit-btn" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload Document"}
        </button>
      </form>
    </div>
  );
}
