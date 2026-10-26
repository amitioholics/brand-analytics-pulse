import { useState } from 'react';
import {
  X, ArrowLeft, ArrowRight, CheckCircle2, Upload, Plus,
  Trash2, ExternalLink, Copy, Check, FileText, Smartphone,
  ShoppingBag, Sparkles
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useInvoices } from '../../context/InvoiceContext';
import './CreatorAppSimulatorModal.css';

const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    name: 'P&G Gillette Fusion Grooming Kit',
    subtitle: 'Classic Stretch Indigo Denim • P&G Official Store',
    price: 2000,
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'p2',
    name: 'P&G Olay Regenerist Glow Serum',
    subtitle: 'Supreme Woolen Camel Overcoat • P&G Official Store',
    price: 2000,
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'p3',
    name: 'Runway Velvet Styling Stole & Belt',
    subtitle: 'Campaign styling props • Accessory partner',
    price: 1499,
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&auto=format&fit=crop&q=80',
  },
];

export default function CreatorAppSimulatorModal({ onClose, onSubmitted }) {
  const { submitNewCreatorClaim } = useInvoices();
  const [step, setStep] = useState(1); // 1 = Purchase, 2 = Submit, 3 = Status View

  // Step 2 Form State: multiple orders
  const [orders, setOrders] = useState([
    {
      orderIndex: 1,
      orderId: '0012344556',
      invoiceNumber: '0012344556',
      orderDate: '2026-09-20',
      orderAmount: 2000,
      productName: 'P&G Gillette Fusion Grooming Kit',
      productSubtitle: 'Classic Stretch Indigo Denim • P&G Official Store',
      productImage: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=500&auto=format&fit=crop&q=80',
      pdfName: 'PG_Invoice_0012344556.pdf',
      pdfSize: '2.4 MB',
      productReceived: true,
    },
  ]);

  const [submittedClaim, setSubmittedClaim] = useState(null);
  const [copiedId, setCopiedId] = useState('');

  const totalAmount = orders.reduce((sum, ord) => sum + (Number(ord.orderAmount) || 0), 0);

  const handleAddOrder = () => {
    const nextIdx = orders.length + 1;
    const prod = DEFAULT_PRODUCTS[nextIdx - 1] || DEFAULT_PRODUCTS[0];
    setOrders(prev => [
      ...prev,
      {
        orderIndex: nextIdx,
        orderId: `0012344${556 + nextIdx}`,
        invoiceNumber: `0012344${556 + nextIdx}`,
        orderDate: '2026-09-20',
        orderAmount: prod.price,
        productName: prod.name,
        productSubtitle: prod.subtitle,
        productImage: prod.image,
        pdfName: `PG_Invoice_0012344${556 + nextIdx}.pdf`,
        pdfSize: '1.9 MB',
        productReceived: true,
      },
    ]);
  };

  const handleRemoveOrder = (idx) => {
    if (orders.length <= 1) return;
    setOrders(prev => prev.filter((_, i) => i !== idx).map((o, i) => ({ ...o, orderIndex: i + 1 })));
  };

  const handleOrderChange = (idx, field, val) => {
    setOrders(prev =>
      prev.map((ord, i) => (i === idx ? { ...ord, [field]: val } : ord))
    );
  };

  const handleSubmitOrders = () => {
    const newClaim = submitNewCreatorClaim({
      creatorName: 'Aditi Sharma',
      creatorHandle: '@aditisharma',
      orders: orders.map((o) => ({
        ...o,
        invoicePdf: {
          name: o.pdfName,
          fileSize: o.pdfSize,
          uploadDate: '2026-09-12',
          previewUrl: 'https://images.unsplash.com/photo-1554415707-9e49666ffb24?w=800&auto=format&fit=crop&q=80',
        },
      })),
      totalOrderAmount: totalAmount,
    });

    setSubmittedClaim(newClaim);
    setStep(3);
    if (onSubmitted) onSubmitted(newClaim);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(''), 2000);
  };

  return (
    <div className="creator-sim-overlay" onClick={onClose}>
      <div className="creator-sim-container" onClick={e => e.stopPropagation()}>
        {/* Info Explainer Panel */}
        <div className="creator-sim-sidebar">
          <div className="creator-sim-sidebar__badge">
            <Smartphone size={13} />
            <span>Figma Creator Mobile Flow</span>
          </div>
          <h3 className="creator-sim-sidebar__title">
            Creator Reimbursement Flow
          </h3>
          <p className="creator-sim-sidebar__desc">
            This simulator reproduces the 3 screens from the Figma design. When submitted, the claim automatically syncs into <strong>Pulse Brand Dashboard</strong> under <strong>Under Review</strong> with all order details intact.
          </p>

          <div className="creator-sim-sidebar__steps">
            <div className={`creator-sim-sidebar__step-item ${step === 1 ? 'creator-sim-sidebar__step-item--active' : ''}`}>
              <div className="creator-sim-sidebar__step-num">1</div>
              <div>
                <strong>Purchase the Products</strong>
                <div style={{ fontSize: 12, color: '#686380' }}>Creator buys campaign brief items from store.</div>
              </div>
            </div>

            <div className={`creator-sim-sidebar__step-item ${step === 2 ? 'creator-sim-sidebar__step-item--active' : ''}`}>
              <div className="creator-sim-sidebar__step-num">2</div>
              <div>
                <strong>Submit Invoice (Order Details)</strong>
                <div style={{ fontSize: 12, color: '#686380' }}>Enters Order ID, Invoice No, Date, Amount, PDF.</div>
              </div>
            </div>

            <div className={`creator-sim-sidebar__step-item ${step === 3 ? 'creator-sim-sidebar__step-item--active' : ''}`}>
              <div className="creator-sim-sidebar__step-num">3</div>
              <div>
                <strong>Submitted Orders Status</strong>
                <div style={{ fontSize: 12, color: '#686380' }}>Tracks Under Review / Approved status & delivery.</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
            {step === 3 && (
              <button
                type="button"
                className="creator-sim-primary-btn"
                style={{ flex: 1 }}
                onClick={onClose}
              >
                Inspect in Pulse Dashboard →
              </button>
            )}
            <button
              type="button"
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 10,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={onClose}
            >
              Close Simulator
            </button>
          </div>
        </div>

        {/* Mobile Phone Device Shell */}
        <div className="creator-sim-phone">
          <div className="creator-sim-phone__notch" />
          <div className="creator-sim-phone__status-bar">
            <span>9:34 PM</span>
            <span>5G 📶 82%</span>
          </div>

          {/* Header */}
          <div className="creator-sim-app-header">
            {step > 1 ? (
              <button
                type="button"
                className="creator-sim-app-header__btn"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft size={18} />
              </button>
            ) : (
              <div style={{ width: 24 }} />
            )}
            <h4 className="creator-sim-app-header__title">
              {step === 3 ? 'Order Details Submitted!' : 'Submit Invoice'}
            </h4>
            <button
              type="button"
              className="creator-sim-app-header__btn"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>

          {/* Stepper */}
          <div className="creator-sim-stepper">
            <div className={`creator-sim-stepper__node ${step >= 1 ? 'creator-sim-stepper__node--active' : ''} ${step > 1 ? 'creator-sim-stepper__node--done' : ''}`}>
              <div className="creator-sim-stepper__circle">1</div>
              <span className="creator-sim-stepper__label">Purchase</span>
            </div>
            <div className={`creator-sim-stepper__node ${step >= 2 ? 'creator-sim-stepper__node--active' : ''} ${step > 2 ? 'creator-sim-stepper__node--done' : ''}`}>
              <div className="creator-sim-stepper__circle">2</div>
              <span className="creator-sim-stepper__label">Details</span>
            </div>
            <div className={`creator-sim-stepper__node ${step === 3 ? 'creator-sim-stepper__node--active creator-sim-stepper__node--done' : ''}`}>
              <div className="creator-sim-stepper__circle">3</div>
              <span className="creator-sim-stepper__label">Complete</span>
            </div>
          </div>

          {/* Screen 1: Purchase the Products */}
          {step === 1 && (
            <>
              <div className="creator-sim-screen-body">
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                    Purchase the Products
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                    Click on the links below to purchase the required product(s) from the official store.
                  </p>
                </div>

                {DEFAULT_PRODUCTS.map((prod) => (
                  <div key={prod.id} className="creator-sim-prod-card">
                    <img src={prod.image} alt={prod.name} className="creator-sim-prod-img" />
                    <div className="creator-sim-prod-info">
                      <div className="creator-sim-prod-title">{prod.name}</div>
                      <div className="creator-sim-prod-sub">{prod.subtitle}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#5046e5', marginTop: 4 }}>
                        {formatCurrency(prod.price)}
                      </div>
                    </div>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
                      title="Open store link"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                ))}

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 11, color: '#475569', lineHeight: 1.45 }}>
                  Once you've purchased all the products, tap the button below to proceed with submitting your order details for reimbursement.
                </div>
              </div>

              <div className="creator-sim-sticky-bar" style={{ justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="creator-sim-primary-btn"
                  style={{ width: '100%' }}
                  onClick={() => setStep(2)}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {/* Screen 2: Submit Invoice Form */}
          {step === 2 && (
            <>
              <div className="creator-sim-screen-body">
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                    Order Details
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                    Enter the details from your official purchase invoice.
                  </p>
                </div>

                {orders.map((ord, idx) => (
                  <div key={idx} className="creator-sim-order-box">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="creator-sim-order-title">Order {ord.orderIndex}</span>
                      {orders.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOrder(idx)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="creator-sim-field">
                      <label className="creator-sim-field__label">Order ID</label>
                      <input
                        type="text"
                        className="creator-sim-field__input"
                        placeholder="Enter Order ID"
                        value={ord.orderId}
                        onChange={(e) => handleOrderChange(idx, 'orderId', e.target.value)}
                      />
                    </div>

                    <div className="creator-sim-field">
                      <label className="creator-sim-field__label">Invoice Number</label>
                      <input
                        type="text"
                        className="creator-sim-field__input"
                        placeholder="Enter Invoice Number"
                        value={ord.invoiceNumber}
                        onChange={(e) => handleOrderChange(idx, 'invoiceNumber', e.target.value)}
                      />
                    </div>

                    <div className="creator-sim-field">
                      <label className="creator-sim-field__label">Order Date</label>
                      <input
                        type="date"
                        className="creator-sim-field__input"
                        value={ord.orderDate}
                        onChange={(e) => handleOrderChange(idx, 'orderDate', e.target.value)}
                      />
                    </div>

                    <div className="creator-sim-field">
                      <label className="creator-sim-field__label">Order Amount</label>
                      <input
                        type="number"
                        className="creator-sim-field__input"
                        placeholder="Enter Amount"
                        value={ord.orderAmount}
                        onChange={(e) => handleOrderChange(idx, 'orderAmount', e.target.value)}
                      />
                    </div>

                    <div className="creator-sim-upload-box">
                      <Upload size={18} color="#5046e5" />
                      <span className="creator-sim-upload-text">Upload Invoice PDF</span>
                      <span className="creator-sim-upload-sub">File size up to 10 MB ({ord.pdfName})</span>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddOrder}
                  style={{
                    background: '#1e1a38',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Plus size={14} />
                  <span>+ Add Another Order</span>
                </button>
              </div>

              <div className="creator-sim-sticky-bar">
                <div className="creator-sim-sticky-total">
                  <span className="creator-sim-sticky-total-label">Total Order Amount</span>
                  <span className="creator-sim-sticky-total-val">{formatCurrency(totalAmount)}</span>
                </div>
                <button
                  type="button"
                  className="creator-sim-primary-btn"
                  onClick={handleSubmitOrders}
                >
                  Submit
                </button>
              </div>
            </>
          )}

          {/* Screen 3: Order Details Submitted! Status View */}
          {step === 3 && (
            <div className="creator-sim-screen-body">
              <div style={{ textAlign: 'center', padding: '10px 0 6px' }}>
                <CheckCircle2 size={44} color="#10b981" style={{ margin: '0 auto 8px' }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                  Order Details Submitted!
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                  Your order details have been submitted successfully
                </p>
              </div>

              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                Submitted Orders ({orders.length})
              </div>

              {orders.map((ord, idx) => (
                <div key={idx} className="creator-sim-submitted-card">
                  <div className="creator-sim-submitted-head">
                    <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>
                      Order {ord.orderIndex}
                    </span>
                    <span className="creator-sim-badge creator-sim-badge--under-review">
                      Under Review
                    </span>
                  </div>

                  <div className="creator-sim-meta-row">
                    <span className="creator-sim-meta-label">Order ID :</span>
                    <span className="creator-sim-meta-value">{ord.orderId}</span>
                  </div>

                  <div className="creator-sim-meta-row">
                    <span className="creator-sim-meta-label">Invoice No :</span>
                    <span className="creator-sim-meta-value">{ord.invoiceNumber}</span>
                  </div>

                  <div className="creator-sim-meta-row">
                    <span className="creator-sim-meta-label">Order Date :</span>
                    <span className="creator-sim-meta-value">{ord.orderDate}</span>
                  </div>

                  <div className="creator-sim-meta-row">
                    <span className="creator-sim-meta-label">Order Amount :</span>
                    <span className="creator-sim-meta-value">{formatCurrency(ord.orderAmount)}</span>
                  </div>

                  <div className="creator-sim-meta-row">
                    <span className="creator-sim-meta-label">Submitted Date :</span>
                    <span className="creator-sim-meta-value">12 Sep, 2026</span>
                  </div>

                  <div className="creator-sim-received-box">
                    <span>Have you received this product?</span>
                    <button type="button" className="creator-sim-received-btn">
                      Yes ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
