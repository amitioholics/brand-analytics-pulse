import { useState, useMemo, useEffect } from 'react';
import {
  FileText, CheckCircle2, ChevronRight, ChevronLeft, Search, ArrowUpDown, Check, Clock, AlertCircle, X
} from 'lucide-react';
import { useInvoices } from '../../context/InvoiceContext';
import { formatCurrency } from '../../utils/formatters';
import InvoiceDetailModal from '../invoices/InvoiceDetailModal';
import InvoiceExportButton from '../invoices/InvoiceExportButton';
import './CampaignReimbursementsSection.css';

export default function CampaignReimbursementsSection({ campaignId }) {
  const { invoices } = useInvoices();

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('approved'); // 'approved', 'under_review', 'partially_approved', 'rejected'
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Filter invoices for this specific campaign
  const campaignInvoices = useMemo(() => {
    if (!campaignId) return invoices;
    return invoices.filter(inv => inv.campaignId === campaignId);
  }, [invoices, campaignId]);

  // Status counts for this campaign
  const approvedCount = useMemo(() =>
    campaignInvoices.filter(inv => inv.status === 'Approved' || inv.status === 'Verified' || inv.status === 'Reimbursed').length,
    [campaignInvoices]
  );
  const underReviewCount = useMemo(() =>
    campaignInvoices.filter(inv => inv.status === 'Under Review' || inv.status === 'Pending Verification').length,
    [campaignInvoices]
  );
  const partiallyApprovedCount = useMemo(() =>
    campaignInvoices.filter(inv => inv.status === 'Partially Approved').length,
    [campaignInvoices]
  );
  const rejectedCount = useMemo(() =>
    campaignInvoices.filter(inv => inv.status === 'Rejected').length,
    [campaignInvoices]
  );

  const totalClaimedAmount = useMemo(() =>
    campaignInvoices.reduce((s, inv) => s + (inv.totalAmount || inv.totalOrderAmount || 0), 0),
    [campaignInvoices]
  );
  const totalApprovedAmount = useMemo(() =>
    campaignInvoices
      .filter(inv => inv.status === 'Approved' || inv.status === 'Verified' || inv.status === 'Reimbursed')
      .reduce((s, inv) => s + (inv.totalAmount || inv.totalOrderAmount || 0), 0),
    [campaignInvoices]
  );

  // Filtered invoices by active status tab and search query
  const filteredInvoices = useMemo(() => {
    return campaignInvoices.filter(inv => {
      // Status tab
      if (statusTab === 'approved' && inv.status !== 'Approved' && inv.status !== 'Verified') return false;
      if (statusTab === 'under_review' && inv.status !== 'Under Review' && inv.status !== 'Pending Verification') return false;
      if (statusTab === 'partially_approved' && inv.status !== 'Partially Approved') return false;
      if (statusTab === 'rejected' && inv.status !== 'Rejected') return false;

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return (
          inv.creatorName?.toLowerCase().includes(q) ||
          inv.creatorHandle?.toLowerCase().includes(q) ||
          inv.invoiceNumber?.toLowerCase().includes(q) ||
          inv.primaryOrderId?.toLowerCase().includes(q) ||
          inv.campaignName?.toLowerCase().includes(q) ||
          (inv.orders && inv.orders.some(o =>
            o.orderId?.toLowerCase().includes(q) ||
            o.invoiceNumber?.toLowerCase().includes(q)
          ))
        );
      }

      return true;
    }).sort((a, b) => {
      let valA = a.creatorName || '';
      let valB = b.creatorName || '';
      if (sortField === 'amount') {
        valA = a.totalAmount || a.totalOrderAmount || 0;
        valB = b.totalAmount || b.totalOrderAmount || 0;
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [campaignInvoices, statusTab, search, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // Pagination (Max 10 items per page)
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusTab, search]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedInvoices = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, safePage, pageSize]);

  const renderStatusBadge = (inv) => {
    const status = inv.status || 'Approved';
    if (status === 'Approved' || status === 'Verified' || status === 'Reimbursed') {
      return (
        <div className="campaign-reimb__status-wrap">
          <span className="campaign-reimb__status-pill campaign-reimb__status-pill--approved">
            <Check size={12} strokeWidth={2.5} />
            <span>Approved</span>
          </span>
          <span className="campaign-reimb__status-sub">
            {inv.orders?.length ? `${inv.orders.length} of ${inv.orders.length} order approved` : '1 of 1 order approved'}
          </span>
        </div>
      );
    }
    if (status === 'Under Review' || status === 'Pending Verification') {
      return (
        <div className="campaign-reimb__status-wrap">
          <span className="campaign-reimb__status-pill campaign-reimb__status-pill--pending">
            <Clock size={12} strokeWidth={2.5} />
            <span>Under Review</span>
          </span>
          <span className="campaign-reimb__status-sub">Awaiting verification</span>
        </div>
      );
    }
    if (status === 'Partially Approved') {
      return (
        <div className="campaign-reimb__status-wrap">
          <span className="campaign-reimb__status-pill campaign-reimb__status-pill--partial">
            <AlertCircle size={12} strokeWidth={2.5} />
            <span>Partially Approved</span>
          </span>
          <span className="campaign-reimb__status-sub">Partial reimbursement</span>
        </div>
      );
    }
    return (
      <div className="campaign-reimb__status-wrap">
        <span className="campaign-reimb__status-pill campaign-reimb__status-pill--rejected">
          <X size={12} strokeWidth={2.5} />
          <span>Rejected</span>
        </span>
        <span className="campaign-reimb__status-sub">Verification declined</span>
      </div>
    );
  };

  return (
    <div className="campaign-pulse__card campaign-reimb-card" id="reimbursements">
      {/* 1. Header with Badge, Title, Count, Subtitle */}
      <div className="campaign-reimb__header">
        <div className="campaign-reimb__header-left">
          <div className="campaign-reimb__badge">
            <FileText size={12} />
            <span>Creator Reimbursements & Invoice Verification</span>
          </div>
          <h2 className="campaign-reimb__title">
            <span>Creator Reimbursement Invoices</span>
            <span className="campaign-reimb__count">{campaignInvoices.length}</span>
          </h2>
          <p className="campaign-reimb__subtitle">
            Review creator purchase invoices for your campaigns and approve them for payout.
          </p>
        </div>
      </div>

      {/* 2. Top 2 KPI Cards */}
      <div className="campaign-reimb__kpis">
        {/* Total Claimed */}
        <div className="campaign-reimb__kpi-card">
          <div className="campaign-reimb__kpi-icon campaign-reimb__kpi-icon--purple">
            <FileText size={18} />
          </div>
          <div className="campaign-reimb__kpi-info">
            <span className="campaign-reimb__kpi-label">TOTAL CLAIMED</span>
            <div className="campaign-reimb__kpi-val">{formatCurrency(totalClaimedAmount)}</div>
            <div className="campaign-reimb__kpi-sub">
              {campaignInvoices.length} {campaignInvoices.length === 1 ? 'invoice' : 'invoices'} submitted
            </div>
          </div>
        </div>

        {/* Approved for Payout */}
        <div className="campaign-reimb__kpi-card campaign-reimb__kpi-card--green">
          <div className="campaign-reimb__kpi-icon campaign-reimb__kpi-icon--green">
            <CheckCircle2 size={18} />
          </div>
          <div className="campaign-reimb__kpi-info">
            <span className="campaign-reimb__kpi-label">APPROVED FOR PAYOUT</span>
            <div className="campaign-reimb__kpi-val campaign-reimb__kpi-val--green">{formatCurrency(totalApprovedAmount)}</div>
            <div className="campaign-reimb__kpi-sub">
              {approvedCount} verified by brand
            </div>
          </div>
        </div>
      </div>

      {/* 3. Controls: Status Pills (Approved, Under Review, Partially Approved, Rejected) + Search */}
      <div className="campaign-reimb__controls">
        <div className="campaign-reimb__pills">
          <button
            type="button"
            className={`campaign-reimb__pill-btn ${statusTab === 'approved' ? 'campaign-reimb__pill-btn--active' : ''}`}
            onClick={() => setStatusTab('approved')}
          >
            <span>Approved</span>
            <span className="campaign-reimb__pill-count">{approvedCount}</span>
          </button>
          <button
            type="button"
            className={`campaign-reimb__pill-btn ${statusTab === 'under_review' ? 'campaign-reimb__pill-btn--active' : ''}`}
            onClick={() => setStatusTab('under_review')}
          >
            <span>Under Review</span>
            <span className="campaign-reimb__pill-count">{underReviewCount}</span>
          </button>
          <button
            type="button"
            className={`campaign-reimb__pill-btn ${statusTab === 'partially_approved' ? 'campaign-reimb__pill-btn--active' : ''}`}
            onClick={() => setStatusTab('partially_approved')}
          >
            <span>Partially Approved</span>
            <span className="campaign-reimb__pill-count">{partiallyApprovedCount}</span>
          </button>
          <button
            type="button"
            className={`campaign-reimb__pill-btn ${statusTab === 'rejected' ? 'campaign-reimb__pill-btn--active' : ''}`}
            onClick={() => setStatusTab('rejected')}
          >
            <span>Rejected</span>
            <span className="campaign-reimb__pill-count">{rejectedCount}</span>
          </button>
        </div>

        <div className="campaign-reimb__controls-right">
          <div className="campaign-reimb__search-box">
            <Search size={14} className="campaign-reimb__search-icon" />
            <input
              type="text"
              placeholder="Search by creator name, order ID, invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="campaign-reimb__search-input"
            />
          </div>

          <InvoiceExportButton
            invoices={campaignInvoices}
            filteredInvoices={filteredInvoices}
            campaignName={campaignInvoices[0]?.campaignName || 'HaulPack x Amazon Head & Shoulders'}
            statusFilter={statusTab}
            buttonText="Export"
            align="right"
          />
        </div>
      </div>

      {/* 4. Invoices Table */}
      <div className="campaign-reimb__table-container">
        <table className="campaign-reimb__table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', width: '28%' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span>CREATOR</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th style={{ width: '30%' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span>CAMPAIGN</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th onClick={() => handleSort('amount')} style={{ cursor: 'pointer', textAlign: 'right', width: '15%' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                  <span>CLAIMED AMOUNT</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th style={{ textAlign: 'right', width: '12%' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                  <span>INVOICES</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th style={{ textAlign: 'right', width: '15%' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                  <span>STATUS</span>
                  <ArrowUpDown size={11} />
                </div>
              </th>
              <th style={{ width: '30px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No reimbursement claims found for this status.
                </td>
              </tr>
            ) : (
              paginatedInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="campaign-reimb__row"
                  onClick={() => setSelectedInvoice(inv)}
                >
                  {/* Creator */}
                  <td>
                    <div className="campaign-reimb__creator-cell">
                      <img
                        src={inv.creatorAvatarUrl || '/creators/thehopestory.png'}
                        alt={inv.creatorName}
                        className="campaign-reimb__avatar-img"
                      />
                      <div className="campaign-reimb__creator-meta">
                        <div className="campaign-reimb__creator-name">{inv.creatorName}</div>
                        <div className="campaign-reimb__creator-sub">
                          <span className="campaign-reimb__handle">{inv.creatorHandle}</span>
                          <span className="campaign-reimb__platform-pill">• {inv.creatorPlatform || 'Instagram'}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Campaign */}
                  <td>
                    <div className="campaign-reimb__campaign-name">
                      {inv.campaignName}
                    </div>
                  </td>

                  {/* Claimed Amount */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="campaign-reimb__amount">
                      {formatCurrency(inv.totalOrderAmount || inv.totalAmount || 503)}
                    </div>
                  </td>

                  {/* Invoices */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="campaign-reimb__invoices-count">
                      <FileText size={13} color="#64748b" />
                      <span>{inv.orders?.length || 1} invoice</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ textAlign: 'right' }}>
                    {renderStatusBadge(inv)}
                  </td>

                  {/* Arrow */}
                  <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                    <ChevronRight size={16} className="campaign-reimb__chevron" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Pagination Controls (Max 10 per page) */}
      {filteredInvoices.length > 0 && (
        <div className="campaign-reimb__pagination">
          <div className="campaign-reimb__pagination-info">
            <span>
              Showing <strong>{(safePage - 1) * pageSize + 1}</strong> to <strong>{Math.min(safePage * pageSize, filteredInvoices.length)}</strong> of <strong>{filteredInvoices.length}</strong> {filteredInvoices.length === 1 ? 'invoice' : 'invoices'}
            </span>
            <span className="campaign-reimb__pagination-badge">10 per page</span>
          </div>

          {totalPages > 1 && (
            <div className="campaign-reimb__pagination-controls">
              <button
                type="button"
                className="campaign-reimb__pagination-btn"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                title="Previous page"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              <div className="campaign-reimb__pagination-pages">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      className={`campaign-reimb__pagination-page-btn ${safePage === pageNum ? 'campaign-reimb__pagination-page-btn--active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="campaign-reimb__pagination-btn"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                title="Next page"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reimbursement Claim Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
