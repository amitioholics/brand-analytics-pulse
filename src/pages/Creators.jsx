import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { creators } from '../data/creators';
import { getCreatorOverallMetrics } from '../data/metrics';
import { formatNumber, formatCurrency, formatCompactNumber, getInitials } from '../utils/formatters';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import DataTable from '../components/common/DataTable';
import { Users, Layers, FileVideo, ShoppingCart, Package, TrendingUp, BarChart2 } from 'lucide-react';
import { getAggregatedProductSales } from '../data/productSales';
import { usePortal } from '../context/PortalContext';
import './Creators.css';

export default function Creators() {
  const navigate = useNavigate();
  const { portal, currentConfig } = usePortal();
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [campaignCountFilter, setCampaignCountFilter] = useState('');
  const [creatorsViewTab, setCreatorsViewTab] = useState('content'); // 'content' | 'product' | 'all'

  // Product sales per creator for this portal
  const productByCreator = useMemo(() => {
    const all = getAggregatedProductSales(portal);
    const map = {};
    all.forEach(r => {
      if (!map[r.creatorId]) map[r.creatorId] = { unitsSold: 0, salesValue: 0, orders: 0, products: new Set() };
      map[r.creatorId].unitsSold  += r.unitsSold;
      map[r.creatorId].salesValue += r.salesValue;
      map[r.creatorId].orders     += r.orders;
      map[r.creatorId].products.add(r.productId);
    });
    return map;
  }, [portal]);

  // Enrich creators with metrics strictly for active portal with zero cross-portal linkage
  const enrichedCreators = useMemo(() => {
    return creators
      .map(c => {
        const metrics = getCreatorOverallMetrics(c.id, portal);
        const prod = productByCreator[c.id];
        return {
          ...c,
          campaignsCount: metrics.campaignsCount,
          contentCount: metrics.contentCount,
          views: metrics.views,
          clicks: metrics.clicks,
          sales: metrics.sales,
          orders: metrics.orders,
          productOrders: prod ? prod.orders : 0,
          productUnitsSold: prod ? prod.unitsSold : 0,
          productSalesValue: prod ? prod.salesValue : 0,
          productCount: prod ? prod.products.size : 0,
        };
      })
      .filter(c => c.campaignsCount > 0);
  }, [portal, productByCreator]);

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

  // Product totals
  const productTotals = useMemo(() => {
    return enrichedCreators.reduce(
      (acc, c) => {
        acc.orders += c.productOrders;
        acc.salesValue += c.productSalesValue;
        acc.unitsSold += c.productUnitsSold;
        return acc;
      },
      { orders: 0, salesValue: 0, unitsSold: 0 }
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
    if (campaignCountFilter) {
      const count = parseInt(campaignCountFilter, 10);
      result = result.filter(c => c.campaignsCount === count);
    }
    return result;
  }, [enrichedCreators, search, platformFilter, campaignCountFilter]);

  const handleSearch = useCallback((val) => setSearch(val), []);

  // Shared creator column cell renderer matching pulse.haulpack.com exactly
  const renderCreatorCell = (val, row) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {row.avatarUrl ? (
        <img
          src={row.avatarUrl}
          alt={val}
          style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: row.avatarColor || 'var(--hp-primary, #6538ea)',
          color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-heading)', flexShrink: 0,
        }}>
          {getInitials(val)}
        </div>
      )}
      <div>
        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13.5px' }}>{val}</div>
        {row.socialHandle && (
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 1 }}>{row.socialHandle}</div>
        )}
      </div>
    </div>
  );

  // Shared platform cell renderer
  const renderPlatformCell = (val) => {
    if (!val || val === '—') return <span style={{ color: '#94a3b8' }}>—</span>;
    const isIG = val === 'Instagram';
    return (
      <span className={`creators-platform-tag ${isIG ? 'creators-platform-tag--ig' : 'creators-platform-tag--yt'}`}>
        {val}
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
      key: 'campaignsCount',
      label: 'CAMPAIGNS',
      render: (val) => (
        <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
          {val} {val === 1 ? 'Campaign' : 'Campaigns'}
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

  // Product Sales Columns
  const productColumns = [
    {
      key: 'name',
      label: 'CREATOR',
      width: '240px',
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
      render: (val) => (
        <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
          {val} {val === 1 ? 'Campaign' : 'Campaigns'}
        </span>
      ),
    },
    {
      key: 'productOrders',
      label: 'ORDERS',
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          {val > 0 ? formatNumber(val) : '—'}
        </span>
      ),
    },
    {
      key: 'productUnitsSold',
      label: 'UNITS SOLD',
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          {val > 0 ? formatNumber(val) : '—'}
        </span>
      ),
    },
    {
      key: 'productSalesValue',
      label: 'SALES VALUE',
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 700, color: val > 0 ? '#059669' : '#94a3b8' }}>
          {val > 0 ? formatCurrency(val) : '—'}
        </span>
      ),
    },
    {
      key: 'productCount',
      label: 'PRODUCTS',
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 500, color: '#475569' }}>
          {val > 0 ? val : '—'}
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

  // All Metrics Columns (Content + Product Sales)
  const allColumns = [
    {
      key: 'name',
      label: 'CREATOR',
      width: '230px',
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
      render: (val) => (
        <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
          {val} {val === 1 ? 'Campaign' : 'Campaigns'}
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
      key: 'productOrders',
      label: 'ORDERS',
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          {val > 0 ? formatNumber(val) : '—'}
        </span>
      ),
    },
    {
      key: 'productSalesValue',
      label: 'SALES VALUE',
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 700, color: val > 0 ? '#059669' : '#94a3b8' }}>
          {val > 0 ? formatCurrency(val) : '—'}
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

  const activeColumns =
    creatorsViewTab === 'product'
      ? productColumns
      : creatorsViewTab === 'all'
      ? allColumns
      : contentColumns;

  return (
    <div className="fade-in creators-page">
      <div className="creators-page__header">
        <h1 className="creators-page__title">Pulse Creators</h1>
        <p className="creators-page__subtitle">
          Directory of creators enrolled in Pulse partnerships, deliverable tracking, and media reach.
        </p>
      </div>

      {/* Aggregate summary cards matching pulse.haulpack.com */}
      <div className={`creators-page__kpis ${creatorsViewTab === 'all' ? 'creators-page__kpis--4col' : ''}`}>
        <div className="pulse-kpi-card">
          <div className="pulse-kpi-card__header">
            <div className="pulse-kpi-card__icon">
              <Users size={16} />
            </div>
            <span className="pulse-kpi-card__label">TOTAL INFLUENCERS</span>
          </div>
          <div className="pulse-kpi-card__val">{enrichedCreators.length}</div>
        </div>

        {creatorsViewTab === 'product' ? (
          <>
            <div className="pulse-kpi-card">
              <div className="pulse-kpi-card__header">
                <div className="pulse-kpi-card__icon">
                  <Package size={16} />
                </div>
                <span className="pulse-kpi-card__label">TOTAL ORDERS</span>
              </div>
              <div className="pulse-kpi-card__val">{formatNumber(productTotals.orders)}</div>
            </div>
            <div className="pulse-kpi-card">
              <div className="pulse-kpi-card__header">
                <div className="pulse-kpi-card__icon">
                  <TrendingUp size={16} />
                </div>
                <span className="pulse-kpi-card__label">TOTAL PRODUCT SALES</span>
              </div>
              <div className="pulse-kpi-card__val">{formatCurrency(productTotals.salesValue)}</div>
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

        {creatorsViewTab === 'all' && (
          <div className="pulse-kpi-card">
            <div className="pulse-kpi-card__header">
              <div className="pulse-kpi-card__icon">
                <ShoppingCart size={16} />
              </div>
              <span className="pulse-kpi-card__label">TOTAL PRODUCT SALES</span>
            </div>
            <div className="pulse-kpi-card__val">{formatCurrency(productTotals.salesValue)}</div>
          </div>
        )}
      </div>

      <div className="creators-page__toolbar">
        <SearchBar placeholder="Search creator by name or @handle..." onSearch={handleSearch} />
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Content / Product Sales / All toggle */}
          <div className="cp-perf-tabs">
            <button
              className={`cp-perf-tab ${creatorsViewTab === 'content' ? 'cp-perf-tab--active' : ''}`}
              onClick={() => setCreatorsViewTab('content')}
            >
              <BarChart2 size={13} />
              Content
            </button>
            <button
              className={`cp-perf-tab ${creatorsViewTab === 'product' ? 'cp-perf-tab--active' : ''}`}
              onClick={() => setCreatorsViewTab('product')}
            >
              <Package size={13} />
              Product Sales
            </button>
            <button
              className={`cp-perf-tab ${creatorsViewTab === 'all' ? 'cp-perf-tab--active' : ''}`}
              onClick={() => setCreatorsViewTab('all')}
            >
              <Layers size={13} />
              All Metrics
            </button>
          </div>
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
              { value: '3', label: '3 Campaigns' },
              { value: '2', label: '2 Campaigns' },
              { value: '1', label: '1 Campaign' },
            ]}
          />
        </div>
      </div>

      <DataTable
        key={creatorsViewTab}
        columns={activeColumns}
        data={filtered}
        pageSize={20}
        onRowClick={(row) => navigate(`/creators/${row.id}`)}
        emptyMessage="No creators found matching your criteria."
      />
    </div>
  );
}
