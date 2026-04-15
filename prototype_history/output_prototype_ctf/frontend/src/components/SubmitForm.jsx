import React, { useState } from "react";
import axios from "axios";

function SubmitForm({ apiBaseUrl, onSubmitSuccess }) {
  const [teamName, setTeamName] = useState("");
  const [points, setPoints] = useState("");
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetStatus = () => {
    setTimeout(() => setStatus(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const trimmedName = teamName.trim();
    if (!trimmedName) {
      setStatus({ type: "error", message: "Team name cannot be empty." });
      resetStatus();
      return;
    }

    const numericPoints = Number(points);
    if (points === "" || !Number.isFinite(numericPoints)) {
      setStatus({ type: "error", message: "Points must be a valid number." });
      resetStatus();
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await axios.post(`${apiBaseUrl}/api/submit`, {
        teamName: trimmedName,
        points: numericPoints,
      });

      if (response.data.success) {
        setStatus({ type: "success", message: response.data.message });
        setTeamName("");
        setPoints("");
        onSubmitSuccess();
      } else {
        setStatus({
          type: "error",
          message: response.data.message || "Submission failed.",
        });
      }
    } catch (err) {
      const serverMessage =
        err.response?.data?.message || "Server error. Please try again.";
      setStatus({ type: "error", message: serverMessage });
    } finally {
      setIsSubmitting(false);
      resetStatus();
    }
  };

  return (
    <form className="submit-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="teamName">
          Team Name
        </label>
        <input
          id="teamName"
          className="form-input"
          type="text"
          placeholder="e.g. Team Alpha"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          disabled={isSubmitting}
          maxLength={64}
          autoComplete="off"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="points">
          Points
        </label>
        <input
          id="points"
          className="form-input"
          type="number"
          placeholder="e.g. 500"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          disabled={isSubmitting}
          step="1"
        />
      </div>

      <button
        className={`submit-btn ${isSubmitting ? "submitting" : ""}`}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="spinner" /> Submitting...
          </>
        ) : (
          "Submit Score"
        )}
      </button>

      {status && (
        <div className={`form-status form-status--${status.type}`}>
          <span className="status-icon">
            {status.type === "success" ? "✔" : "✖"}
          </span>
          {status.message}
        </div>
      )}
    </form>
  );
}

export default SubmitForm;