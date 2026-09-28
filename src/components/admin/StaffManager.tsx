import { useState, useEffect } from 'react';
import {
  RefreshCw,
  UserPlus,
  Trash2,
  ShieldCheck,
  Mail,
  Phone,
  Building2,
  Lock,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import {
  fetchAdminStaff,
  inviteAdminStaff,
  deleteAdminStaff,
  toggleAdminStaffStatus,
} from '../../utils/adminApi';
import { useAdmin } from '../../context/AdminContext';

const ROLE_OPTIONS = [
  {
    value: 'SUPER_ADMIN',
    label: 'Super Admin',
    desc: 'Full unrestricted system authority & permissions across all subsystems',
    badgeClass: 'super',
  },
  {
    value: 'ADMIN',
    label: 'Administrator',
    desc: 'Operations, orders, catalog, payments, CMS, and standard management',
    badgeClass: 'active',
  },
  {
    value: 'ORDER_MANAGER',
    label: 'Order Manager',
    desc: 'Order lifecycle transitions, shipping zones, and dispatch fulfillment',
    badgeClass: 'processing',
  },
  {
    value: 'PRODUCT_MANAGER',
    label: 'Product Manager',
    desc: 'Product catalog, 3D studio, categories, and inventory restocking',
    badgeClass: 'processing',
  },
  {
    value: 'FINANCE_MANAGER',
    label: 'Finance Manager',
    desc: 'MTN MoMo payments, transaction reconciliation, refunds, and discounts',
    badgeClass: 'paid',
  },
  {
    value: 'CONTENT_MANAGER',
    label: 'Content Manager',
    desc: 'Homepage CMS lookbooks, customer reviews, and editorial moderation',
    badgeClass: 'neutral',
  },
  {
    value: 'SUPPORT_AGENT',
    label: 'Support Agent',
    desc: 'Customer CRM inquiries, order viewing, and notification tracking',
    badgeClass: 'neutral',
  },
];

const DEPARTMENT_OPTIONS = [
  'EXECUTIVE',
  'OPERATIONS',
  'CATALOG & 3D STUDIO',
  'FINANCE & PAYMENTS',
  'MARKETING & CMS',
  'CUSTOMER SUCCESS',
  'LOGISTICS & WAREHOUSE',
];

export function StaffManager() {
  const { currentUser, showAdminToast } = useAdmin();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('ADMIN');
  const [formDept, setFormDept] = useState('OPERATIONS');
  const [formPhone, setFormPhone] = useState('');

  // Delete Confirmation State
  const [staffToDelete, setStaffToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminStaff();
      if (res.success) {
        setStaff(res.staff || []);
      } else {
        showAdminToast(res.message || 'Failed to load staff list', 'error');
      }
    } catch (err) {
      console.error('Failed to load staff:', err);
      showAdminToast('Network error loading staff list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail || !formEmail.includes('@')) {
      showAdminToast('Please provide a valid staff email address.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await inviteAdminStaff({
        email: formEmail,
        name: formName || formEmail.split('@')[0],
        role: formRole,
        department: formDept,
        phone: formPhone,
      });

      if (res.success) {
        showAdminToast(
          res.message || `Successfully authorized & invited ${formEmail} as ${formRole}!`,
          'success'
        );
        setIsInviteModalOpen(false);
        setFormName('');
        setFormEmail('');
        setFormRole('ADMIN');
        setFormDept('OPERATIONS');
        setFormPhone('');
        await loadStaff();
      } else {
        showAdminToast(res.message || 'Failed to invite staff member.', 'error');
      }
    } catch (err: any) {
      showAdminToast(err.message || 'Error creating staff invitation.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;

    setDeleting(true);
    try {
      const res = await deleteAdminStaff(staffToDelete.id);
      if (res.success) {
        showAdminToast(
          `Staff access for ${staffToDelete.name} (${staffToDelete.email}) permanently revoked and deleted.`,
          'info'
        );
        setStaffToDelete(null);
        await loadStaff();
      } else {
        showAdminToast(res.message || 'Failed to delete staff member.', 'error');
      }
    } catch (err: any) {
      showAdminToast(err.message || 'Error revoking staff access.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (member: any) => {
    const isCurrentlyActive = member.isActive ?? member.active ?? true;
    const newStatus = !isCurrentlyActive;

    try {
      const res = await toggleAdminStaffStatus(member.id, newStatus);
      if (res.success) {
        showAdminToast(
          `${member.name} (${member.email}) is now ${newStatus ? 'active' : 'deactivated'}.`,
          newStatus ? 'success' : 'warning'
        );
        await loadStaff();
      } else {
        showAdminToast(res.message || 'Failed to change staff status.', 'error');
      }
    } catch (err: any) {
      showAdminToast(err.message || 'Error updating staff status.', 'error');
    }
  };

  const isCurrentLoggedInUser = (member: any) => {
    if (!currentUser) return false;
    return (
      currentUser.id === member.id ||
      currentUser.email?.toLowerCase() === member.email?.toLowerCase()
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Controls Bar */}
      <div className="admin-card" style={{ padding: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ShieldCheck size={20} color="var(--admin-gold)" />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                Staff Access & Role-Based Access Control (RBAC)
              </h3>
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--admin-text-muted)' }}>
              Invite authorized staff via email to log in with Google, assign least-privilege roles, or instantly revoke login access.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={loadStaff}
              disabled={loading}
              className="admin-btn admin-btn-secondary"
              title="Refresh staff list"
            >
              <RefreshCw size={16} className={loading ? 'spin-animation' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="admin-btn admin-btn-primary"
              id="invite-staff-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.65rem 1.25rem',
                fontWeight: 700,
              }}
            >
              <UserPlus size={16} />
              <span>Invite New Staff</span>
            </button>
          </div>
        </div>
      </div>

      {/* Staff Members Grid */}
      {loading && staff.length === 0 ? (
        <div
          className="admin-card"
          style={{
            padding: '3rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Loader2 size={32} className="spin-animation" color="var(--admin-gold)" />
          <span style={{ fontSize: '0.9rem', color: 'var(--admin-text-secondary)', fontWeight: 600 }}>
            Loading authorized staff directory...
          </span>
        </div>
      ) : staff.length === 0 ? (
        <div
          className="admin-card"
          style={{
            padding: '3rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <UserCheck size={36} color="var(--admin-gold)" />
          <h4 style={{ margin: 0, fontWeight: 800 }}>No Staff Accounts Found</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--admin-text-muted)', maxWidth: '400px' }}>
            Click "Invite New Staff" to add staff members by email address and grant Google Sign-In access.
          </p>
          <button onClick={() => setIsInviteModalOpen(true)} className="admin-btn admin-btn-primary" style={{ marginTop: '0.5rem' }}>
            <UserPlus size={16} />
            <span>Invite First Staff Member</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {staff.map((member) => {
            const isSelf = isCurrentLoggedInUser(member);
            const isActive = (member.isActive ?? member.active) === true;
            const roleMeta = ROLE_OPTIONS.find((r) => r.value === member.role) || {
              label: member.role,
              badgeClass: 'active',
            };

            return (
              <div
                key={member.id || member.email}
                className="admin-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: isSelf ? '1.5px solid rgba(212, 175, 55, 0.4)' : undefined,
                  opacity: isActive ? 1 : 0.65,
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                {/* Self Badge Tag */}
                {isSelf && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                      color: '#1A0B2E',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    YOU (CURRENT SESSION)
                  </div>
                )}

                {/* User Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={
                      member.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        member.name
                      )}&background=3B184F&color=D4AF37&bold=true`
                    }
                    alt={member.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--admin-plum)',
                      backgroundColor: 'var(--admin-plum-dark)',
                    }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {member.name}
                      </h4>
                    </div>

                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--admin-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '2px',
                      }}
                    >
                      <Mail size={12} color="var(--admin-gold)" />
                      <span style={{ wordBreak: 'break-all' }}>{member.email}</span>
                    </div>

                    {member.department && (
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--admin-text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '2px',
                          fontWeight: 600,
                        }}
                      >
                        <Building2 size={11} />
                        <span>{member.department}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Role & Status Row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--admin-bg)',
                    borderRadius: '8px',
                    border: '1px solid var(--admin-border-light)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
                      Privileged Role
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--admin-plum)' }}>
                      {roleMeta.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: isActive ? '#059669' : '#DC2626',
                        border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      }}
                    >
                      {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      <span>{isActive ? 'ACTIVE' : 'DEACTIVATED'}</span>
                    </span>
                  </div>
                </div>

                {/* Permissions Pill Cloud */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--admin-text-muted)',
                      textTransform: 'uppercase',
                      marginBottom: '0.4rem',
                    }}
                  >
                    <span>Permissions</span>
                    <span>{member.permissions?.length || 0} granted</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      maxHeight: '80px',
                      overflowY: 'auto',
                      padding: '4px',
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderRadius: '6px',
                    }}
                  >
                    {(member.permissions || []).map((p: string, idx: number) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.65rem',
                          background: '#FFFFFF',
                          border: '1px solid var(--admin-border)',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          color: 'var(--admin-text-secondary)',
                          fontFamily: 'monospace',
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Controls & Timestamps */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--admin-border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    color: 'var(--admin-text-muted)',
                  }}
                >
                  <div>
                    Last login:{' '}
                    <strong>
                      {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString() : 'Never'}
                    </strong>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* Deactivate / Reactivate Toggle */}
                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(member)}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.72rem', height: 'auto' }}
                        title={isActive ? 'Deactivate staff login' : 'Activate staff login'}
                      >
                        {isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}

                    {/* Delete / Revoke Access */}
                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => setStaffToDelete(member)}
                        className="admin-btn"
                        style={{
                          padding: '0.35rem 0.6rem',
                          fontSize: '0.72rem',
                          height: 'auto',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#DC2626',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                        }}
                        title="Permanently delete staff record and revoke login access"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. INVITE STAFF MODAL */}
      {/* ========================================================= */}
      {isInviteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 4, 25, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1.5rem',
          }}
          onClick={() => setIsInviteModalOpen(false)}
        >
          <div
            className="admin-card"
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '0',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              border: '1px solid var(--admin-gold)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--admin-border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #2A0E38 0%, #15051F 100%)',
                color: '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                  }}
                >
                  <UserPlus size={18} color="var(--admin-gold)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                    Authorize & Invite Staff Member
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    Grant immediate Google Sign-In & privileged RBAC access
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleInviteSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label className="admin-label">
                  Google Account Email Address <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--admin-text-muted)',
                    }}
                  />
                  <input
                    type="email"
                    required
                    placeholder="e.g. colleague@gmail.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="admin-input"
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                  The staff member must use this exact Google email address when signing in via Google.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Marie Claire"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="admin-label">Phone Number (Optional)</label>
                  <div style={{ position: 'relative' }}>
                    <Phone
                      size={15}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--admin-text-muted)',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="+250 788 000 000"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="admin-input"
                      style={{ paddingLeft: '2.4rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="admin-label">Role Assignment</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="admin-select"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="admin-label">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="admin-select"
                  >
                    {DEPARTMENT_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Role Description Banner */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(59, 24, 79, 0.06)',
                  border: '1px solid rgba(59, 24, 79, 0.15)',
                  fontSize: '0.75rem',
                  color: 'var(--admin-text-secondary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--admin-plum)', marginBottom: '3px' }}>
                  <Lock size={13} />
                  <span>Role Scope: {ROLE_OPTIONS.find((r) => r.value === formRole)?.label}</span>
                </div>
                <div>{ROLE_OPTIONS.find((r) => r.value === formRole)?.desc}</div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="admin-btn admin-btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="spin-animation" />
                      <span>Authorizing Staff...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Authorize & Send Access</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. REVOKE / DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {staffToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 4, 25, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1.5rem',
          }}
          onClick={() => setStaffToDelete(null)}
        >
          <div
            className="admin-card"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EF4444',
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1F2937' }}>
                  Revoke Staff Access
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                  Permanent RBAC Access Deletion
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              Are you sure you want to delete staff access for{' '}
              <strong style={{ color: '#111827' }}>
                {staffToDelete.name} ({staffToDelete.email})
              </strong>
              ?
            </p>

            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                fontSize: '0.75rem',
                color: '#B91C1C',
                marginBottom: '1.5rem',
                lineHeight: 1.4,
              }}
            >
              ⚠️ This will immediately delete the staff authorization record in MongoDB. If this user attempts to log in with Google, they will be rejected with <strong>403 Access Denied</strong>.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="admin-btn admin-btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteStaff}
                disabled={deleting}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: deleting ? 0.75 : 1,
                }}
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="spin-animation" />
                    <span>Deleting Access...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete & Revoke Access</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
