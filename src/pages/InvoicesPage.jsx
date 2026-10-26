import { useState, useMemo } from 'react';
import {
  FileText, CheckCircle2, ChevronRight, Search, ArrowUpDown, Check
} from 'lucide-react';
import { useInvoices } from '../context/InvoiceContext';
import { formatCurrency } from '../utils/formatters';
import InvoiceDetailModal from '../components/invoices/InvoiceDetailModal';
import InvoiceExportButton from '../components/invoices/InvoiceExportButton';
import './InvoicesPage.css';

export default function InvoicesPage() {
  const {
    invoices,
    approvedCount,
    underReviewCount,
    partiallyApprovedCount,
    rejectedCount,
    totalClaimedAmount,
    totalApprovedAmount,
  } = useInvoices();

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('approved'); // 'approved', 'under_review', 'partially_approved', 'rejected'
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Status tab
      if (statusTab === 'approved' && inv.status !== 'Approved' && inv.status !== 'Verified') return false;
      if (statusTab === 'under_review' && inv.status !== 'Under Review' && inv.status !== 'Pending Verification') return false;
      if (statusTab === 'partially_approved' && inv.status !== 'Partially Approved') return false;
      if (statusTab === 'rejected' && inv.status !== 'Rejected') return false;

      // Search by creator name, order ID, invoice number
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
  }, [invoices, statusTab, search, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  return (
    <div className="invoices-page fade-in">
      {/* 1. Header with Badge, Title, Subtitle */}
      <div className="invoices-page__header">
        <div className="invoices-page__badge">
          <FileText size={13} />
          <span>Creator Reimbursements & Invoice Verification</span>
        </div>
        <h1 className="invoices-page__title">Creator Reimbursement Invoices</h1>
        <p className="invoices-page__subtitle">
          Review creator purchase invoices for your campaigns and approve them for payout.
        </p>
      </div>

      {/* 2. Top 2 KPI Cards */}
      <div className="invoices-page__kpis">
        {/* Total Claimed */}
        <div className="invoices-page__kpi-card">
          <div className="invoices-page__kpi-top">
            <div className="invoices-page__kpi-icon invoices-page__kpi-icon--purple">
              <FileText size={15} />
            </div>
            <span className="invoices-page__kpi-label">TOTAL CLAIMED</span>
          </div>
          <div className="invoices-page__kpi-value">{formatCurrency(totalClaimedAmount)}</div>
          <div className="invoices-page__kpi-sub">
            {invoices.length} invoices submitted
          </div>
        </div>

        {/* Approved for Payout */}
        <div className="invoices-page__kpi-card invoices-page__kpi-card--approved">
          <div className="invoices-page__kpi-top">
            <div className="invoices-page__kpi-icon invoices-page__kpi-icon--green">
              <CheckCircle2 size={15} />
            </div>
            <span className="invoices-page__kpi-label">APPROVED FOR PAYOUT</span>
          </div>
          <div className="invoices-page__kpi-value">{formatCurrency(totalApprovedAmount)}</div>
          <div className="invoices-page__kpi-sub">
            {approvedCount} verified by brand
          </div>
        </div>
      </div>

      {/* 3. Controls: Status Pills (Approved, Under Review, Partially Approved, Rejected) + Search */}
      <div className="invoices-page__controls">
        <div className="invoices-page__status-pills">
          <button
            type="button"
            className={`invoices-page__pill-btn ${statusTab === 'approved' ? 'invoices-page__pill-btn--active' : ''}`}
            onClick={() => setStatusTab('approved')}
          >
            <span>Approved</span>
            <span className="invoices-page__pill-count">{approvedCount}</span>
          </button>
          <button
            type="button"
            className={`invoices-page__pill-btn ${statusTab === 'under_review' ? 'invoices-page__pill-btn--active' : ''}`}
            onClick={() => setStatusTab('under_review')}
          >
            <span>Under Review</span>
            <span className="invoices-page__pill-count">{underReviewCount}</span>
          </button>
          <button
            type="button"
            className={`invoices-page__pill-btn ${statusTab === 'partially_approved' ? 'invoices-page__pill-btn--active' : ''}`}
            onClick={() => setStatusTab('partially_approved')}
          >
            <span>Partially Approved</span>
            <span className="invoices-page__pill-count">{partiallyApprovedCount}</span>
          </button>
          <button
            type="button"
            className={`invoices-page__pill-btn ${statusTab === 'rejected' ? 'invoices-page__pill-btn--active' : ''}`}
            onClick={() => setStatusTab('rejected')}
          >
            <span>Rejected</span>
            <span className="invoices-page__pill-count">{rejectedCount}</span>
          </button>
        </div>

        <div className="invoices-page__search-filter-wrap">
          <div className="invoices-page__search-box">
            <Search size={14} className="invoices-page__search-icon" />
            <input
              type="text"
              placeholder="Search by creator name, order ID, invoice"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="invoices-page__search-input"
            />
          </div>

          <InvoiceExportButton
            invoices={invoices}
            filteredInvoices={filteredInvoices}
            campaignName="All Campaigns"
            statusFilter={statusTab}
            buttonText="Export"
            align="right"
          />
        </div>
      </div>

      {/* 4. Table */}
      <div className="invoices-page__table-card">
        <table className="invoices-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                <div className="invoices-table__th-wrap">
                  <span>CREATOR</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th>
                <div className="invoices-table__th-wrap">
                  <span>CAMPAIGN</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('amount')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div className="invoices-table__th-wrap" style={{ justifyContent: 'flex-end' }}>
                  <span>CLAIMED AMOUNT</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ textAlign: 'right' }}>
                <div className="invoices-table__th-wrap" style={{ justifyContent: 'flex-end' }}>
                  <span>INVOICES</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ textAlign: 'right' }}>
                <div className="invoices-table__th-wrap" style={{ justifyContent: 'flex-end' }}>
                  <span>STATUS</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ width: 30 }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No reimbursement claims found.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="invoices-table__row"
                  onClick={() => setSelectedInvoice(inv)}
                >
                  {/* Creator */}
                  <td>
                    <div className="invoices-table__creator-cell">
                      <img
                        src={inv.creatorAvatarUrl || '/creators/thehopestory.png'}
                        alt={inv.creatorName}
                        className="invoices-table__avatar-img"
                      />
                      <div className="invoices-table__creator-meta">
                        <div className="invoices-table__creator-name">{inv.creatorName}</div>
                        <div className="invoices-table__creator-sub">
                          <span className="invoices-table__handle">{inv.creatorHandle}</span>
                          <span className="invoices-table__platform-pill">{inv.creatorPlatform || 'Instagram'}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Campaign */}
                  <td>
                    <div className="invoices-table__campaign-name">
                      {inv.campaignName}
                    </div>
                  </td>

                  {/* Claimed Amount */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="invoices-table__amount">
                      {formatCurrency(inv.totalOrderAmount || inv.totalAmount || 503)}
                    </div>
                  </td>

                  {/* Invoices */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="invoices-table__invoices-count">
                      <FileText size={13} color="#64748b" />
                      <span>{inv.orders?.length || 1} invoice</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="invoices-table__status-wrap">
                      <span className="invoices-table__status-pill">
                        <Check size={12} strokeWidth={2.5} />
                        <span>Approved</span>
                      </span>
                      <span className="invoices-table__status-sub">
                        1 of 1 order approved
                      </span>
                    </div>
                  </td>

                  {/* Arrow */}
                  <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                    <ChevronRight size={16} className="invoices-table__chevron" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
