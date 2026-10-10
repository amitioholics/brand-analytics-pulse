import { useState } from 'react';
import {
  X, CheckCircle2, XCircle, AlertCircle, FileText, Download,
  ExternalLink, Calendar, User, Building, Landmark, CreditCard,
  Clock, ArrowRight, ShieldCheck, Printer, Eye, Tag, Sparkles,
  Check, DollarSign, ChevronRight, Hash, Phone, Mail, ShoppingBag, Copy
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useInvoices } from '../../context/InvoiceContext';
import PulseLogo from '../common/PulseLogo';
import './InvoiceDetailModal.css';

const REJECTION_REASONS = [
  'Missing official Myntra tax invoice or verified order number',
  'Amount claimed does not match the attached proof of purchase',
  'Product was not part of the approved campaign brief / styling palette',
  'Expense incurred outside the campaign duration / eligibility dates',
  'Duplicate reimbursement request previously settled',
  'Other / Custom feedback reason',
];

export default function InvoiceDetailModal({ invoice, onClose, onRefresh }) {
  const { verifyInvoice, rejectInvoice, reimburseInvoice, reopenInvoice, INVOICE_STATUSES } = useInvoices();

  const [activeTab, setActiveTab] = useState('submitted_orders'); // 'submitted_orders' | 'tax_invoice'
  const [copiedText, setCopiedText] = useState('');
  const [activeReceiptPreview, setActiveReceiptPreview] = useState(null);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [selectedRejectReason, setSelectedRejectReason] = useState(REJECTION_REASONS[0]);
  const [customRejectNote, setCustomRejectNote] = useState('');
  const [verificationNote, setVerificationNote] = useState(invoice?.verificationNotes || '');
  const [utrInput, setUtrInput] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const handleCopy = (txt) => {
    navigator.clipboard?.writeText(txt);
    setCopiedText(txt);
    setTimeout(() => setCopiedText(''), 2000);
  };

  if (!invoice) return null;

  const isPending = invoice.status === INVOICE_STATUSES.PENDING;
  const isApproved = invoice.status === INVOICE_STATUSES.APPROVED || invoice.status === INVOICE_STATUSES.VERIFIED;
  const isReimbursed = invoice.status === INVOICE_STATUSES.REIMBURSED;
  const isRejected = invoice.status === INVOICE_STATUSES.REJECTED;

  // Handlers
  const handleApprove = () => {
    verifyInvoice(invoice.id, verificationNote);
    setActionSuccessMsg('Invoice approved for reimbursement disbursement!');
    setTimeout(() => setActionSuccessMsg(''), 4000);
    if (onRefresh) onRefresh();
  };

  const handleReject = () => {
    const finalReason = selectedRejectReason === 'Other / Custom feedback reason' && customRejectNote
      ? customRejectNote
      : selectedRejectReason;
    rejectInvoice(invoice.id, finalReason, customRejectNote);
    setShowRejectBox(false);
    setActionSuccessMsg('Reimbursement request rejected. Creator notified with feedback.');
    setTimeout(() => setActionSuccessMsg(''), 4000);
    if (onRefresh) onRefresh();
  };

  const handleSettle = () => {
    reimburseInvoice(invoice.id, utrInput, verificationNote);
    setActionSuccessMsg('Marked as reimbursed! Payment settlement recorded.');
    setTimeout(() => setActionSuccessMsg(''), 4000);
    if (onRefresh) onRefresh();
  };

  const handleReopen = () => {
    reopenInvoice(invoice.id);
    setActionSuccessMsg('Invoice reopened for review.');
    setTimeout(() => setActionSuccessMsg(''), 4000);
    if (onRefresh) onRefresh();
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadgeStyle = () => {
    switch (invoice.status) {
      case INVOICE_STATUSES.REIMBURSED:
        return { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
      case INVOICE_STATUSES.APPROVED:
      case INVOICE_STATUSES.VERIFIED:
        return { bg: '#eef2ff', color: '#4f46e5', border: '#c7d2fe' };
      case INVOICE_STATUSES.REJECTED:
        return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
      default:
        return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
    }
  };

  const badgeStyle = getStatusBadgeStyle();

  return (
    <div className="invoice-modal-overlay" onClick={onClose}>
      <div className="invoice-modal" onClick={e => e.stopPropagation()}>
        {/* Top Header */}
        <div className="invoice-modal__header">
          <div className="invoice-modal__header-left">
            <div className="invoice-modal__header-icon">
              <FileText size={22} />
            </div>
            <div className="invoice-modal__header-title-box">
              <h2 className="invoice-modal__header-inv-num">
                <span>{invoice.invoiceNumber}</span>
                <span
                  style={{
                    background: badgeStyle.bg,
                    color: badgeStyle.color,
                    border: `1px solid ${badgeStyle.border}`,
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {invoice.status}
                </span>
              </h2>
              <span className="invoice-modal__header-meta">
                Submitted on {formatDate(invoice.submittedAt)} • {invoice.campaignName}
              </span>
            </div>
          </div>

          <div className="invoice-modal__header-right">
            <button
              type="button"
              className="invoice-modal__header-btn"
              onClick={handlePrint}
              title="Print / Save PDF"
            >
              <Printer size={15} />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              className="invoice-modal__close-btn"
              onClick={onClose}
              title="Close Modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {actionSuccessMsg && (
          <div
            style={{
              background: '#ecfdf5',
              color: '#065f46',
              borderBottom: '1px solid #a7f3d0',
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Modal Body: Left Invoice Paper + Right Decision Panel */}
        <div className="invoice-modal__body">
          {/* Left Column: Official Invoice Paper or Figma Orders View */}
          <div className="invoice-modal__paper-wrapper">
            {/* View Switcher Tabs */}
            <div className="invoice-modal__tab-strip">
              <button
                type="button"
                className={`invoice-modal__tab-btn ${activeTab === 'submitted_orders' ? 'invoice-modal__tab-btn--active' : ''}`}
                onClick={() => setActiveTab('submitted_orders')}
              >
                <ShoppingBag size={14} />
                <span>Submitted Orders</span>
                <span className="invoice-modal__tab-badge">
                  {invoice.orders?.length || 1}
                </span>
              </button>
              <button
                type="button"
                className={`invoice-modal__tab-btn ${activeTab === 'tax_invoice' ? 'invoice-modal__tab-btn--active' : ''}`}
                onClick={() => setActiveTab('tax_invoice')}
              >
                <FileText size={14} />
                <span>Tax Invoice Sheet</span>
              </button>
            </div>

            {activeTab === 'submitted_orders' ? (
              /* Figma Submitted Orders View (Matching Mobile App Screen 3) */
              <div className="invoice-modal__orders-view">
                <div className="invoice-modal__orders-intro">
                  <div>
                    <div className="invoice-modal__orders-intro-title">
                      Creator Mobile Submission Flow
                    </div>
                    <div className="invoice-modal__orders-intro-sub">
                      Order ID, invoice details, and proofs input by creator via HaulPack App
                    </div>
                  </div>
                  <span
                    style={{
                      background: 'var(--hp-primary-lighter, #f2edfc)',
                      color: 'var(--hp-primary, #6538ea)',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {invoice.orders?.length || 1} Orders Attached
                  </span>
                </div>

                {(invoice.orders && invoice.orders.length > 0 ? invoice.orders : [
                  {
                    orderIndex: 1,
                    orderId: invoice.primaryOrderId || invoice.invoiceNumber,
                    invoiceNumber: invoice.invoiceNumber,
                    orderDate: invoice.orderDate || invoice.invoiceDate,
                    orderAmount: invoice.totalOrderAmount || invoice.totalAmount,
                    submittedDate: invoice.submittedDate || '12 Sep, 2026',
                    productName: invoice.description || 'Campaign Brief Required Product',
                    productSubtitle: 'Verified order from official brand catalog',
                    productImage: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=80',
                    productReceived: invoice.allProductsReceived ?? true,
                    invoicePdf: invoice.attachments?.[0] || { name: `${invoice.invoiceNumber}.pdf`, fileSize: '2.4 MB' },
                    status: invoice.status,
                  }
                ]).map((order, idx) => {
                  const isOrdApproved = order.status === INVOICE_STATUSES.APPROVED;
                  const isOrdRejected = order.status === INVOICE_STATUSES.REJECTED;
                  const badgeClass = isOrdApproved
                    ? 'invoice-modal__figma-badge--approved'
                    : isOrdRejected
                    ? 'invoice-modal__figma-badge--rejected'
                    : 'invoice-modal__figma-badge--under-review';

                  return (
                    <div key={order.id || idx} className="invoice-modal__figma-order-card">
                      {/* Header */}
                      <div className="invoice-modal__figma-order-head">
                        <span className="invoice-modal__figma-order-title">
                          Order {order.orderIndex || idx + 1}
                        </span>
                        <span className={`invoice-modal__figma-badge ${badgeClass}`}>
                          {order.status || 'Under Review'}
                        </span>
                      </div>

                      {/* Product Overview */}
                      <div className="invoice-modal__figma-product">
                        <img
                          src={order.productImage || 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=80'}
                          alt={order.productName}
                          className="invoice-modal__figma-prod-img"
                        />
                        <div style={{ flex: 1 }}>
                          <div className="invoice-modal__figma-prod-name">{order.productName || 'Head & Shoulders Deep Cleanse Shampoo'}</div>
                          <div className="invoice-modal__figma-prod-sub">{order.productSubtitle || 'Campaign Brief Required Product'}</div>
                        </div>
                      </div>

                      {/* 1:1 Figma Metadata Grid */}
                      <div className="invoice-modal__figma-grid">
                        <div className="invoice-modal__figma-field">
                          <span className="invoice-modal__figma-field-label">Order ID :</span>
                          <span className="invoice-modal__figma-field-val">
                            <span>{order.orderId}</span>
                            <button
                              type="button"
                              className="invoice-modal__figma-copy-btn"
                              onClick={() => handleCopy(order.orderId)}
                              title="Copy Order ID"
                            >
                              {copiedText === order.orderId ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                            </button>
                          </span>
                        </div>

                        <div className="invoice-modal__figma-field">
                          <span className="invoice-modal__figma-field-label">Invoice No :</span>
                          <span className="invoice-modal__figma-field-val">
                            <span>{order.invoiceNumber}</span>
                            <button
                              type="button"
                              className="invoice-modal__figma-copy-btn"
                              onClick={() => handleCopy(order.invoiceNumber)}
                              title="Copy Invoice Number"
                            >
                              {copiedText === order.invoiceNumber ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                            </button>
                          </span>
                        </div>

                        <div className="invoice-modal__figma-field">
                          <span className="invoice-modal__figma-field-label">Order Date :</span>
                          <span className="invoice-modal__figma-field-val">
                            📅 {order.orderDate}
                          </span>
                        </div>

                        <div className="invoice-modal__figma-field">
                          <span className="invoice-modal__figma-field-label">Order Amount :</span>
                          <span className="invoice-modal__figma-field-val" style={{ color: 'var(--hp-primary, #6538ea)' }}>
                            {formatCurrency(order.orderAmount)}
                          </span>
                        </div>

                        <div className="invoice-modal__figma-field" style={{ gridColumn: 'span 2' }}>
                          <span className="invoice-modal__figma-field-label">Submitted Date :</span>
                          <span className="invoice-modal__figma-field-val">
                            {order.submittedDate || invoice.submittedDate || '12 Sep, 2026'}
                          </span>
                        </div>
                      </div>

                      {/* Delivery Status Row (Figma: Have you received this product? Yes) */}
                      <div className="invoice-modal__figma-delivery">
                        <span className="invoice-modal__figma-delivery-label">
                          Have you received this product?
                        </span>
                        <div className="invoice-modal__figma-delivery-pill">
                          <Check size={12} />
                          <span>Yes, Product Received</span>
                        </div>
                      </div>

                      {/* Attached Invoice PDF */}
                      <div className="invoice-modal__figma-doc-box">
                        <div className="invoice-modal__figma-doc-left">
                          <div className="invoice-modal__figma-doc-icon">
                            <FileText size={18} />
                          </div>
                          <div>
                            <div className="invoice-modal__figma-doc-title">
                              {order.invoicePdf?.name || `${order.orderId}_Tax_Invoice.pdf`}
                            </div>
                            <div className="invoice-modal__figma-doc-sub">
                              Upload Invoice PDF • {order.invoicePdf?.fileSize || '2.4 MB'}
                            </div>
                          </div>
                        </div>

                        <div className="invoice-modal__figma-doc-actions">
                          <button
                            type="button"
                            className="invoice-modal__figma-doc-btn"
                            onClick={() => setActiveReceiptPreview(order.invoicePdf || invoice.attachments?.[0])}
                          >
                            <Eye size={12} />
                            <span>Preview</span>
                          </button>
                          <a
                            href={order.invoicePdf?.previewUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="invoice-modal__figma-doc-btn"
                            download
                          >
                            <Download size={12} />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>

                      {/* Rejection Alert if Rejected */}
                      {isOrdRejected && order.rejectionReason && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#991b1b' }}>
                          <strong>Rejection Feedback:</strong> {order.rejectionReason}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Total Order Amount Sticky Footer */}
                <div className="invoice-modal__figma-footer">
                  <div>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Claimed Reimbursement</span>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      Sum of {invoice.orders?.length || 1} submitted creator orders
                    </div>
                  </div>
                  <div className="invoice-modal__figma-footer-total">
                    {formatCurrency(invoice.totalOrderAmount || invoice.totalAmount)}
                  </div>
                </div>
              </div>
            ) : (
              /* Official Tax Invoice Sheet Paper */
              <div className="invoice-modal__paper">
                {/* Paper Watermark Header */}
                <div className="invoice-modal__paper-header">
                  <div>
                    <div className="invoice-modal__paper-brand-logo">
                      <PulseLogo size="sm" animated={false} />
                    </div>
                    <div className="invoice-modal__paper-brand-sub">
                      Verified Creator Reimbursement Claim
                    </div>
                  </div>
                  <div className="invoice-modal__paper-title-box">
                    <h3 className="invoice-modal__paper-doc-title">TAX INVOICE</h3>
                    <div className="invoice-modal__paper-doc-id">{invoice.invoiceNumber}</div>
                  </div>
                </div>

                {/* Parties: Billed To (Brand) & Submitted By (Creator) */}
                <div className="invoice-modal__parties-grid">
                  <div>
                    <div className="invoice-modal__party-label">BILLED TO (BRAND PARTNER)</div>
                    <div className="invoice-modal__party-name">Myntra Designs Private Limited</div>
                    <div className="invoice-modal__party-desc">
                      Attn: Brand Partner Operations & Influencer Marketing<br />
                      Outer Ring Road, Kadubeesanahalli, Bengaluru 560103<br />
                      GSTIN: 29AABCM1944N1ZM
                    </div>
                  </div>

                  <div>
                    <div className="invoice-modal__party-label">SUBMITTED BY (CREATOR)</div>
                    <div className="invoice-modal__party-name">{invoice.creatorName}</div>
                    <div className="invoice-modal__party-desc">
                      Handle: {invoice.creatorHandle} ({invoice.creatorPlatform})<br />
                      Email: {invoice.creatorEmail || 'creator@haulpack.com'}<br />
                      PAN: {invoice.taxInfo?.panNumber || 'ABCPS1234F'} • GST: {invoice.taxInfo?.gstin || 'Unregistered'}
                    </div>
                  </div>
                </div>

                {/* Dates & Campaign Info */}
                <div className="invoice-modal__meta-strip">
                  <div className="invoice-modal__meta-item">
                    <span className="invoice-modal__meta-label">Invoice Date</span>
                    <span className="invoice-modal__meta-value">{formatDate(invoice.invoiceDate)}</span>
                  </div>
                  <div className="invoice-modal__meta-item">
                    <span className="invoice-modal__meta-label">Due Date</span>
                    <span className="invoice-modal__meta-value">{formatDate(invoice.dueDate)}</span>
                  </div>
                  <div className="invoice-modal__meta-item">
                    <span className="invoice-modal__meta-label">Expense Category</span>
                    <span className="invoice-modal__meta-value" style={{ color: 'var(--hp-primary, #6538ea)' }}>
                      {invoice.expenseCategory}
                    </span>
                  </div>
                  <div className="invoice-modal__meta-item">
                    <span className="invoice-modal__meta-label">Campaign Reference</span>
                    <span className="invoice-modal__meta-value">{invoice.campaignName}</span>
                  </div>
                </div>

                {/* Purpose / Description */}
                {invoice.description && (
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', borderLeft: '3px solid var(--hp-primary, #6538ea)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 2 }}>
                      Reimbursement Scope & Purpose
                    </div>
                    <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: 1.5 }}>
                      {invoice.description}
                    </div>
                  </div>
                )}

                {/* Itemized Table */}
                <div className="invoice-modal__items-table-wrap">
                  <table className="invoice-modal__items-table">
                    <thead>
                      <tr>
                        <th style={{ width: '50%' }}>Item Description & Details</th>
                        <th style={{ textAlign: 'center' }}>Qty</th>
                        <th style={{ textAlign: 'right' }}>Unit Rate</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lineItems?.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="invoice-modal__item-name">{item.description}</div>
                          </td>
                          <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Totals */}
                <div className="invoice-modal__totals-box">
                  <div className="invoice-modal__totals-row">
                    <span>Subtotal</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="invoice-modal__totals-row">
                    <span>Tax ({invoice.taxRate || 'GST'})</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(invoice.taxAmount)}</span>
                  </div>
                  <div className="invoice-modal__totals-row invoice-modal__totals-row--grand">
                    <span>Total Claimed</span>
                    <span>{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                </div>

                {/* Attached Receipts & Proofs */}
                <div className="invoice-modal__attachments-box">
                  <div className="invoice-modal__attachments-title">
                    <FileText size={15} color="var(--hp-primary, #6538ea)" />
                    <span>Attached Proofs & Bills ({invoice.attachments?.length || 0})</span>
                  </div>
                  <div className="invoice-modal__attachments-list">
                    {invoice.attachments?.map((att) => (
                      <div
                        key={att.id}
                        className="invoice-modal__attachment-card"
                        onClick={() => setActiveReceiptPreview(att)}
                        title="Click to zoom in"
                      >
                        <img
                          src={att.previewUrl}
                          alt={att.name}
                          className="invoice-modal__attachment-thumb"
                        />
                        <div className="invoice-modal__attachment-info">
                          <span className="invoice-modal__attachment-name">{att.name}</span>
                          <span className="invoice-modal__attachment-meta">{att.fileSize} • Uploaded {att.uploadDate}</span>
                          <span className="invoice-modal__attachment-action">
                            <Eye size={12} />
                            <span>View Full Receipt</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Beneficiary Banking Strip */}
                <div className="invoice-modal__payout-strip">
                  <div className="invoice-modal__payout-strip-title">
                    <Landmark size={14} />
                    <span>Verified Beneficiary Payout Details</span>
                  </div>
                  <div className="invoice-modal__payout-details-grid">
                    <div>
                      <span style={{ color: '#64748b' }}>Account Name:</span>{' '}
                      <strong>{invoice.payoutDetails?.accountHolderName}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Bank:</span>{' '}
                      <strong>{invoice.payoutDetails?.bankName}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>A/C:</span>{' '}
                      <strong>{invoice.payoutDetails?.accountNumber}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>IFSC:</span>{' '}
                      <strong>{invoice.payoutDetails?.ifscCode}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>UPI:</span>{' '}
                      <strong>{invoice.payoutDetails?.upiId || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Type:</span>{' '}
                      <strong>{invoice.payoutDetails?.beneficiaryType || 'Individual'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Verification & Audit Timeline */}
          <div className="invoice-modal__decision-panel">
            {/* Creator Quick Card */}
            <div className="invoice-modal__panel-section">
              <h3 className="invoice-modal__panel-title">
                <User size={16} color="var(--hp-primary, #6538ea)" />
                <span>Creator Information</span>
              </h3>
              <div className="invoice-modal__creator-card">
                <div
                  className="invoice-modal__creator-avatar"
                  style={{ background: invoice.creatorAvatarColor || 'var(--hp-primary, #6538ea)' }}
                >
                  {invoice.creatorName?.charAt(0)}
                </div>
                <div className="invoice-modal__creator-details">
                  <span className="invoice-modal__creator-name">{invoice.creatorName}</span>
                  <div className="invoice-modal__creator-handle-row">
                    <span className="invoice-modal__creator-handle">{invoice.creatorHandle}</span>
                    <span
                      style={{
                        background: '#e0e7ff',
                        color: '#4338ca',
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {invoice.creatorPlatform}
                    </span>
                  </div>
                  <span className="invoice-modal__creator-contact">
                    {invoice.creatorEmail || 'verified@creator.com'} • {invoice.creatorPhone || '+91 98201 00000'}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Lifecycle & Audit Trail */}
            <div className="invoice-modal__panel-section">
              <h3 className="invoice-modal__panel-title">
                <Clock size={16} color="var(--hp-primary, #6538ea)" />
                <span>Verification & Payout Timeline</span>
              </h3>

              <div className="invoice-modal__timeline">
                {/* Step 1: Submitted */}
                <div className="invoice-modal__timeline-step invoice-modal__timeline-step--done">
                  <div className="invoice-modal__timeline-dot" />
                  <div className="invoice-modal__timeline-title">Invoice Submitted</div>
                  <div className="invoice-modal__timeline-desc">
                    Creator uploaded invoice & receipt bills for {formatCurrency(invoice.totalAmount)}.
                  </div>
                  <div className="invoice-modal__timeline-time">
                    {formatDate(invoice.submittedAt)}
                  </div>
                </div>

                {/* Step 2: Verification */}
                <div
                  className={`invoice-modal__timeline-step ${
                    isApproved || isReimbursed
                      ? 'invoice-modal__timeline-step--done'
                      : isRejected
                      ? 'invoice-modal__timeline-step--rejected'
                      : 'invoice-modal__timeline-step--active'
                  }`}
                >
                  <div className="invoice-modal__timeline-dot" />
                  <div className="invoice-modal__timeline-title">
                    {isRejected
                      ? 'Rejected by Brand'
                      : isApproved || isReimbursed
                      ? 'Verified & Approved'
                      : 'Under Brand Review'}
                  </div>
                  <div className="invoice-modal__timeline-desc">
                    {invoice.verifiedBy ? (
                      <>
                        Reviewed by <strong>{invoice.verifiedBy}</strong>
                        {invoice.verificationNotes && <><br />Note: {invoice.verificationNotes}</>}
                      </>
                    ) : (
                      'Brand manager verifies order receipt and campaign brief compliance.'
                    )}
                  </div>
                  {invoice.verifiedAt && (
                    <div className="invoice-modal__timeline-time">
                      {formatDate(invoice.verifiedAt)}
                    </div>
                  )}
                </div>

                {/* Step 3: Reimbursement Settlement */}
                <div
                  className={`invoice-modal__timeline-step ${
                    isReimbursed ? 'invoice-modal__timeline-step--done' : ''
                  }`}
                >
                  <div className="invoice-modal__timeline-dot" />
                  <div className="invoice-modal__timeline-title">
                    {isReimbursed ? 'Reimbursed / Paid' : 'Disbursement Settlement'}
                  </div>
                  <div className="invoice-modal__timeline-desc">
                    {isReimbursed ? (
                      <>
                        Transferred to bank. Ref: <strong>{invoice.paymentReference}</strong>
                      </>
                    ) : (
                      'Bank NEFT / UPI settlement batch processed.'
                    )}
                  </div>
                  {invoice.reimbursedAt && (
                    <div className="invoice-modal__timeline-time">
                      {formatDate(invoice.reimbursedAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Box: Dependent on Status */}
            <div className="invoice-modal__panel-section">
              <h3 className="invoice-modal__panel-title">
                <ShieldCheck size={16} color="var(--hp-primary, #6538ea)" />
                <span>Verification Actions</span>
              </h3>

              {isPending && !showRejectBox && (
                <div className="invoice-modal__action-box">
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    Brand Verification Decision
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    Confirm that the attached bills correspond to eligible campaign items before approving for reimbursement disbursement.
                  </p>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Internal Verification Notes (Optional)
                    </label>
                    <textarea
                      className="invoice-modal__notes-input"
                      placeholder="e.g. Order # verified on Myntra seller portal. Matches reel styling."
                      value={verificationNote}
                      onChange={e => setVerificationNote(e.target.value)}
                    />
                  </div>

                  <div className="invoice-modal__action-btn-row">
                    <button
                      type="button"
                      className="invoice-modal__btn-primary"
                      onClick={handleApprove}
                    >
                      <CheckCircle2 size={16} />
                      <span>Verify & Approve</span>
                    </button>
                    <button
                      type="button"
                      className="invoice-modal__btn-secondary"
                      onClick={() => setShowRejectBox(true)}
                    >
                      <XCircle size={16} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Reject Form */}
              {showRejectBox && (
                <div className="invoice-modal__action-box invoice-modal__action-box--rejected">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertCircle size={15} />
                      <span>Specify Rejection Reason</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRejectBox(false)}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 11 }}
                    >
                      Cancel
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {REJECTION_REASONS.map(reason => (
                      <label
                        key={reason}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          fontSize: 12,
                          color: '#1e293b',
                          cursor: 'pointer',
                          padding: '6px 8px',
                          background: selectedRejectReason === reason ? '#fee2e2' : '#ffffff',
                          borderRadius: 6,
                          border: '1px solid #fecaca',
                        }}
                      >
                        <input
                          type="radio"
                          name="rejectReason"
                          value={reason}
                          checked={selectedRejectReason === reason}
                          onChange={() => setSelectedRejectReason(reason)}
                          style={{ marginTop: 2 }}
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>

                  <textarea
                    className="invoice-modal__notes-input"
                    placeholder="Provide specific details to guide the creator (e.g. please upload original PDF receipt from Myntra app)..."
                    value={customRejectNote}
                    onChange={e => setCustomRejectNote(e.target.value)}
                  />

                  <div className="invoice-modal__action-btn-row">
                    <button
                      type="button"
                      className="invoice-modal__btn-secondary"
                      style={{ background: '#dc2626', color: '#ffffff', border: 'none', flex: 1 }}
                      onClick={handleReject}
                    >
                      <XCircle size={16} />
                      <span>Confirm Rejection</span>
                    </button>
                  </div>
                </div>
              )}

              {/* When Approved: Can Mark as Reimbursed */}
              {isApproved && (
                <div className="invoice-modal__action-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={18} color="#4f46e5" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e1a38' }}>
                        Approved for Reimbursement
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Verified by {invoice.verifiedBy || 'Brand Operations'}. Ready for finance payout.
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Payment Reference / UTR Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UTR-HDFC-992384102"
                      value={utrInput}
                      onChange={e => setUtrInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                        background: '#ffffff',
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    className="invoice-modal__btn-settle"
                    onClick={handleSettle}
                  >
                    <DollarSign size={16} />
                    <span>Record Payment as Reimbursed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRejectBox(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                      padding: 4,
                    }}
                  >
                    Revoke Approval & Reject Instead
                  </button>
                </div>
              )}

              {/* When Reimbursed */}
              {isReimbursed && (
                <div className="invoice-modal__action-box invoice-modal__action-box--reimbursed">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={20} color="#059669" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#065f46' }}>
                        Reimbursement Paid in Full
                      </div>
                      <div style={{ fontSize: '11px', color: '#047857' }}>
                        Settled on {formatDate(invoice.reimbursedAt)}.
                      </div>
                    </div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      Bank UTR Reference
                    </div>
                    <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                      {invoice.paymentReference}
                    </div>
                  </div>
                </div>
              )}

              {/* When Rejected */}
              {isRejected && (
                <div className="invoice-modal__action-box invoice-modal__action-box--rejected">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <XCircle size={18} color="#dc2626" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#991b1b' }}>
                        Reimbursement Request Rejected
                      </div>
                      <div style={{ fontSize: '11px', color: '#b91c1c' }}>
                        {invoice.verifiedAt ? `Rejected on ${formatDate(invoice.verifiedAt)}` : 'Rejected'}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 8, border: '1px solid #fecaca' }}>
                    <div style={{ fontSize: 10, color: '#dc2626', textTransform: 'uppercase', fontWeight: 700 }}>
                      Feedback Given to Creator
                    </div>
                    <div style={{ fontSize: 12, color: '#1e293b', marginTop: 4 }}>
                      {invoice.rejectionReason}
                    </div>
                    {invoice.verificationNotes && (
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontStyle: 'italic' }}>
                        Note: {invoice.verificationNotes}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleReopen}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    Reopen for Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Receipt Previewer */}
      {activeReceiptPreview && (
        <div className="receipt-lightbox-overlay" onClick={() => setActiveReceiptPreview(null)}>
          <div className="receipt-lightbox" onClick={e => e.stopPropagation()}>
            <div className="receipt-lightbox__header">
              <span className="receipt-lightbox__title">{activeReceiptPreview.name}</span>
              <button
                type="button"
                onClick={() => setActiveReceiptPreview(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="receipt-lightbox__body">
              <img
                src={activeReceiptPreview.previewUrl}
                alt={activeReceiptPreview.name}
                className="receipt-lightbox__img"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
