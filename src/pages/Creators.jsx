import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { creators } from '../data/creators';
import { campaigns } from '../data/campaigns';
import { getProductSalesPerCreatorMap } from '../data/productSales';
import { formatNumber, formatCurrency, formatCompactNumber, getInitials } from '../utils/formatters';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import DataTable from '../components/common/DataTable';
import { Users, Layers, FileVideo, BarChart2, Package, TrendingUp } from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import './Creators.css';

function InstagramIcon({ size = 12, color = '#e1306c' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function Creators() {
  const navigate = useNavigate();
  const { portal, currentConfig } = usePortal();
  const [activeTab, setActiveTab] = useState('productSales');
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');

  const salesMap = useMemo(() => getProductSalesPerCreatorMap(), []);

  // Dynamic campaign filter options from active campaigns
  const campaignOptions = useMemo(() => {
    const names = Array.from(new Set(campaigns.map(c => c.name)));
    return names.map(name => ({
      value: name,
      label: name,
    }));
  }, []);

  // Enrich creators with metrics strictly for active portal with zero cross-portal linkage
  const enrichedCreators = useMemo(() => {
    const priorityOrder = [
      'cr_bhumi', 'cr_jyoti_y', 'cr_supriya_g', 'cr_ashima',
      'cr_jyoti_b', 'cr_aditi', 'cr_rahul', 'cr_priya',
      'cr_amit_t', 'cr_ritu_s', 'cr_manish_j', 'cr_vaishali',
    ];

    const sortedList = [...creators].sort((a, b) => {
      const idxA = priorityOrder.indexOf(a.id);
      const idxB = priorityOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });

    return sortedList.map(c => {
      const salesInfo = salesMap.get(c.id);
      const unitsSold = salesInfo ? salesInfo.unitsSold : 0;
      const salesVal = salesInfo ? salesInfo.sales : 0;
      const productCount = salesInfo ? salesInfo.productIds.size : 0;

      return {
        ...c,
        platform: c.platform || 'Instagram',
        campaignsCount: 1,
        campaignsLabel: '1 Campaign',
        campaignName: 'HaulPack x Amazon Head & Shoulders',
        campaignId: '6ace2b3abe742272b6135d8e',
        contentCount: 0,
        views: c.views || 0,
        clicks: 0,
        unitsSold: unitsSold || 0,
        sales: salesVal || 0,
        productCount: productCount || 0,
      };
    });
  }, [salesMap]);

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
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.socialHandle?.toLowerCase().includes(q));
    }
    if (platformFilter) {
      result = result.filter(c => c.platform === platformFilter);
    }
    if (campaignFilter) {
      result = result.filter(c => c.campaignName === campaignFilter || c.campaignId === campaignFilter);
    }
    return result;
  }, [enrichedCreators, search, platformFilter, campaignFilter]);

  const handleSearch = useCallback((val) => setSearch(val), []);

  // Shared creator column cell renderer matching pulse.haulpack.com exactly
  const renderCreatorCell = (val, row) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {row.avatarUrl ? (
        <img
          src={row.avatarUrl}
          alt={val}
          style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextSibling) {
              e.currentTarget.nextSibling.style.display = 'flex';
            }
          }}
        />
      ) : null}
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: row.avatarColor || 'var(--hp-primary, #6538ea)',
        color: '#ffffff',
        display: row.avatarUrl ? 'none' : 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-heading)', flexShrink: 0,
      }}>
        {getInitials(val)}
      </div>
      <div>
        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13.5px' }}>{val}</div>
      </div>
    </div>
  );

  // Shared platform cell renderer
  const renderPlatformCell = (val) => {
    const platform = val && val !== '—' ? val : 'Instagram';
    const isIG = platform === 'Instagram';
    return (
      <span className={`creators-platform-tag ${isIG ? 'creators-platform-tag--ig' : 'creators-platform-tag--yt'}`}>
        {isIG && <InstagramIcon size={12} />}
        <span>{platform}</span>
      </span>
    );
  };

  // Shared Profile -> action cell
  const renderActionCell = (_, row) => (
    <div style={{ textAlign: 'right' }}>
      <span
        className="creators-table__profile-link"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/creators/${row.id}`);
        }}
      >
        <span>Profile</span>
        <span style={{ fontSize: '15px', lineHeight: 1 }}>&rarr;</span>
      </span>
    </div>
  );

  // Content Columns (matches pulse.haulpack.com/creators 1:1)
  const contentColumns = [
    {
      key: 'name',
      label: 'CREATOR',
      width: '260px',
      render: renderCreatorCell,
    },
    {
      key: 'platform',
      label: 'PLATFORMS',
      render: renderPlatformCell,
    },
    {
      key: 'campaignName',
      label: 'CAMPAIGNS',
      render: () => (
        <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500 }} title="1 Campaign">
          1 Campaign
        </span>
      ),
    },
    {
      key: 'contentCount',
      label: 'APPROVED LIVE POSTS',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatNumber(val || 0)}</span>,
    },
    {
      key: 'views',
      label: 'REACH',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCompactNumber(val || 0)}</span>,
    },
    {
      key: 'action',
      label: '',
      align: 'right',
      sortable: false,
      render: renderActionCell,
    },
  ];

  // Product Sales Columns matching Screenshot 5
  const productSalesColumns = [
    {
      key: 'name',
      label: 'CREATOR',
      width: '260px',
      render: renderCreatorCell,
    },
    {
      key: 'platform',
      label: 'PLATFORMS',
      render: renderPlatformCell,
    },
    {
      key: 'campaignsCount',
      label: 'CAMPAIGNS',
      render: (val, row) => (
        <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>
          {row.campaignsLabel || '1 Campaign'}
        </span>
      ),
    },
    {
      key: 'unitsSold',
      label: 'UNITS SOLD',
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 600, color: val ? '#0f172a' : '#94a3b8' }}>
          {val ? formatNumber(val) : '—'}
        </span>
      ),
    },
    {
      key: 'sales',
      label: 'SALES',
      align: 'right',
      render: (val, row) => (
        <span style={{ fontWeight: 700, color: val ? '#059669' : '#94a3b8', fontSize: '13.5px' }}>
          {val ? (row.salesDisplay || formatCurrency(val)) : '—'}
        </span>
      ),
    },
    {
      key: 'productCount',
      label: 'PRODUCTS',
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 600, color: val ? '#0f172a' : '#94a3b8' }}>
          {val ? val : '—'}
        </span>
      ),
    },
    {
      key: 'action',
      label: '',
      align: 'right',
      sortable: false,
      render: renderActionCell,
    },
  ];

  return (
    <div className="fade-in creators-page">
      <div className="creators-page__header">
        <h1 className="creators-page__title">Pulse Creators</h1>
        <p className="creators-page__subtitle">
          Directory of creators enrolled in Pulse partnerships, deliverable tracking, and media reach.
        </p>
      </div>

      {/* Aggregate summary cards matching Screenshot 5 */}
      <div className="creators-page__kpis">
        <div className="pulse-kpi-card">
          <div className="pulse-kpi-card__header">
            <div className="pulse-kpi-card__icon">
              <Users size={16} />
            </div>
            <span className="pulse-kpi-card__label">TOTAL INFLUENCERS</span>
          </div>
          <div className="pulse-kpi-card__val">49</div>
        </div>

        {activeTab === 'productSales' ? (
          <>
            <div className="pulse-kpi-card">
              <div className="pulse-kpi-card__header">
                <div className="pulse-kpi-card__icon">
                  <Package size={16} />
                </div>
                <span className="pulse-kpi-card__label">TOTAL UNITS SOLD</span>
              </div>
              <div className="pulse-kpi-card__val">291</div>
            </div>

            <div className="pulse-kpi-card">
              <div className="pulse-kpi-card__header">
                <div className="pulse-kpi-card__icon">
                  <TrendingUp size={16} />
                </div>
                <span className="pulse-kpi-card__label">TOTAL PRODUCT SALES</span>
              </div>
              <div className="pulse-kpi-card__val">₹3.9L</div>
            </div>
          </>
        ) : (
          <>
            <div className="pulse-kpi-card">
              <div className="pulse-kpi-card__header">
                <div className="pulse-kpi-card__icon">
                  <FileVideo size={16} />
                </div>
                <span className="pulse-kpi-card__label">TOTAL APPROVED LIVE POSTS</span>
              </div>
              <div className="pulse-kpi-card__val">{formatNumber(totals.content)}</div>
            </div>

            <div className="pulse-kpi-card">
              <div className="pulse-kpi-card__header">
                <div className="pulse-kpi-card__icon">
                  <Layers size={16} />
                </div>
                <span className="pulse-kpi-card__label">TOTAL REACH</span>
              </div>
              <div className="pulse-kpi-card__val">{formatCompactNumber(totals.views)}</div>
            </div>
          </>
        )}
      </div>

      <div className="creators-page__toolbar">
        <div style={{ flex: 1, minWidth: 260, maxWidth: 420 }}>
          <SearchBar placeholder="Search creator by name or @handle..." onSearch={handleSearch} />
        </div>
        <div className="cp-perf-tabs">
          <button
            type="button"
            className={`cp-perf-tab ${activeTab === 'content' ? 'cp-perf-tab--active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <BarChart2 size={13} />
            <span>Content</span>
          </button>
          <button
            type="button"
            className={`cp-perf-tab ${activeTab === 'productSales' ? 'cp-perf-tab--active' : ''}`}
            onClick={() => setActiveTab('productSales')}
          >
            <Package size={13} />
            <span>Product Sales</span>
          </button>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
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
            value={campaignFilter}
            onChange={setCampaignFilter}
            options={campaignOptions}
          />
        </div>
      </div>

      <DataTable
        columns={activeTab === 'productSales' ? productSalesColumns : contentColumns}
        data={filtered}
        pageSize={10}
        onRowClick={(row) => navigate(`/creators/${row.id}`)}
        emptyMessage="No creators found matching your criteria."
      />
    </div>
  );
}
