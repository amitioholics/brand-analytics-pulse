import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCampaignsByPortal } from '../data/campaigns';
import { getCampaignMetrics } from '../data/metrics';
import { getBarterFulfillmentForCampaign } from '../data/creators';
import { formatNumber, formatCurrency, formatCompactNumber, formatDateRange } from '../utils/formatters';
import { usePortal } from '../context/PortalContext';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Breadcrumb from '../components/common/Breadcrumb';
import PGLogo from '../components/common/PGLogo';
import './CampaignList.css';

export default function CampaignList() {
  const navigate = useNavigate();
  const { portal, currentConfig, isBrandConnect } = usePortal();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Strictly campaigns for the active workspace with zero cross-portal linkage
  const portalCampaigns = useMemo(() => {
    return getCampaignsByPortal(portal);
  }, [portal]);

  const campaignsWithMetrics = useMemo(() => {
    return portalCampaigns.map(c => {
      const metrics = getCampaignMetrics(c.id);
      return { ...c, ...metrics };
    });
  }, [portalCampaigns]);

  const filtered = useMemo(() => {
    let result = campaignsWithMetrics;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }
    if (statusFilter) {
      result = result.filter(c => c.status === statusFilter);
    }
    return result;
  }, [campaignsWithMetrics, search, statusFilter]);

  const handleSearch = useCallback((val) => setSearch(val), []);

  const columns = [
    {
      key: 'name',
      label: 'Campaign Name',
      width: '320px',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 52, height: 34, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: '#5b21b6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <img
              src={row.imageUrl || '/campaign-banner.png'}
              alt={val}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#111827' }}>{val}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
              {row.compensationType || 'Paid Collab'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: false,
      render: (_, row) => (
        <span style={{ fontSize: 'var(--text-sm)', color: '#4b5563' }}>
          {formatDateRange(row.startDate, row.endDate)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'creatorCount',
      label: 'Registered Creators',
      align: 'right',
      render: (val, row) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, color: '#111827' }}>{formatNumber(val || row.registeredCreatorsCount || 418)} registered</div>
          <div style={{ fontSize: '11px', display: 'flex', gap: 5, justifyContent: 'flex-end', marginTop: 2 }}>
            <span style={{ color: '#059669', fontWeight: 600 }}>0 Delivered</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ color: '#d97706', fontWeight: 600 }}>418 Pending</span>
          </div>
        </div>
      ),
    },
    {
      key: 'contentCount',
      label: 'Content',
      align: 'right',
      render: (val, row) => formatNumber(val || row.contentCount || row.deliverablesCount || 418),
    },
    {
      key: 'livePosts',
      label: 'Live Posts',
      align: 'right',
      render: (val) => formatNumber(val || 0),
    },
    {
      key: 'views',
      label: 'Views',
      align: 'right',
      render: (val) => formatCompactNumber(val || 0),
    },
    {
      key: 'engagements',
      label: 'Engagement',
      align: 'right',
      render: (val) => formatCompactNumber(val || 0),
    },
  ];

  return (
    <div className="campaign-list fade-in">
      <Breadcrumb items={[{ label: currentConfig.campaignsLabel }]} />

      <div className="campaign-list__header">
        <h1 className="campaign-list__title">{currentConfig.campaignsLabel}</h1>
      </div>

      <div className="campaign-list__toolbar">
        <SearchBar placeholder={`Search ${currentConfig.campaignsLabel.toLowerCase()}...`} onSearch={handleSearch} />
        <div className="campaign-list__filters">
          <FilterDropdown
            label="All Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Scheduled', label: 'Scheduled' },
              { value: 'Completed', label: 'Completed' },
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => navigate(`/campaigns/${row.id}`)}
        emptyMessage={`No ${currentConfig.campaignsLabel.toLowerCase()} found in ${currentConfig.name}.`}
        paginated={false}
      />
    </div>
  );
}
