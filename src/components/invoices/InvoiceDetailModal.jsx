import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Check, ExternalLink, Package, ShieldCheck, FileText, Download, Clock, AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './InvoiceDetailModal.css';

export default function InvoiceDetailModal({ invoice, onClose }) {
  const [activeReceiptPreview, setActiveReceiptPreview] = useState(null);

  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, []);

  if (!invoice) return null;

  const orders = invoice.orders && invoice.orders.length > 0 ? invoice.orders : [
    {
      orderIndex: 1,
      orderId: invoice.primaryOrderId || invoice.invoiceNumber || '40809162560646707',
      invoiceNumber: invoice.invoiceNumber || 'FDLB-542576',
      orderDate: invoice.orderDate || invoice.submittedDate || '14 Oct 2026',
      orderAmount: invoice.totalOrderAmount || invoice.totalAmount || 503,
      productReceived: true,
      adminApproved: invoice.status === 'Approved' || invoice.status === 'Verified' || !invoice.status,
      status: invoice.status || 'Approved',
      invoicePdf: {
        name: 'Invoice_FDLB-542576.pdf',
        previewUrl: 'https://images.unsplash.com/photo-1554415707-9e49666ffb24?w=800&auto=format&fit=crop&q=80',
      }
    }
  ];

  const approvedOrders = orders.filter(o => o.status === 'Approved' || o.status === 'Verified' || o.status === 'Reimbursed');
  const rejectedOrders = orders.filter(o => o.status === 'Rejected');
  const pendingOrders = orders.filter(o => o.status !== 'Approved' && o.status !== 'Verified' && o.status !== 'Reimbursed' && o.status !== 'Rejected');
  const totalClaimed = orders.reduce((sum, o) => sum + (o.orderAmount || 0), 0) || invoice.totalAmount || 503;

  // Determine Overall Status for Creator Row Badge
  const isOverallPartial = invoice.status === 'Partially Approved' || (approvedOrders.length > 0 && (pendingOrders.length > 0 || rejectedOrders.length > 0));
  const isOverallRejected = !isOverallPartial && (invoice.status === 'Rejected' || (orders.length > 0 && rejectedOrders.length === orders.length));
  const isOverallPending = !isOverallPartial && !isOverallRejected && (invoice.status === 'Under Review' || invoice.status === 'Pending Verification' || (orders.length > 0 && pendingOrders.length === orders.length));

  const getOverallStatusBadge = () => {
    if (isOverallPartial) {
      return {
        className: 'claim-modal__status-badge--partial',
        icon: <AlertCircle size={13} strokeWidth={2.5} />,
        label: 'Partially Approved',
      };
    }
    if (isOverallPending) {
      return {
        className: 'claim-modal__status-badge--pending',
        icon: <Clock size={13} strokeWidth={2.5} />,
        label: 'Under Review',
      };
    }
    if (isOverallRejected) {
      return {
        className: 'claim-modal__status-badge--rejected',
        icon: <X size={13} strokeWidth={2.5} />,
        label: 'Rejected',
      };
    }
    return {
      className: 'claim-modal__status-badge--approved',
      icon: <Check size={13} strokeWidth={2.5} />,
      label: 'Approved',
    };
  };

  const overallBadge = getOverallStatusBadge();

  const handleOpenPdf = (order) => {
    const pdf = order.invoicePdf || invoice.attachments?.[0] || {
      name: `Invoice_${order.invoiceNumber || 'FDLB-542576'}.pdf`,
      previewUrl: 'https://images.unsplash.com/photo-1554415707-9e49666ffb24?w=800&auto=format&fit=crop&q=80',
    };
    setActiveReceiptPreview(pdf);
  };

  return createPortal(
    <div className="claim-modal-overlay" onClick={onClose}>
      <div className="claim-modal" onClick={e => e.stopPropagation()}>
        {/* Top Header */}
        <div className="claim-modal__header">
          <div className="claim-modal__header-left">
            <span className="claim-modal__campaign-tag">
              {invoice.campaignName?.toUpperCase() || 'HAULPACK X AMAZON HEAD & SHOULDERS'}
            </span>
            <h2 className="claim-modal__title">Reimbursement Claim</h2>
          </div>
          <button
            type="button"
            className="claim-modal__close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Creator Identity & Status Row */}
        <div className="claim-modal__creator-row">
          <div className="claim-modal__creator-info">
            <img
              src={invoice.creatorAvatarUrl || '/creators/thehopestory.png'}
              alt={invoice.creatorName || 'TheHopeStory'}
              className="claim-modal__avatar"
            />
            <div className="claim-modal__creator-text">
              <span className="claim-modal__creator-name">
                {invoice.creatorName || 'TheHopeStory'}
              </span>
              <span className="claim-modal__creator-sub">
                {invoice.creatorHandle || '@thehopestoryofficial'} • {invoice.creatorPlatform || 'Instagram'}
              </span>
            </div>
          </div>

          <div className={`claim-modal__status-badge ${overallBadge.className}`}>
            {overallBadge.icon}
            <span>{overallBadge.label}</span>
          </div>
        </div>

        {/* 5-Column Metrics Strip */}
        <div className="claim-modal__metrics-box">
          <div className="claim-modal__metric-col">
            <span className="claim-modal__metric-label">TOTAL CLAIMED</span>
            <span className="claim-modal__metric-val">{formatCurrency(totalClaimed)}</span>
          </div>
          <div className="claim-modal__metric-col">
            <span className="claim-modal__metric-label">ORDERS</span>
            <span className="claim-modal__metric-val">{orders.length}</span>
          </div>
          <div className="claim-modal__metric-col">
            <span className="claim-modal__metric-label">APPROVED</span>
            <span className="claim-modal__metric-val claim-modal__metric-val--approved">
              {approvedOrders.length}
            </span>
          </div>
          <div className="claim-modal__metric-col">
            <span className="claim-modal__metric-label">PENDING</span>
            <span className="claim-modal__metric-val claim-modal__metric-val--pending">
              {pendingOrders.length}
            </span>
          </div>
          <div className="claim-modal__metric-col">
            <span className="claim-modal__metric-label">REJECTED</span>
            <span className="claim-modal__metric-val claim-modal__metric-val--rejected">
              {rejectedOrders.length}
            </span>
          </div>
        </div>

        {/* Blue Info Notice Banner */}
        <div className="claim-modal__notice-banner">
          Brand approval isn't required for this campaign — HaulPack admin verifies these invoices. View only.
        </div>

        {/* Order Invoices Section */}
        <div className="claim-modal__orders-section">
          <h3 className="claim-modal__section-heading">Order invoices</h3>

          <div className="claim-modal__orders-list">
            {orders.map((order, idx) => {
              const orderNum = order.orderIndex || idx + 1;
              const isOrderApproved = order.status === 'Approved' || order.status === 'Verified' || order.status === 'Reimbursed';
              const isOrderRejected = order.status === 'Rejected';
              const isOrderPending = !isOrderApproved && !isOrderRejected;

              return (
                <div
                  key={order.id || idx}
                  className={`claim-modal__order-card ${
                    isOrderApproved
                      ? 'claim-modal__order-card--approved'
                      : isOrderRejected
                      ? 'claim-modal__order-card--rejected'
                      : 'claim-modal__order-card--pending'
                  }`}
                >
                  {/* Order Card Header */}
                  <div className="claim-modal__order-top">
                    <span className="claim-modal__order-title">Order #{orderNum}</span>
                    <span className="claim-modal__order-amount">
                      {formatCurrency(order.orderAmount || 503)}
                    </span>
                  </div>

                  {/* Order Details Line */}
                  <div className="claim-modal__order-meta-line">
                    <span className="claim-modal__meta-item">
                      <span className="claim-modal__meta-label">Order ID</span>{' '}
                      <span className="claim-modal__meta-val">{order.orderId || '40809162560646707'}</span>
                    </span>
                    <span className="claim-modal__meta-item">
                      <span className="claim-modal__meta-label">Invoice</span>{' '}
                      <span className="claim-modal__meta-val">{order.invoiceNumber || 'FDLB-542576'}</span>
                    </span>
                    <span className="claim-modal__meta-date">
                      {order.orderDate ? (order.orderDate.includes('-') ? formatDate(order.orderDate) : order.orderDate) : (invoice.orderDate ? (invoice.orderDate.includes('-') ? formatDate(invoice.orderDate) : invoice.orderDate) : '14 Oct 2026')}
                    </span>
                  </div>

                  {/* Badges / Actions Row */}
                  <div className="claim-modal__order-actions-row">
                    <button
                      type="button"
                      className="claim-modal__pill-btn claim-modal__pill-btn--purple"
                      onClick={() => handleOpenPdf(order)}
                    >
                      <FileText size={12} />
                      <span>View invoice</span>
                      <ExternalLink size={11} />
                    </button>

                    <div className="claim-modal__pill-tag claim-modal__pill-tag--green">
                      <Package size={12} />
                      <span>Product received</span>
                    </div>

                    {isOrderApproved && (
                      <div className="claim-modal__pill-tag claim-modal__pill-tag--gray">
                        <ShieldCheck size={12} />
                        <span>Admin: Approved</span>
                      </div>
                    )}

                    {isOrderPending && (
                      <div className="claim-modal__pill-tag claim-modal__pill-tag--amber">
                        <Clock size={12} />
                        <span>Admin: Under Review</span>
                      </div>
                    )}

                    {isOrderRejected && (
                      <div className="claim-modal__pill-tag claim-modal__pill-tag--red">
                        <X size={12} />
                        <span>Admin: Rejected</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Verification Note */}
                  {isOrderApproved && (
                    <div className="claim-modal__order-admin-note claim-modal__order-admin-note--approved">
                      Approved by HaulPack admin — brand approval isn't required for this campaign.
                    </div>
                  )}

                  {isOrderPending && (
                    <div className="claim-modal__order-admin-note claim-modal__order-admin-note--pending">
                      Under review by HaulPack admin — awaiting verification.
                    </div>
                  )}

                  {isOrderRejected && (
                    <div className="claim-modal__order-admin-note claim-modal__order-admin-note--rejected">
                      {order.rejectionReason || 'Rejected by HaulPack admin — invoice does not meet criteria.'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox Receipt Previewer */}
      {activeReceiptPreview && (
        <div className="receipt-lightbox-overlay" onClick={() => setActiveReceiptPreview(null)}>
          <div className="receipt-lightbox" onClick={e => e.stopPropagation()}>
            <div className="receipt-lightbox__header">
              <span className="receipt-lightbox__title">{activeReceiptPreview.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <a
                  href={activeReceiptPreview.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="receipt-lightbox__download-link"
                  download
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveReceiptPreview(null)}
                  className="receipt-lightbox__close"
                >
                  <X size={18} />
                </button>
              </div>
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
