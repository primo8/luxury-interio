import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, XCircle, MessageSquare, RefreshCw, X, Send } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { fetchAdminReviews, updateAdminReviewStatus } from '../../utils/adminApi';

export function ReviewsManager() {
  const { showAdminToast } = useAdmin();
  const [reviews, setReviews] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  // Reply Modal
  const [replyingReview, setReplyingReview] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminReviews();
      if (res.success) {
        setReviews(res.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await updateAdminReviewStatus(id, status);
      if (res.success) {
        showAdminToast(`Review status updated to ${status}`, 'success');
        loadReviews();
      }
    } catch (err) {
      showAdminToast('Failed to update review status', 'error');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview || !replyText.trim()) return;

    setIsReplying(true);
    try {
      const res = await updateAdminReviewStatus(replyingReview.id, replyingReview.status, {
        text: replyText.trim(),
      });
      if (res.success) {
        showAdminToast('Concierge reply published!', 'success');
        setReplyingReview(null);
        setReplyText('');
        loadReviews();
      }
    } catch (err) {
      showAdminToast('Failed to post reply', 'error');
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="admin-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              Customer Reviews & Reputation Moderation ({reviews.length})
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
              Inspect verified purchaser feedback, approve, moderate, or publish official concierge replies
            </div>
          </div>
          <button onClick={loadReviews} className="admin-btn admin-btn-secondary">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reviews.map((rev) => (
          <div key={rev.id} className="admin-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rev.customerName}</div>
                  {rev.verifiedBuyer && (
                    <span className="admin-status-badge in_stock" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                      Verified Buyer
                    </span>
                  )}
                  <span className={`admin-status-badge ${rev.status.toLowerCase()}`}>{rev.status}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                  Reviewed on {new Date(rev.date).toLocaleDateString()} • {rev.productName}
                </div>
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', gap: '2px', color: 'var(--admin-gold)' }}>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={16}
                    fill={idx < rev.rating ? 'var(--admin-gold)' : 'none'}
                    color="var(--admin-gold)"
                  />
                ))}
              </div>
            </div>

            <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.95rem', fontWeight: 700 }}>{rev.title}</h4>
            <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--admin-text-secondary)', lineHeight: 1.5 }}>
              "{rev.comment}"
            </p>

            {/* Official Reply if exists */}
            {rev.reply && (
              <div
                style={{
                  background: 'var(--admin-bg)',
                  borderLeft: '3px solid var(--admin-plum)',
                  padding: '0.75rem 1rem',
                  borderRadius: '0 8px 8px 0',
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--admin-plum)', marginBottom: '2px' }}>
                  {rev.reply.author} Response:
                </div>
                <div style={{ color: 'var(--admin-text-secondary)' }}>{rev.reply.text}</div>
              </div>
            )}

            {/* Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--admin-border-light)', paddingTop: '0.75rem' }}>
              <button
                onClick={() => {
                  setReplyingReview(rev);
                  setReplyText(rev.reply?.text || '');
                }}
                className="admin-btn admin-btn-sm admin-btn-secondary"
              >
                <MessageSquare size={14} />
                <span>{rev.reply ? 'Edit Reply' : 'Reply'}</span>
              </button>

              {rev.status !== 'APPROVED' && (
                <button
                  onClick={() => handleStatusChange(rev.id, 'APPROVED')}
                  className="admin-btn admin-btn-sm admin-btn-secondary"
                  style={{ color: 'var(--admin-success)' }}
                >
                  <CheckCircle2 size={14} />
                  <span>Approve</span>
                </button>
              )}

              {rev.status !== 'REJECTED' && (
                <button
                  onClick={() => handleStatusChange(rev.id, 'REJECTED')}
                  className="admin-btn admin-btn-sm admin-btn-secondary"
                  style={{ color: 'var(--admin-error)' }}
                >
                  <XCircle size={14} />
                  <span>Reject</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {replyingReview && (
        <div className="admin-modal-backdrop" onClick={() => setReplyingReview(null)}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Concierge Official Response</h3>
              <button onClick={() => setReplyingReview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendReply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="admin-label">Reply to {replyingReview.customerName}</label>
                <textarea
                  className="admin-textarea"
                  rows={4}
                  required
                  placeholder="Thank you for your feedback..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setReplyingReview(null)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isReplying} className="admin-btn admin-btn-primary">
                  <Send size={16} />
                  <span>Publish Reply</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
