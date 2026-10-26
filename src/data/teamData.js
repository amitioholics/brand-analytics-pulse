/* ==========================================================================
   Brand Team Members Data & Management (PRD 8.2 & 5.1)
   Roles:
   - 'Brand Admin': Full access (view, review, manage team, export, settings)
   - 'Content Reviewer': Review content, view campaigns & performance
   - 'Viewer': Read-only access to campaigns, content, and performance
   ========================================================================== */

export const INITIAL_TEAM_MEMBERS = [
  {
    id: 'user_001',
    name: 'Maya Sen',
    email: 'maya.sen@pg.com',
    role: 'Brand Admin',
    status: 'Active',
    avatarColor: '#655bef',
    lastLoginAt: '2026-09-11T12:45:00Z',
    isCurrent: true,
  },
  {
    id: 'user_002',
    name: 'Rohit Khanna',
    email: 'rohit.khanna@pg.com',
    role: 'Content Reviewer',
    status: 'Active',
    avatarColor: '#10b981',
    lastLoginAt: '2026-09-11T10:15:00Z',
    isCurrent: false,
  },
  {
    id: 'user_003',
    name: 'Tanvi Deshmukh',
    email: 'tanvi.deshmukh@pg.com',
    role: 'Content Reviewer',
    status: 'Active',
    avatarColor: '#f59e0b',
    lastLoginAt: '2026-09-10T16:20:00Z',
    isCurrent: false,
  },
  {
    id: 'user_004',
    name: 'Vikramaditya Roy',
    email: 'vikram.roy@pg.com',
    role: 'Viewer',
    status: 'Active',
    avatarColor: '#ec4899',
    lastLoginAt: '2026-09-08T14:30:00Z',
    isCurrent: false,
  },
  {
    id: 'user_005',
    name: 'Shreya Kapoor',
    email: 'shreya.k@agencypartner.com',
    role: 'Viewer',
    status: 'Invited',
    avatarColor: '#8b5cf6',
    lastLoginAt: null,
    isCurrent: false,
  },
];

let teamState = [...INITIAL_TEAM_MEMBERS];

export function getTeamMembers() {
  return [...teamState];
}

export function inviteTeamMember({ name, email, role }) {
  const newMember = {
    id: `user_${Date.now()}`,
    name,
    email,
    role: role || 'Content Reviewer',
    status: 'Invited',
    avatarColor: '#06b6d4',
    lastLoginAt: null,
    isCurrent: false,
  };
  teamState = [...teamState, newMember];
  return newMember;
}

export function updateTeamRole(userId, newRole) {
  teamState = teamState.map(m => (m.id === userId ? { ...m, role: newRole } : m));
  return teamState;
}

export function removeTeamMember(userId) {
  // Prevent removing last Brand Admin (PRD TM-04)
  const admins = teamState.filter(m => m.role === 'Brand Admin');
  const target = teamState.find(m => m.id === userId);
  if (target?.role === 'Brand Admin' && admins.length <= 1) {
    throw new Error('An organisation must always have at least one Brand Admin.');
  }
  teamState = teamState.filter(m => m.id !== userId);
  return teamState;
}
