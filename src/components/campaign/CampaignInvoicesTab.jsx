import { useState, useMemo } from 'react';
import {
  FileText, CheckCircle2, Clock, XCircle, DollarSign,
  Download, Eye, Search, AlertCircle, Sparkles
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useInvoices } from '../../context/InvoiceContext';
import SearchBar from '../common/SearchBar';
import ExportButton from '../common/ExportButton';
import EmptyState from '../common/EmptyState';
import InvoiceDetailModal from '../invoices/InvoiceDetailModal';
import './CampaignInvoicesTab.css';

export default function CampaignInvoicesTab({ campaignId, campaignName }) {
  const { invoices, INVOICE_STATUSES } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter invoices for this campaign
  const campaignInvoices = useMemo(() => {
    return invoices.filter(inv => inv.campaignId === campaignId);
  }, [invoices, campaignId]);

  // Campaign specific stats
  const totalClaimed = useMemo(() => campaignInvoices.reduce((s, inv) => s + (inv.totalOrderAmount || inv.totalAmount || 0), 0), [campaignInvoices]);
  const pendingInvoices = useMemo(() => campaignInvoices.filter(inv => inv.status === INVOICE_STATUSES.UNDER_REVIEW || inv.status === 'Pending Verification'), [campaignInvoices, INVOICE_STATUSES]);
  const pendingAmount = useMemo(() => pendingInvoices.reduce((s, inv) => s + (inv.totalOrderAmount || inv.totalAmount || 0), 0), [pendingInvoices]);
  const approvedInvoices = useMemo(() => campaignInvoices.filter(inv => inv.status === INVOICE_STATUSES.APPROVED || inv.status === INVOICE_STATUSES.VERIFIED || inv.status === 'Reimbursed'), [campaignInvoices, INVOICE_STATUSES]);
  const approvedAmount = useMemo(() => approvedInvoices.reduce((s, inv) => s + (inv.totalOrderAmount || inv.totalAmount || 0), 0), [approvedInvoices]);

  // Search and status filtered
  const filteredList = useMemo(() => {
    return campaignInvoices.filter(inv => {
      if ((statusFilter === 'pending' || statusFilter === 'under_review') && inv.status !== INVOICE_STATUSES.UNDER_REVIEW && inv.status !== 'Pending Verification') return false;
      if (statusFilter === 'approved' && inv.status !== INVOICE_STATUSES.APPROVED && inv.status !== INVOICE_STATUSES.VERIFIED && inv.status !== 'Reimbursed') return false;
      if (statusFilter === 'rejected' && inv.status !== INVOICE_STATUSES.REJECTED) return false;

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return (
          inv.invoiceNumber.toLowerCase().includes(q) ||
          (inv.primaryOrderId && inv.primaryOrderId.toLowerCase().includes(q)) ||
          inv.creatorName.toLowerCase().includes(q) ||
          inv.creatorHandle.toLowerCase().includes(q) ||
          (inv.description && inv.description.toLowerCase().includes(q)) ||
          (inv.orders && inv.orders.some(o => o.orderId?.toLowerCase().includes(q) || o.invoiceNumber?.toLowerCase().includes(q)))
        );
      }
      return true;
    });
  }, [campaignInvoices, statusFilter, search, INVOICE_STATUSES]);

  const getStatusBadge = (invoice) => {
    const status = typeof invoice === 'string' ? invoice : invoice?.status;
    const orders = typeof invoice === 'object' && invoice?.orders ? invoice.orders : [];
    const totalOrders = orders.length || invoice?.ordersCount || 1;

    const approvedCount = orders.filter(o =>
      o.status === INVOICE_STATUSES.APPROVED || o.status === 'Approved' || o.status === 'Verified' || o.status === 'Reimbursed'
    ).length;
    const rejectedCount = orders.filter(o =>
      o.status === INVOICE_STATUSES.REJECTED || o.status === 'Rejected'
    ).length;
    const pendingCount = orders.filter(o =>
      o.status === INVOICE_STATUSES.UNDER_REVIEW || o.status === 'Under Review' || o.status === 'Pending Verification' || !o.status
    ).length;

    const isPartiallyApproved = status === INVOICE_STATUSES.PARTIALLY_APPROVED ||
      status === 'Partially Approved' ||
      (approvedCount > 0 && (rejectedCount > 0 || pendingCount > 0));

    const isApproved = !isPartiallyApproved && (
      status === INVOICE_STATUSES.APPROVED ||
      status === 'Approved' ||
      status === INVOICE_STATUSES.VERIFIED ||
      status === 'Reimbursed'
    );

    const isRejected = !isPartiallyApproved && (
      status === INVOICE_STATUSES.REJECTED ||
      status === 'Rejected'
    );

    if (isPartiallyApproved) {
      let subtext = `${approvedCount} approved · ${rejectedCount > 0 ? `${rejectedCount} rejected` : `${pendingCount} pending`}`;
      if (rejectedCount > 0 && pendingCount > 0) {
        subtext = `${approvedCount} approved · ${rejectedCount} rejected`;
      }
      return {
        bg: '#f3e8ff',
        color: '#7c3aed',
        border: '#ddd6fe',
        label: 'Partially Approved',
        icon: CheckCircle2,
        subtext,
      };
    }

    if (isApproved) {
      const displayApproved = approvedCount || totalOrders;
      return {
        bg: '#eef2ff',
        color: '#4f46e5',
        border: '#c7d2fe',
        label: 'Approved',
        icon: CheckCircle2,
        subtext: `${displayApproved} of ${totalOrders} ${totalOrders === 1 ? 'order' : 'orders'} approved`,
      };
    }

    if (isRejected) {
      const displayRejected = rejectedCount || totalOrders;
      return {
        bg: '#fef2f2',
        color: '#dc2626',
        border: '#fecaca',
        label: 'Rejected',
        icon: XCircle,
        subtext: `${displayRejected} of ${totalOrders} ${totalOrders === 1 ? 'order' : 'orders'} rejected`,
      };
    }

    return {
      bg: '#fef3c7',
      color: '#b45309',
      border: '#fde68a',
      label: 'Under Review',
      icon: Clock,
      subtext: `0 approved · ${totalOrders} pending`,
    };
  };

  return (
    <div className="camp-invoices-tab">
      {/* Campaign Invoice KPIs */}
      <div className="camp-invoices-tab__kpis">
        <div className="camp-invoices-tab__kpi">
          <div className="camp-invoices-tab__kpi-top">
            <span className="camp-invoices-tab__kpi-label">TOTAL CLAIMED</span>
            <FileText size={16} color="var(--hp-primary, #6538ea)" />
          </div>
          <div className="camp-invoices-tab__kpi-value">{formatCurrency(totalClaimed)}</div>
          <div className="camp-invoices-tab__kpi-sub">{campaignInvoices.length} invoices submitted for this campaign</div>
        </div>

        <div className="camp-invoices-tab__kpi" style={{ borderColor: pendingInvoices.length > 0 ? '#fde68a' : undefined }}>
          <div className="camp-invoices-tab__kpi-top">
            <span className="camp-invoices-tab__kpi-label" style={{ color: '#b45309' }}>UNDER REVIEW</span>
            <Clock size={16} color="#d97706" />
          </div>
          <div className="camp-invoices-tab__kpi-value" style={{ color: '#d97706' }}>{formatCurrency(pendingAmount)}</div>
          <div className="camp-invoices-tab__kpi-sub">
            <strong style={{ color: '#b45309' }}>{pendingInvoices.length} claims</strong> need brand review
          </div>
        </div>

        <div className="camp-invoices-tab__kpi">
          <div className="camp-invoices-tab__kpi-top">
            <span className="camp-invoices-tab__kpi-label">APPROVED FOR PAYOUT</span>
            <CheckCircle2 size={16} color="#4f46e5" />
          </div>
          <div className="camp-invoices-tab__kpi-value">{formatCurrency(approvedAmount)}</div>
          <div className="camp-invoices-tab__kpi-sub">{approvedInvoices.length} approved & scheduled</div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="camp-invoices-tab__controls">
        <div className="camp-invoices-tab__status-pills">
          <button
            type="button"
            className={`camp-invoices-tab__pill ${statusFilter === 'all' ? 'camp-invoices-tab__pill--active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <span>All ({campaignInvoices.length})</span>
          </button>
          <button
            type="button"
            className={`camp-invoices-tab__pill ${statusFilter === 'pending' || statusFilter === 'under_review' ? 'camp-invoices-tab__pill--active' : ''}`}
            onClick={() => setStatusFilter('under_review')}
          >
            <Clock size={13} color="#d97706" />
            <span>Under Review ({pendingInvoices.length})</span>
          </button>
          <button
            type="button"
            className={`camp-invoices-tab__pill ${statusFilter === 'approved' ? 'camp-invoices-tab__pill--active' : ''}`}
            onClick={() => setStatusFilter('approved')}
          >
            <CheckCircle2 size={13} color="#4f46e5" />
            <span>Approved ({approvedInvoices.length})</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'flex-end', minWidth: 260 }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search campaign invoices..."
          />
          <ExportButton
            data={filteredList.map(inv => ({
              Invoice: inv.invoiceNumber,
              Creator: inv.creatorName,
              Category: inv.expenseCategory,
              Amount: inv.totalAmount,
              Status: inv.status,
              Date: inv.invoiceDate,
            }))}
            filename={`${campaignName || 'campaign'}-invoices`}
          />
        </div>
      </div>

      {/* Invoices List Table */}
      {filteredList.length === 0 ? (
        <EmptyState
          message="No invoices submitted under this filter criteria for this campaign."
          onClear={() => {
            setSearch('');
            setStatusFilter('all');
          }}
        />
      ) : (
        <div className="camp-invoices-tab__table-wrap">
          <table className="camp-invoices-table">
            <thead>
              <tr>
                <th style={{ width: '16%' }}>ORDER ID</th>
                <th style={{ width: '24%' }}>CREATOR</th>
                <th style={{ width: '22%' }}>EXPENSE CATEGORY</th>
                <th style={{ width: '14%' }}>CLAIMED (₹)</th>
                <th style={{ width: '10%' }}>INVOICES</th>
                <th style={{ width: '14%' }}>STATUS</th>
                <th style={{ width: '10%', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map(invoice => {
                const badge = getStatusBadge(invoice);
                const BadgeIcon = badge.icon;
                return (
                  <tr
                    key={invoice.id}
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    <td>
                      <div>
                        <span style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--hp-primary, #6538ea)', fontSize: 13 }}>
                          Order #{invoice.primaryOrderId || invoice.invoiceNumber}
                        </span>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                          📅 {formatDate(invoice.orderDate || invoice.invoiceDate)}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: invoice.creatorAvatarColor || 'var(--hp-primary, #6538ea)',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {invoice.creatorName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{invoice.creatorName}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{invoice.creatorHandle}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          background: 'var(--hp-primary-lighter, #f2edfc)',
                          color: 'var(--hp-primary, #6538ea)',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {invoice.expenseCategory}
                      </span>
                    </td>

                    <td>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                          {formatCurrency(invoice.totalAmount)}
                        </div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>
                          {invoice.taxRate}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569' }}>
                        <FileText size={13} color="var(--hp-primary, #6538ea)" />
                        <span style={{ fontWeight: 600 }}>
                          {(() => {
                            const count = invoice.attachments?.length || 1;
                            return `${count} ${count === 1 ? 'invoice' : 'invoices'}`;
                          })()}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                        <span
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            padding: '3px 8px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <BadgeIcon size={12} />
                          <span>{badge.label}</span>
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {badge.subtext}
                        </span>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="camp-invoices-table__action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInvoice(invoice);
                        }}
                      >
                        <Eye size={12} />
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

      {/* Invoice Detail Modal */}
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
