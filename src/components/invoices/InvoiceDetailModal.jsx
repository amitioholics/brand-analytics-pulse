import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, CheckCircle2, XCircle, AlertCircle, FileText, Download,
  Eye, Check, Copy
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useInvoices } from '../../context/InvoiceContext';
import './InvoiceDetailModal.css';

export default function InvoiceDetailModal({ invoice: propInvoice, onClose, onRefresh }) {
  const { invoices, updateOrderStatus, verifyInvoice, reopenInvoice, INVOICE_STATUSES } = useInvoices();
  const invoice = invoices.find(inv => inv.id === propInvoice?.id) || propInvoice;

  const [copiedText, setCopiedText] = useState('');
  const [activeReceiptPreview, setActiveReceiptPreview] = useState(null);
  const [rejectingOrderIdx, setRejectingOrderIdx] = useState(null);
  const [orderRejectReason, setOrderRejectReason] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, []);

  const handleCopy = (txt) => {
    navigator.clipboard?.writeText(txt);
    setCopiedText(txt);
    setTimeout(() => setCopiedText(''), 2000);
  };

  if (!invoice) return null;

  const orders = invoice.orders && invoice.orders.length > 0 ? invoice.orders : [
    {
      orderIndex: 1,
      orderId: invoice.primaryOrderId || invoice.invoiceNumber,
      invoiceNumber: invoice.invoiceNumber,
      orderDate: invoice.orderDate || invoice.invoiceDate,
      orderAmount: invoice.totalOrderAmount || invoice.totalAmount,
      submittedDate: invoice.submittedDate || '12 Sep, 2026',
      productName: 'Product 1',
      productSubtitle: '',
      productImage: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=80',
      productReceived: invoice.allProductsReceived ?? true,
      invoicePdf: invoice.attachments?.[0] || { name: `${invoice.invoiceNumber}.pdf`, fileSize: '2.4 MB' },
      status: invoice.status,
    }
  ];

  const approvedOrders = orders.filter(o => o.status === INVOICE_STATUSES.APPROVED || o.status === 'Approved');
  const rejectedOrders = orders.filter(o => o.status === INVOICE_STATUSES.REJECTED || o.status === 'Rejected');
  const pendingOrders = orders.filter(o => o.status !== INVOICE_STATUSES.APPROVED && o.status !== 'Approved' && o.status !== INVOICE_STATUSES.REJECTED && o.status !== 'Rejected');

  const totalClaimed = orders.reduce((sum, o) => sum + (o.orderAmount || 0), 0) || invoice.totalAmount;
  const approvedAmount = approvedOrders.reduce((sum, o) => sum + (o.orderAmount || 0), 0);
  const rejectedAmount = rejectedOrders.reduce((sum, o) => sum + (o.orderAmount || 0), 0);
  const pendingAmount = pendingOrders.reduce((sum, o) => sum + (o.orderAmount || 0), 0);

  // Handlers for Order-Level Decisions
  const handleApproveOrder = (orderIndex) => {
    updateOrderStatus(invoice.id, orderIndex, INVOICE_STATUSES.APPROVED);
    setRejectingOrderIdx(null);
    setOrderRejectReason('');
    setActionSuccessMsg(`Order ${orderIndex} approved for reimbursement!`);
    setTimeout(() => setActionSuccessMsg(''), 3000);
    if (onRefresh) onRefresh();
  };

  const handleRejectOrder = (orderIndex) => {
    const finalReason = orderRejectReason.trim() || 'Rejected by brand reviewer';
    updateOrderStatus(invoice.id, orderIndex, INVOICE_STATUSES.REJECTED, finalReason);
    setRejectingOrderIdx(null);
    setOrderRejectReason('');
    setActionSuccessMsg(`Order ${orderIndex} rejected.`);
    setTimeout(() => setActionSuccessMsg(''), 3000);
    if (onRefresh) onRefresh();
  };

  const handleApproveAllOrders = () => {
    verifyInvoice(invoice.id, 'All submitted orders verified and approved for disbursement.');
    setRejectingOrderIdx(null);
    setOrderRejectReason('');
    setActionSuccessMsg(`All ${orders.length} orders approved for reimbursement!`);
    setTimeout(() => setActionSuccessMsg(''), 3000);
    if (onRefresh) onRefresh();
  };

  const handleReopen = () => {
    reopenInvoice(invoice.id);
    setActionSuccessMsg('Invoice reopened for review.');
    setTimeout(() => setActionSuccessMsg(''), 3000);
    if (onRefresh) onRefresh();
  };

  const getStatusBadgeStyle = () => {
    switch (invoice.status) {
      case INVOICE_STATUSES.APPROVED:
      case INVOICE_STATUSES.VERIFIED:
      case 'Reimbursed':
      case 'Approved':
        return { bg: '#eef2ff', color: '#4f46e5', border: '#c7d2fe', label: 'Approved' };
      case INVOICE_STATUSES.PARTIALLY_APPROVED:
      case 'Partially Approved':
        return { bg: '#f3e8ff', color: '#7c3aed', border: '#ddd6fe', label: 'Partially Approved' };
      case INVOICE_STATUSES.REJECTED:
      case 'Rejected':
        return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Rejected' };
      default:
        return { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'Under Review' };
    }
  };

  const badgeStyle = getStatusBadgeStyle();

  return createPortal(
    <div className="invoice-modal-overlay" onClick={onClose}>
      <div className="invoice-modal" onClick={e => e.stopPropagation()}>
        {/* Top Header */}
        <div className="invoice-modal__header">
          <div className="invoice-modal__header-left">
            <div
              className="invoice-modal__header-icon"
              style={invoice.creatorAvatarColor ? {
                background: invoice.creatorAvatarColor,
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 16,
              } : {}}
            >
              {invoice.creatorName ? invoice.creatorName.charAt(0) : <FileText size={22} />}
            </div>
            <div className="invoice-modal__header-title-box">
              <h2 className="invoice-modal__header-inv-num">
                <span>{invoice.creatorName}</span>
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
                  {badgeStyle.label}
                </span>
              </h2>
              <span className="invoice-modal__header-meta">
                {invoice.creatorHandle && <span>{invoice.creatorHandle} • </span>}
                Submitted on {formatDate(invoice.submittedAt)} • {invoice.campaignName}
              </span>
            </div>
          </div>

          <div className="invoice-modal__header-right">
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

        {/* Modal Body: Left Order Cards + Right Decision Panel */}
        <div className="invoice-modal__body">
          {/* Left Column: Submitted Orders View */}
          <div className="invoice-modal__paper-wrapper">
            <div className="invoice-modal__orders-view">
                <div className="invoice-modal__orders-intro">
                  <div>
                    <div className="invoice-modal__orders-intro-title">
                      Creator Invoice Submission
                    </div>
                    <div className="invoice-modal__orders-intro-sub">
                      Order ID, invoice details, and invoices submitted by creator via HaulPack App
                    </div>
                  </div>
                  <span
                    style={{
                      background: 'var(--hp-primary-lighter, #f2edfc)',
                      color: 'var(--hp-primary, #6538ea)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {orders.length} Orders Attached
                  </span>
                </div>

                {orders.map((order, idx) => {
                  const ordStatus = order.status || INVOICE_STATUSES.UNDER_REVIEW;
                  const isOrdApproved = ordStatus === INVOICE_STATUSES.APPROVED || ordStatus === 'Approved';
                  const isOrdRejected = ordStatus === INVOICE_STATUSES.REJECTED || ordStatus === 'Rejected';
                  const isOrdPending = !isOrdApproved && !isOrdRejected;
                  const orderNum = order.orderIndex || idx + 1;
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
                          Order {orderNum}
                        </span>
                        <span className={`invoice-modal__figma-badge ${badgeClass}`}>
                          {ordStatus}
                        </span>
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

                      {/* Order-Level Action Bar */}
                      <div className="invoice-modal__order-action-bar">
                        {rejectingOrderIdx === orderNum ? (
                          <div className="invoice-modal__order-reject-box">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>
                                Reject Order {orderNum}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingOrderIdx(null);
                                  setOrderRejectReason('');
                                }}
                                className="invoice-modal__order-cancel-btn"
                              >
                                Cancel
                              </button>
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                                Reason:
                              </label>
                              <textarea
                                className="invoice-modal__order-remarks-input"
                                placeholder="Write the rejection reason here..."
                                value={orderRejectReason}
                                onChange={e => setOrderRejectReason(e.target.value)}
                                rows={3}
                                autoFocus
                              />
                            </div>
                            <button
                              type="button"
                              className="invoice-modal__order-btn invoice-modal__order-btn--reject"
                              style={{ width: '100%' }}
                              onClick={() => handleRejectOrder(orderNum)}
                            >
                              <XCircle size={14} />
                              <span>Confirm Rejection for Order {orderNum}</span>
                            </button>
                          </div>
                        ) : isOrdPending ? (
                          <div className="invoice-modal__order-action-row">
                            <span className="invoice-modal__order-action-label">
                              Order {orderNum} Decision:
                            </span>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                type="button"
                                className="invoice-modal__order-btn invoice-modal__order-btn--approve"
                                onClick={() => handleApproveOrder(orderNum)}
                              >
                                <CheckCircle2 size={13} />
                                <span>Approve Order</span>
                              </button>
                              <button
                                type="button"
                                className="invoice-modal__order-btn invoice-modal__order-btn--reject"
                                onClick={() => {
                                  setOrderRejectReason('');
                                  setRejectingOrderIdx(orderNum);
                                }}
                              >
                                <XCircle size={13} />
                                <span>Reject Order</span>
                              </button>
                            </div>
                          </div>
                        ) : isOrdApproved ? (
                          <div className="invoice-modal__order-decided invoice-modal__order-decided--approved">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <CheckCircle2 size={14} color="#15803d" />
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>
                                Order {orderNum} Approved for Reimbursement
                              </span>
                            </div>
                            <button
                              type="button"
                              className="invoice-modal__order-change-link"
                              onClick={() => {
                                setOrderRejectReason('');
                                setRejectingOrderIdx(orderNum);
                              }}
                            >
                              Reject Instead
                            </button>
                          </div>
                        ) : (
                          <div className="invoice-modal__order-decided invoice-modal__order-decided--rejected">
                            <div style={{ flex: 1, marginRight: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <XCircle size={14} color="#b91c1c" />
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#b91c1c' }}>
                                  Order {orderNum} Rejected
                                </span>
                              </div>
                              {(order.rejectionReason || order.remarks) && (
                                <div style={{
                                  fontSize: 11,
                                  color: '#7f1d1d',
                                  marginTop: 4,
                                  background: 'rgba(239, 68, 68, 0.08)',
                                  padding: '5px 8px',
                                  borderRadius: 5,
                                  borderLeft: '2px solid #ef4444',
                                  lineHeight: 1.35
                                }}>
                                  <strong>Reason:</strong> {order.rejectionReason || order.remarks}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              className="invoice-modal__order-change-link"
                              onClick={() => handleApproveOrder(orderNum)}
                            >
                              Approve Instead
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Total Order Amount Sticky Footer with Approve All Button */}
                {/* Total Order Amount Sticky Footer with Approve All Set in the Middle */}
                <div className="invoice-modal__figma-footer">
                  <div className="invoice-modal__footer-col invoice-modal__footer-col--left">
                    <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 700 }}>Total Claimed Reimbursement</span>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      {approvedOrders.length} of {orders.length} orders approved ({formatCurrency(approvedAmount)})
                    </div>
                  </div>

                  <div className="invoice-modal__footer-col invoice-modal__footer-col--center">
                    {pendingOrders.length > 0 || rejectedOrders.length > 0 ? (
                      <button
                        type="button"
                        className="invoice-modal__approve-all-btn"
                        onClick={handleApproveAllOrders}
                        title="Approve all orders for reimbursement"
                      >
                        <CheckCircle2 size={16} />
                        <span>Approve All Orders</span>
                      </button>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#15803d',
                          background: '#dcfce7',
                          padding: '7px 14px',
                          borderRadius: 8,
                          border: '1px solid #bbf7d0',
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>All Orders Approved</span>
                      </span>
                    )}
                  </div>

                  <div className="invoice-modal__footer-col invoice-modal__footer-col--right">
                    <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Total Amount
                    </span>
                    <div className="invoice-modal__figma-footer-total">
                      {formatCurrency(totalClaimed)}
                    </div>
                  </div>
                </div>
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
    </div>,
    document.body
  );
}
