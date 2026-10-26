import { useState } from 'react';
import {
  Users, UserPlus, Shield, ShieldCheck, Eye, Trash2,
  Mail, Clock, CheckCircle2, AlertCircle, X, Check
} from 'lucide-react';
import { getTeamMembers, inviteTeamMember, updateTeamRole, removeTeamMember } from '../data/teamData';
import Breadcrumb from '../components/common/Breadcrumb';
import './TeamSettings.css';

const ROLE_DESCRIPTIONS = {
  'Brand Admin': 'Full administrative access: view campaigns, review content, view performance, manage team, and export data.',
  'Content Reviewer': 'Creative review access: view campaigns, review/approve/reject draft videos and live post links, view performance.',
  'Viewer': 'Read-only access: view campaigns, content, and post analytics without review or export permissions.',
};

export default function TeamSettings() {
  const [members, setMembers] = useState(getTeamMembers());
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Content Reviewer');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    try {
      inviteTeamMember({ name: inviteName, email: inviteEmail, role: inviteRole });
      setMembers(getTeamMembers());
      setIsInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');
      setInviteRole('Content Reviewer');
      setActionSuccess(`Invitation sent to ${inviteEmail}`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleRoleChange = (userId, newRole) => {
    try {
      updateTeamRole(userId, newRole);
      setMembers(getTeamMembers());
      setActionSuccess('User role updated successfully');
      setTimeout(() => setActionSuccess(''), 2500);
    } catch (err) {
      setActionError(err.message);
      setTimeout(() => setActionError(''), 3000);
    }
  };

  const handleRemoveMember = (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from the brand organisation?`)) return;
    try {
      removeTeamMember(userId);
      setMembers(getTeamMembers());
      setActionSuccess(`Removed ${userName}`);
      setTimeout(() => setActionSuccess(''), 2500);
    } catch (err) {
      setActionError(err.message);
      setTimeout(() => setActionError(''), 3500);
    }
  };

  return (
    <div className="team-settings fade-in">
      <Breadcrumb items={[
        { label: 'Settings', to: '/settings/team' },
        { label: 'Team & Roles' },
      ]} />

      <div className="team-settings__header">
        <div>
          <div className="team-settings__badge">
            <Shield size={13} />
            <span>Brand Organisation Governance</span>
          </div>
          <h1 className="team-settings__title">Team Members & Permissions</h1>
          <p className="team-settings__sub">
            Manage who can access the P&G Brand Connect portal, review creator deliverables, and view campaign analytics.
          </p>
        </div>

        <button
          type="button"
          className="team-settings__invite-btn"
          onClick={() => setIsInviteModalOpen(true)}
        >
          <UserPlus size={15} />
          <span>Invite Teammate</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="team-banner team-banner--success">
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="team-banner team-banner--error">
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Team Table (PRD 8.2 TM-03) */}
      <div className="team-card">
        <table className="team-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id} className="team-row">
                <td>
                  <div className="team-user-cell">
                    <div
                      className="team-avatar"
                      style={{ background: member.avatarColor || '#655bef' }}
                    >
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="team-name">
                        {member.name}
                        {member.isCurrent && <span className="current-badge">You</span>}
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="team-email">{member.email}</span>
                </td>

                <td>
                  <select
                    className="role-select"
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    disabled={member.isCurrent}
                    title={member.isCurrent ? 'You cannot change your own role' : 'Change user role'}
                  >
                    <option value="Brand Admin">Brand Admin</option>
                    <option value="Content Reviewer">Content Reviewer</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </td>

                <td>
                  <span className={`status-pill status-pill--${member.status.toLowerCase()}`}>
                    {member.status}
                  </span>
                </td>

                <td>
                  <div className="last-login-cell">
                    <Clock size={12} />
                    <span>{member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString() : 'Never (Invited)'}</span>
                  </div>
                </td>

                <td style={{ textAlign: 'right' }}>
                  {!member.isCurrent && (
                    <button
                      type="button"
                      className="remove-user-btn"
                      onClick={() => handleRemoveMember(member.id, member.name)}
                      title="Remove member"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Permission Matrix Guide (PRD 5.3) */}
      <div className="team-matrix-card">
        <h3 className="matrix-title">Role Permission Reference (PRD Section 5.3)</h3>
        <div className="matrix-grid">
          <div className="matrix-role-box">
            <div className="matrix-role-header">
              <ShieldCheck size={16} color="#655bef" />
              <strong>Brand Admin</strong>
            </div>
            <p>{ROLE_DESCRIPTIONS['Brand Admin']}</p>
            <ul>
              <li>✅ Review & approve video content</li>
              <li>✅ Invite & manage team members</li>
              <li>✅ Export post and campaign CSV reports</li>
            </ul>
          </div>

          <div className="matrix-role-box">
            <div className="matrix-role-header">
              <Shield size={16} color="#10b981" />
              <strong>Content Reviewer</strong>
            </div>
            <p>{ROLE_DESCRIPTIONS['Content Reviewer']}</p>
            <ul>
              <li>✅ Review & approve video content</li>
              <li>✅ View campaign briefs and creators</li>
              <li>❌ Cannot manage team or change settings</li>
            </ul>
          </div>

          <div className="matrix-role-box">
            <div className="matrix-role-header">
              <Eye size={16} color="#64748b" />
              <strong>Viewer</strong>
            </div>
            <p>{ROLE_DESCRIPTIONS['Viewer']}</p>
            <ul>
              <li>✅ View campaigns and live post metrics</li>
              <li>❌ Read-only (cannot approve or reject)</li>
              <li>❌ Cannot export sensitive data</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Invite Member Modal (PRD 8.2 TM-01) */}
      {isInviteModalOpen && (
        <div className="team-modal-overlay" onClick={() => setIsInviteModalOpen(false)}>
          <div className="team-modal" onClick={(e) => e.stopPropagation()}>
            <div className="team-modal__header">
              <h3 className="team-modal__title">Invite Teammate</h3>
              <button
                type="button"
                className="team-modal__close"
                onClick={() => setIsInviteModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="team-modal__form">
              <div className="form-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Priyanshu Sharma"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Work Email</label>
                <input
                  type="email"
                  placeholder="e.g. priyanshu@pg.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="Brand Admin">Brand Admin (Full Control)</option>
                  <option value="Content Reviewer">Content Reviewer (Review & Performance)</option>
                  <option value="Viewer">Viewer (Read-Only)</option>
                </select>
                <small className="form-hint">{ROLE_DESCRIPTIONS[inviteRole]}</small>
              </div>

              <div className="team-modal__actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
