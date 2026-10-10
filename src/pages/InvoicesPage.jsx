import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText, CheckCircle2, Clock, XCircle, DollarSign,
  Search, Filter, Download, ExternalLink, Eye, ChevronRight,
  Sparkles, AlertCircle, ShoppingBag, Landmark, ArrowUpRight,
  Smartphone, Check
} from 'lucide-react';
import { useInvoices } from '../context/InvoiceContext';
import { usePortal } from '../context/PortalContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import Breadcrumb from '../components/common/Breadcrumb';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import ExportButton from '../components/common/ExportButton';
import EmptyState from '../components/common/EmptyState';
import InvoiceDetailModal from '../components/invoices/InvoiceDetailModal';
import CreatorAppSimulatorModal from '../components/invoices/CreatorAppSimulatorModal';
import './InvoicesPage.css';

export default function InvoicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { portal, isBrandConnect } = usePortal();
  const [showSimulator, setShowSimulator] = useState(false);
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
    resetInvoices,
    INVOICE_STATUSES,
  } = useInvoices();

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || 'all');
  const [campaignFilter, setCampaignFilter] = useState(() => searchParams.get('campaign') || 'all');
  const [categoryFilter, setCategoryFilter] = useState('all');

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

  // Unique categories from invoices
  const categoryOptions = useMemo(() => {
    const set = new Set();
    invoices.forEach(inv => set.add(inv.expenseCategory));
    return [
      { value: 'all', label: 'All Expense Categories' },
      ...Array.from(set).map(cat => ({ value: cat, label: cat })),
    ];
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Status
      if ((statusFilter === 'pending' || statusFilter === 'under_review') && inv.status !== INVOICE_STATUSES.UNDER_REVIEW && inv.status !== 'Pending Verification') return false;
      if (statusFilter === 'approved' && inv.status !== INVOICE_STATUSES.APPROVED && inv.status !== INVOICE_STATUSES.VERIFIED) return false;
      if (statusFilter === 'reimbursed' && inv.status !== INVOICE_STATUSES.REIMBURSED) return false;
      if (statusFilter === 'rejected' && inv.status !== INVOICE_STATUSES.REJECTED) return false;

      // Campaign
      if (campaignFilter !== 'all' && inv.campaignId !== campaignFilter) return false;

      // Category
      if (categoryFilter !== 'all' && inv.expenseCategory !== categoryFilter) return false;

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
  }, [invoices, statusFilter, campaignFilter, categoryFilter, search, INVOICE_STATUSES]);

  const getStatusBadge = (status) => {
    switch (status) {
      case INVOICE_STATUSES.REIMBURSED:
        return {
          bg: '#ecfdf5',
          color: '#059669',
          border: '#a7f3d0',
          label: 'Reimbursed',
          icon: CheckCircle2,
        };
      case INVOICE_STATUSES.APPROVED:
      case INVOICE_STATUSES.VERIFIED:
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
          <p className="invoices-page__subtitle">
            Verify submitted invoices, inspect attached purchase receipts, and track reimbursement requests directly in Pulse.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="btn"
            onClick={() => setShowSimulator(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6538ea 0%, #7c3aed 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(101, 56, 234, 0.25)',
            }}
          >
            <Smartphone size={15} />
            <span>Simulate Creator App (Figma)</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetInvoices}
            title="Reset to default mock invoice records"
            style={{ fontSize: 12 }}
          >
            Reset Demo Data
          </button>
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

        {/* Reimbursed */}
        <div className="invoices-page__kpi-card">
          <div className="invoices-page__kpi-top">
            <span className="invoices-page__kpi-label">REIMBURSED & SETTLED</span>
            <div className="invoices-page__kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <Landmark size={18} />
            </div>
          </div>
          <div className="invoices-page__kpi-value" style={{ color: '#059669' }}>
            {formatCurrency(totalReimbursedAmount)}
          </div>
          <div className="invoices-page__kpi-sub">
            <span>{reimbursedCount} settled with bank UTR</span>
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
            className={`invoices-page__tab-btn ${statusFilter === 'reimbursed' ? 'invoices-page__tab-btn--active' : ''}`}
            onClick={() => handleStatusTab('reimbursed')}
          >
            <CheckCircle2 size={14} color="#059669" />
            <span>Reimbursed</span>
            <span className="invoices-page__tab-badge">{reimbursedCount}</span>
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

            <FilterDropdown
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={categoryOptions}
            />

            <ExportButton
              data={filteredInvoices.map(inv => ({
                InvoiceNumber: inv.invoiceNumber,
                Creator: inv.creatorName,
                Handle: inv.creatorHandle,
                Campaign: inv.campaignName,
                Category: inv.expenseCategory,
                SubmittedDate: inv.submittedAt,
                Amount: inv.totalAmount,
                Status: inv.status,
                VerifiedBy: inv.verifiedBy || '-',
                PaymentRef: inv.paymentReference || '-',
              }))}
              filename="haulpack-pulse-creator-invoices"
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
            setCategoryFilter('all');
          }}
        />
      ) : (
        <div className="invoices-page__table-card">
          <table className="invoices-table">
            <thead>
              <tr>
                <th style={{ width: '18%' }}>INVOICE & ORDER ID</th>
                <th style={{ width: '20%' }}>CREATOR</th>
                <th style={{ width: '20%' }}>CAMPAIGN & BRIEF</th>
                <th style={{ width: '13%' }}>CLAIMED AMOUNT</th>
                <th style={{ width: '10%' }}>DELIVERY</th>
                <th style={{ width: '9%' }}>PROOFS</th>
                <th style={{ width: '12%' }}>STATUS</th>
                <th style={{ width: '8%', textAlign: 'right' }}>ACTION</th>
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
                    {/* Invoice ID & Order ID */}
                    <td>
                      <div className="invoices-table__inv-cell">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="invoices-table__inv-num">{invoice.invoiceNumber}</span>
                          {invoice.orders && invoice.orders.length > 1 && (
                            <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 4 }}>
                              {invoice.orders.length} Orders
                            </span>
                          )}
                        </div>
                        <span className="invoices-table__inv-date" style={{ color: '#475569', fontWeight: 600 }}>
                          Order #{invoice.primaryOrderId || invoice.invoiceNumber}
                        </span>
                        <span className="invoices-table__inv-date" style={{ fontSize: 11, color: '#94a3b8' }}>
                          📅 {formatDate(invoice.orderDate || invoice.invoiceDate)}
                        </span>
                      </div>
                    </td>

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

                    {/* Campaign & Category */}
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>
                          {invoice.campaignName}
                        </div>
                        <div style={{ marginTop: 3 }}>
                          <span
                            style={{
                              background: 'var(--hp-primary-lighter, #f2edfc)',
                              color: 'var(--hp-primary, #6538ea)',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              display: 'inline-block',
                            }}
                          >
                            {invoice.expenseCategory}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td>
                      <div className="invoices-table__amount-cell">
                        <span className="invoices-table__amount-val">
                          {formatCurrency(invoice.totalOrderAmount || invoice.totalAmount)}
                        </span>
                        <span className="invoices-table__amount-tax">
                          Subtotal {formatCurrency(invoice.subtotal || invoice.totalOrderAmount || invoice.totalAmount)}
                        </span>
                      </div>
                    </td>

                    {/* Delivery Status */}
                    <td>
                      <span
                        style={{
                          background: '#ecfdf5',
                          color: '#065f46',
                          border: '1px solid #a7f3d0',
                          padding: '2px 8px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Check size={11} />
                        <span>Received</span>
                      </span>
                    </td>

                    {/* Proofs / Attachments */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                        <FileText size={14} color="var(--hp-primary, #6538ea)" />
                        <span style={{ fontWeight: 600 }}>{invoice.attachments?.length || invoice.orders?.length || 1} proofs</span>
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

                    {/* Action */}
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="invoices-table__action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInvoice(invoice);
                        }}
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
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

      {/* Figma Creator App Mobile Simulator Modal */}
      {showSimulator && (
        <CreatorAppSimulatorModal
          onClose={() => setShowSimulator(false)}
          onSubmitted={(newClaim) => {
            setSelectedInvoice(newClaim);
          }}
        />
      )}
    </div>
  );
}
