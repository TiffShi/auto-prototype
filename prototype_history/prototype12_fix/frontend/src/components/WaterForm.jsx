import React, { useState } from 'react';
import axiosClient from '../api/axiosClient.js';

const QUICK_ADD_OPTIONS = [150, 250, 350, 500];

export default function WaterForm({ onEntryAdded }) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submitEntry = async (amountMl) => {
    const parsed = parseFloat(amountMl);

    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (parsed > 5000) {
      setError('Amount cannot exceed 5000ml.');
      return;
    }

    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const response = await axiosClient.post('/water/entries', {
        amount_ml: parsed,
      });
      onEntryAdded(response.data);
      setAmount('');
      setSuccess(`✅ Logged ${parsed}ml successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const message =
        err.response?.data?.detail || 'Failed to log water entry. Please try again.';
      setError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitEntry(amount);
  };

  const handleQuickAdd = (ml) => {
    submitEntry(ml);
  };

  return (
    <div className="water-form">
      {error && (
        <div className="alert alert-error" role="alert">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}

      <div className="quick-add-section">
        <p className="quick-add-label">Quick add:</p>
        <div className="quick-add-buttons">
          {QUICK_ADD_OPTIONS.map((ml) => (
            <button
              key={ml}
              type="button"
              className="btn btn-quick-add"
              onClick={() => handleQuickAdd(ml)}
              disabled={isSubmitting}
            >
              {ml}ml
            </button>
          ))}
        </div>
      </div>

      <div className="form-divider">
        <span>or enter custom amount</span>
      </div>

      <form onSubmit={handleSubmit} className="custom-amount-form">
        <div className="input-group">
          <input
            type="number"
            className="form-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in ml"
            min="1"
            max="5000"
            step="1"
            disabled={isSubmitting}
            aria-label="Water amount in millilitres"
          />
          <span className="input-suffix">ml</span>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || !amount}
        >
          {isSubmitting ? (
            <>
              <span className="btn-spinner btn-spinner-sm"></span>
              Logging...
            </>
          ) : (
            <>
              <span>💧</span>
              Log Water
            </>
          )}
        </button>
      </form>
    </div>
  );
}