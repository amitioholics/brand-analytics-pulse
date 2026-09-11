import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCampaignsByPortal } from '../data/campaigns';
import { getCampaignMetrics } from '../data/metrics';
import { getBarterFulfillmentForCampaign } from '../data/creators';
import { formatNumber, formatCurrency, formatDateRange } from '../utils/formatters';
import { usePortal } from '../context/PortalContext';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Breadcrumb from '../components/common/Breadcrumb';
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
      label: isBrandConnect ? 'Collaboration Name' : 'Program Name',
      width: '280px',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>,
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: false,
      render: (_, row) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--hp-text-secondary)' }}>
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
      label: isBrandConnect ? 'Registered Creators' : 'Creators',
      align: 'right',
      render: (val, row) => {
        if (isBrandConnect && row.isBarter) {
          const barter = getBarterFulfillmentForCampaign(row.id);
          return (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>{formatNumber(val)} registered</div>
              <div style={{ fontSize: '11px', display: 'flex', gap: 5, justifyContent: 'flex-end', marginTop: 2 }}>
                <span style={{ color: '#059669', fontWeight: 600 }}>{barter.deliveredCount} Delivered</span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span style={{ color: '#d97706', fontWeight: 600 }}>{barter.yetToReceiveCount} Pending</span>
              </div>
            </div>
          );
        }
        return formatNumber(val);
      },
    },
    {
      key: 'contentCount',
      label: isBrandConnect ? 'Deliverables' : 'Content',
      align: 'right',
      render: (val) => formatNumber(val),
    },
    {
      key: 'views',
      label: isBrandConnect ? 'Reach' : 'Views',
      align: 'right',
      render: (val) => formatNumber(val),
    },
    {
      key: 'clicks',
      label: isBrandConnect ? 'Engagements' : 'Clicks',
      align: 'right',
      render: (val) => formatNumber(val),
    },
    {
      key: 'sales',
      label: isBrandConnect ? 'Media Value' : 'Sales Driven',
      align: 'right',
      render: (val) => formatCurrency(val),
    },
    {
      key: 'action',
      label: '',
      sortable: false,
      render: (_, row) => (
        <button
          className="campaign-list__view-btn"
          onClick={(e) => { e.stopPropagation(); navigate(`/campaigns/${row.id}`); }}
        >
          View →
        </button>
      ),
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
