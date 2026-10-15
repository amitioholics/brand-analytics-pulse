import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,  CheckCircle2, Clock, XCircle, DollarSign,
  Search, Filter, Download, ExternalLink, ChevronRight,
  Sparkles, AlertCircle, ShoppingBag, Landmark, ArrowUpRight
} from 'lucide-react';
import { useInvoices } from '../context/InvoiceContext';
import { usePortal } from '../context/PortalContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import Breadcrumb from '../components/common/Breadcrumb';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import EmptyState from '../components/common/EmptyState';
import InvoiceDetailModal from '../components/invoices/InvoiceDetailModal';
import './InvoicesPage.css';

export default function InvoicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { portal, isBrandConnect } = usePortal();
  const {
    invoices,
    pendingCount,
    approvedCount,
    reimbursedCount,
    rejectedCount,
    totalClaimedAmount,
    totalPendingAmount,
    totalApprovedAmount,
    totalReimbursedAmount,
    INVOICE_STATUSES,
  } = useInvoices();

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || 'all');
  const [campaignFilter, setCampaignFilter] = useState(() => searchParams.get('campaign') || 'all');

  // Sync with searchParams if changed
  useEffect(() => {
    const qStatus = searchParams.get('status');
    if (qStatus && qStatus !== statusFilter) {
      setStatusFilter(qStatus);
    }
  }, [searchParams]);

  // Unique campaigns from invoices
  const campaignOptions = useMemo(() => {
    const map = new Map();
    invoices.forEach(inv => map.set(inv.campaignId, inv.campaignName));
    return [
      { value: 'all', label: 'All Campaigns' },
      ...Array.from(map.entries()).map(([id, name]) => ({ value: id, label: name })),
    ];
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Status
      if ((statusFilter === 'pending' || statusFilter === 'under_review') && inv.status !== INVOICE_STATUSES.UNDER_REVIEW && inv.status !== 'Pending Verification') return false;
      if (statusFilter === 'approved' && inv.status !== INVOICE_STATUSES.APPROVED && inv.status !== INVOICE_STATUSES.VERIFIED && inv.status !== 'Reimbursed') return false;
      if (statusFilter === 'rejected' && inv.status !== INVOICE_STATUSES.REJECTED) return false;

      // Campaign
      if (campaignFilter !== 'all' && inv.campaignId !== campaignFilter) return false;

      // Search
      if (search) {
        const q = search.toLowerCase();
        return (
          inv.invoiceNumber.toLowerCase().includes(q) ||
          (inv.primaryOrderId && inv.primaryOrderId.toLowerCase().includes(q)) ||
          inv.creatorName.toLowerCase().includes(q) ||
          inv.creatorHandle.toLowerCase().includes(q) ||
          inv.campaignName.toLowerCase().includes(q) ||
          (inv.description && inv.description.toLowerCase().includes(q)) ||
          (inv.orders && inv.orders.some(o => o.orderId?.toLowerCase().includes(q) || o.invoiceNumber?.toLowerCase().includes(q) || o.productName?.toLowerCase().includes(q)))
        );
      }

      return true;
    });
  }, [invoices, statusFilter, campaignFilter, search, INVOICE_STATUSES]);

  const getStatusBadge = (status) => {
    switch (status) {
      case INVOICE_STATUSES.APPROVED:
      case INVOICE_STATUSES.VERIFIED:
      case 'Reimbursed':
        return {
          bg: '#eef2ff',
          color: '#4f46e5',
          border: '#c7d2fe',
          label: 'Approved',
          icon: CheckCircle2,
        };
      case INVOICE_STATUSES.REJECTED:
        return {
          bg: '#fef2f2',
          color: '#dc2626',
          border: '#fecaca',
          label: 'Rejected',
          icon: XCircle,
        };
      default:
        return {
          bg: '#fef3c7',
          color: '#b45309',
          border: '#fde68a',
          label: 'Under Review',
          icon: Clock,
        };
    }
  };

  const handleStatusTab = (tab) => {
    setStatusFilter(tab);
    if (tab === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', tab);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="invoices-page fade-in">
      <Breadcrumb
        items={[
          { label: isBrandConnect ? 'Brand Connect' : 'Reward Program', to: '/' },
          { label: 'Invoices & Reimbursements' },
        ]}
      />

      {/* Page Header */}
      <div className="invoices-page__header">
        <div>
          <div className="invoices-page__badge">
            <FileText size={14} />
            <span>Creator Reimbursements & Invoice Verification</span>
          </div>
          <h1 className="invoices-page__title">Creator Reimbursement Invoices</h1>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="invoices-page__kpis">
        {/* Total Claimed */}
        <div className="invoices-page__kpi-card">
          <div className="invoices-page__kpi-top">
            <span className="invoices-page__kpi-label">TOTAL CLAIMED</span>
            <div className="invoices-page__kpi-icon" style={{ background: '#f2edfc', color: '#6538ea' }}>
              <FileText size={18} />
            </div>
          </div>
          <div className="invoices-page__kpi-value">{formatCurrency(totalClaimedAmount)}</div>
          <div className="invoices-page__kpi-sub">
            <span>{invoices.length} total invoices submitted</span>
          </div>
        </div>

        {/* Under Review */}
        <div className="invoices-page__kpi-card" style={{ borderColor: pendingCount > 0 ? '#fde68a' : undefined }}>
          <div className="invoices-page__kpi-top">
            <span className="invoices-page__kpi-label" style={{ color: '#b45309' }}>UNDER REVIEW</span>
            <div className="invoices-page__kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="invoices-page__kpi-value" style={{ color: '#d97706' }}>
            {formatCurrency(totalPendingAmount)}
          </div>
          <div className="invoices-page__kpi-sub">
            <span style={{ fontWeight: 700, color: '#b45309' }}>{pendingCount} claims</span>
            <span>awaiting brand verification</span>
          </div>
        </div>

        {/* Approved for Payout */}
        <div className="invoices-page__kpi-card">
          <div className="invoices-page__kpi-top">
            <span className="invoices-page__kpi-label">APPROVED FOR PAYOUT</span>
            <div className="invoices-page__kpi-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="invoices-page__kpi-value">{formatCurrency(totalApprovedAmount)}</div>
          <div className="invoices-page__kpi-sub">
            <span>{approvedCount} verified by brand operations</span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="invoices-page__controls">
        {/* Status Tabs */}
        <div className="invoices-page__status-tabs">
          <button
            type="button"
            className={`invoices-page__tab-btn ${statusFilter === 'all' ? 'invoices-page__tab-btn--active' : ''}`}
            onClick={() => handleStatusTab('all')}
          >
            <span>All Invoices</span>
            <span className="invoices-page__tab-badge">{invoices.length}</span>
          </button>

          <button
            type="button"
            className={`invoices-page__tab-btn ${statusFilter === 'under_review' || statusFilter === 'pending' ? 'invoices-page__tab-btn--active' : ''}`}
            onClick={() => handleStatusTab('under_review')}
          >
            <Clock size={14} color="#d97706" />
            <span>Under Review</span>
            <span
              className="invoices-page__tab-badge"
              style={{
                background: pendingCount > 0 ? '#fef3c7' : undefined,
                color: pendingCount > 0 ? '#92400e' : undefined,
              }}
            >
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            className={`invoices-page__tab-btn ${statusFilter === 'approved' ? 'invoices-page__tab-btn--active' : ''}`}
            onClick={() => handleStatusTab('approved')}
          >
            <CheckCircle2 size={14} color="#4f46e5" />
            <span>Approved</span>
            <span className="invoices-page__tab-badge">{approvedCount}</span>
          </button>

          <button
            type="button"
            className={`invoices-page__tab-btn ${statusFilter === 'rejected' ? 'invoices-page__tab-btn--active' : ''}`}
            onClick={() => handleStatusTab('rejected')}
          >
            <XCircle size={14} color="#dc2626" />
            <span>Rejected</span>
            <span className="invoices-page__tab-badge">{rejectedCount}</span>
          </button>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="invoices-page__filter-row">
          <div className="invoices-page__search-wrap">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by creator, invoice #, or campaign..."
            />
          </div>

          <div className="invoices-page__filter-actions">
            <FilterDropdown
              value={campaignFilter}
              onChange={setCampaignFilter}
              options={campaignOptions}
            />
          </div>
        </div>
      </div>

      {/* Invoices Data Table */}
      {filteredInvoices.length === 0 ? (
        <EmptyState
          message="No invoices found matching your active filter criteria."
          onClear={() => {
            setSearch('');
            setStatusFilter('all');
            setCampaignFilter('all');
          }}
        />
      ) : (
        <div className="invoices-page__table-card">
          <table className="invoices-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>CREATOR</th>
                <th style={{ width: '28%' }}>CAMPAIGN</th>
                <th style={{ width: '16%' }}>CLAIMED AMOUNT</th>
                <th style={{ width: '12%' }}>INVOICES</th>
                <th style={{ width: '12%' }}>STATUS</th>
                <th style={{ width: '4%', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(invoice => {
                const badge = getStatusBadge(invoice.status);
                const BadgeIcon = badge.icon;

                return (
                  <tr
                    key={invoice.id}
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    {/* Creator */}
                    <td>
                      <div className="invoices-table__creator-cell">
                        <div
                          className="invoices-table__avatar"
                          style={{ background: invoice.creatorAvatarColor || 'var(--hp-primary, #6538ea)' }}
                        >
                          {invoice.creatorName.charAt(0)}
                        </div>
                        <div>
                          <div className="invoices-table__creator-name">{invoice.creatorName}</div>
                          <div className="invoices-table__creator-handle">
                            <span>{invoice.creatorHandle}</span>
                            <span
                              style={{
                                background: '#f1f5f9',
                                color: '#475569',
                                padding: '1px 5px',
                                borderRadius: 4,
                                fontSize: 10,
                                fontWeight: 700,
                              }}
                            >
                              {invoice.creatorPlatform}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Campaign */}
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>
                          {invoice.campaignName}
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td>
                      <div className="invoices-table__amount-cell">
                        <span className="invoices-table__amount-val">
                          {formatCurrency(invoice.totalOrderAmount || invoice.totalAmount)}
                        </span>
                      </div>
                    </td>



                    {/* Invoices / Attachments */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                        <FileText size={14} color="var(--hp-primary, #6538ea)" />
                        <span style={{ fontWeight: 600 }}>
                          {(() => {
                            const count = invoice.attachments?.length || invoice.orders?.length || 1;
                            return `${count} ${count === 1 ? 'invoice' : 'invoices'}`;
                          })()}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <BadgeIcon size={12} />
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    {/* Arrow */}
                    <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                      <span className="invoices-table__arrow">
                        <ChevronRight size={18} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Detail & Verification Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onRefresh={() => {
            const updated = invoices.find(inv => inv.id === selectedInvoice.id);
            if (updated) setSelectedInvoice(updated);
          }}
        />
      )}
    </div>
  );
}
