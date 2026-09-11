import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { creators } from '../data/creators';
import { getCreatorOverallMetrics } from '../data/metrics';
import { formatNumber, formatCurrency, formatCompactNumber, getInitials, getSocialUrl } from '../utils/formatters';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import DataTable from '../components/common/DataTable';
import KPICard from '../components/common/KPICard';
import { Users, Layers, FileVideo, ShoppingCart, ExternalLink, ArrowRight } from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import './Creators.css';

export default function Creators() {
  const navigate = useNavigate();
  const { portal, currentConfig, isBrandConnect } = usePortal();
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [campaignCountFilter, setCampaignCountFilter] = useState('');

  // Enrich creators with metrics strictly for active portal with zero cross-portal linkage
  const enrichedCreators = useMemo(() => {
    return creators
      .map(c => {
        const metrics = getCreatorOverallMetrics(c.id, portal);
        return {
          ...c,
          campaignsCount: metrics.campaignsCount,
          contentCount: metrics.contentCount,
          views: metrics.views,
          clicks: metrics.clicks,
          sales: metrics.sales,
          orders: metrics.orders,
        };
      })
      .filter(c => c.campaignsCount > 0);
  }, [portal]);

  // Summary aggregates
  const totals = useMemo(() => {
    return enrichedCreators.reduce(
      (acc, c) => {
        acc.content += c.contentCount;
        acc.views += c.views;
        acc.sales += c.sales;
        return acc;
      },
      { content: 0, views: 0, sales: 0 }
    );
  }, [enrichedCreators]);

  const filtered = useMemo(() => {
    let result = enrichedCreators;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.socialHandle.toLowerCase().includes(q));
    }
    if (platformFilter) {
      result = result.filter(c => c.platform === platformFilter);
    }
    if (campaignCountFilter) {
      const count = parseInt(campaignCountFilter, 10);
      result = result.filter(c => c.campaignsCount === count);
    }
    return result;
  }, [enrichedCreators, search, platformFilter, campaignCountFilter]);

  const handleSearch = useCallback((val) => setSearch(val), []);

  const columns = [
    {
      key: 'name',
      label: 'Creator',
      width: '230px',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: row.avatarColor || 'var(--hp-primary)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-heading)', flexShrink: 0,
          }}>
            {getInitials(val)}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--hp-text-primary)' }}>{val}</div>
            <a
              href={getSocialUrl(row.platform, row.socialHandle)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--hp-primary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
              }}
              title={`Open ${row.name}'s ${row.platform} profile`}
            >
              <span>{row.socialHandle}</span>
            </a>
          </div>
        </div>
      ),
    },
    {
      key: 'platform',
      label: 'Platform',
      render: (val, row) => {
        const url = getSocialUrl(val, row.socialHandle);
        const isIG = val === 'Instagram';
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={`Open ${row.name}'s ${val} profile (${row.socialHandle})`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 9px',
              borderRadius: '6px',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              textDecoration: 'none',
              color: isIG ? '#e1306c' : '#ef4444',
              background: isIG ? '#fdf2f8' : '#fef2f2',
              border: `1px solid ${isIG ? '#fbcfe8' : '#fecaca'}`,
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span>{val}</span>
            <ExternalLink size={12} strokeWidth={2.2} />
          </a>
        );
      },
    },
    {
      key: 'followerCount',
      label: 'Followers',
      align: 'right',
      render: (val) => formatCompactNumber(val),
    },
    {
      key: 'campaignsCount',
      label: isBrandConnect ? 'Collabs' : 'Campaigns',
      align: 'center',
      render: (val) => (
        <span style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 12,
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          background: val >= 2 ? 'var(--hp-primary-subtle)' : 'var(--hp-bg-body)',
          color: val >= 2 ? 'var(--hp-primary)' : 'var(--hp-text-secondary)',
        }}>
          {val} {val === 1 ? (isBrandConnect ? 'Collab' : 'Campaign') : (isBrandConnect ? 'Collabs' : 'Campaigns')}
        </span>
      ),
    },
    {
      key: 'contentCount',
      label: isBrandConnect ? 'Deliverables' : 'Content',
      align: 'right',
      render: (val) => val,
    },
    {
      key: 'views',
      label: isBrandConnect ? 'Reach' : 'Total Views',
      align: 'right',
      render: (val) => formatCompactNumber(val),
    },
    {
      key: 'sales',
      label: isBrandConnect ? 'Media Value' : 'Sales Generated',
      align: 'right',
      render: (val) => formatCurrency(val),
    },
    {
      key: 'action',
      label: '',
      align: 'right',
      sortable: false,
      render: (_, row) => (
        <button
          className="btn btn-secondary creators-table__view-btn"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/creators/${row.id}`);
          }}
        >
          <span>Analytics</span>
          <ArrowRight size={13} />
        </button>
      ),
    },
  ];

  return (
    <div className="fade-in creators-page">
      <div className="creators-page__header">
        <h1 className="creators-page__title">{currentConfig.name} Creators</h1>
        <p className="creators-page__subtitle">
          {isBrandConnect
            ? 'Directory of creators enrolled in Brand Connect partnerships, deliverable tracking, and media reach.'
            : 'Directory of creators enrolled in Reward Programs, multi-campaign performance, and sales attribution.'}
        </p>
      </div>

      {/* Aggregate summary cards */}
      <div className="creators-page__kpis">
        <KPICard
          icon={Users}
          label="Total Influencers"
          value={enrichedCreators.length}
          change={`Enrolled in ${currentConfig.name}`}
        />
        <KPICard
          icon={FileVideo}
          label={isBrandConnect ? 'Total Deliverables' : 'Total Content Generated'}
          value={formatNumber(totals.content)}
          change="Reels & Videos"
        />
        <KPICard
          icon={ShoppingCart}
          label={isBrandConnect ? 'Total Media Value Driven' : 'Total Sales Driven'}
          value={formatCurrency(totals.sales)}
          change={isBrandConnect ? 'Brand collab value' : 'Catalog revenue'}
          positive={true}
        />
      </div>

      <div className="creators-page__toolbar">
        <SearchBar placeholder="Search creator by name or @handle..." onSearch={handleSearch} />
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <FilterDropdown
            label="All Platforms"
            value={platformFilter}
            onChange={setPlatformFilter}
            options={[
              { value: 'Instagram', label: 'Instagram' },
              { value: 'YouTube', label: 'YouTube' },
            ]}
          />
          <FilterDropdown
            label="All Campaigns"
            value={campaignCountFilter}
            onChange={setCampaignCountFilter}
            options={[
              { value: '3', label: 'All 3 Myntra Campaigns' },
              { value: '2', label: '2 Campaigns' },
              { value: '1', label: '1 Campaign' },
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        pageSize={20}
        onRowClick={(row) => navigate(`/creators/${row.id}`)}
        emptyMessage="No creators found matching your criteria."
      />
    </div>
  );
}
