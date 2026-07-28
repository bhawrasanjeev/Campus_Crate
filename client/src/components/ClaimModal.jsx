import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, HelpCircle, CheckCircle } from 'lucide-react';
import './ClaimModal.css';

export const ClaimModal = ({ item, onClose }) => {
  const { addClaim, currentUser } = useApp();
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    addClaim({
      itemId: item.id,
      itemTitle: item.title,
      itemImage: item.imageUrl,
      location: item.location,
      claimantName: currentUser?.name || 'Anonymous Student',
      claimantId: currentUser?.studentId || '1124',
      claimantRole: `Student ID: ${currentUser?.studentId || '1124'}`,
      verificationQuestion:
        item.verificationQuestion || 'Verification Detail',
      answer: answer.trim(),
      message: message.trim(),
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="claim-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Claim Item</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <CheckCircle size={56} color="#3bb273" style={{ margin: '0 auto' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
              Claim Submitted!
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              Your response has been sent to the poster and campus security. You will be notified in Messages.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="question-box">
                <div className="question-icon">
                  <HelpCircle size={18} />
                </div>
                <div className="question-content">
                  <span className="question-label">
                    Verification Question from Poster:
                  </span>
                  <span className="question-text">
                    "{item.verificationQuestion || 'Provide a unique detail to prove ownership.'}"
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Your Answer <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter the exact answer/detail..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                />
                <span className="form-help">
                  Please be as specific as possible to verify ownership.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Message to Poster (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Add any additional context or contact info..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>

              <button
                type="submit"
                className="btn-submit-claim"
                disabled={!answer.trim()}
              >
                Submit Claim
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
