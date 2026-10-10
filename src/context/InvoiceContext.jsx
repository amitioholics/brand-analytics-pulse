import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { INITIAL_INVOICES, INVOICE_STATUSES, INVOICE_CATEGORIES } from '../data/invoices';

const InvoiceContext = createContext(null);

export function InvoiceProvider({ children }) {
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('hp_creator_invoices_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_INVOICES.length) {
          return parsed;
        }
      } catch {
        return INITIAL_INVOICES;
      }
    }
    return INITIAL_INVOICES;
  });

  useEffect(() => {
    localStorage.setItem('hp_creator_invoices_v2', JSON.stringify(invoices));
  }, [invoices]);

  // Action: Verify / Approve Invoice
  const verifyInvoice = (invoiceId, verificationNotes = '') => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          const updatedOrders = (inv.orders || []).map(ord => ({
            ...ord,
            status: INVOICE_STATUSES.APPROVED,
          }));
          return {
            ...inv,
            orders: updatedOrders,
            status: INVOICE_STATUSES.APPROVED,
            verifiedBy: 'Brand Operations Partner',
            verifiedAt: new Date().toISOString(),
            verificationNotes: verificationNotes || 'Order details and purchase invoice verified against campaign brief. Approved for disbursement.',
            rejectionReason: null,
          };
        }
        return inv;
      })
    );
  };

  // Action: Reject Invoice with Reason
  const rejectInvoice = (invoiceId, reason, notes = '') => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          const updatedOrders = (inv.orders || []).map(ord => ({
            ...ord,
            status: INVOICE_STATUSES.REJECTED,
            rejectionReason: reason,
          }));
          return {
            ...inv,
            orders: updatedOrders,
            status: INVOICE_STATUSES.REJECTED,
            verifiedBy: 'Brand Operations Partner',
            verifiedAt: new Date().toISOString(),
            rejectionReason: reason || 'Receipt or line items do not meet campaign reimbursement criteria.',
            verificationNotes: notes || '',
          };
        }
        return inv;
      })
    );
  };

  // Action: Update individual order within a submission
  const updateOrderStatus = (invoiceId, orderIndex, newStatus, reason = null) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          const updatedOrders = (inv.orders || []).map(ord => {
            if (ord.orderIndex === orderIndex) {
              return {
                ...ord,
                status: newStatus,
                rejectionReason: reason || ord.rejectionReason,
              };
            }
            return ord;
          });
          const allApproved = updatedOrders.every(o => o.status === INVOICE_STATUSES.APPROVED);
          const allRejected = updatedOrders.every(o => o.status === INVOICE_STATUSES.REJECTED);
          const overallStatus = allApproved
            ? INVOICE_STATUSES.APPROVED
            : allRejected
            ? INVOICE_STATUSES.REJECTED
            : INVOICE_STATUSES.UNDER_REVIEW;

          return {
            ...inv,
            orders: updatedOrders,
            status: overallStatus,
          };
        }
        return inv;
      })
    );
  };

  // Action: Mark Invoice as Reimbursed / Settled
  const reimburseInvoice = (invoiceId, paymentReference = '', notes = '') => {
    const defaultUtr = `UTR-HDFC-${Math.floor(100000000 + Math.random() * 900000000)}`;
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: INVOICE_STATUSES.REIMBURSED,
            reimbursedAt: new Date().toISOString(),
            paymentReference: paymentReference || inv.paymentReference || defaultUtr,
            verificationNotes: notes || inv.verificationNotes || 'Reimbursement payment processed successfully.',
          };
        }
        return inv;
      })
    );
  };

  // Action: Re-open for review
  const reopenInvoice = (invoiceId) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          const resetOrders = (inv.orders || []).map(ord => ({
            ...ord,
            status: INVOICE_STATUSES.UNDER_REVIEW,
            rejectionReason: null,
          }));
          return {
            ...inv,
            orders: resetOrders,
            status: INVOICE_STATUSES.UNDER_REVIEW,
            rejectionReason: null,
            verificationNotes: 'Reopened for review by brand reviewer.',
          };
        }
        return inv;
      })
    );
  };

  // Action: Add new creator reimbursement submission (from Figma app simulation)
  const submitNewCreatorClaim = (newClaim) => {
    const orderItems = newClaim.orders && newClaim.orders.length > 0 ? newClaim.orders : [
      {
        orderIndex: 1,
        orderId: '0012344556',
        invoiceNumber: '0012344556',
        orderDate: '2026-09-20',
        orderAmount: 2000,
        submittedDate: '2026-09-12',
        productName: 'Head & Shoulders Deep Cleanse Shampoo',
        productSubtitle: 'Deep Cleanse Anti-Dandruff 650ml • Official Brand Store',
        productImage: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=80',
        invoicePdf: {
          name: 'Myntra_Invoice_0012344556.pdf',
          fileSize: '2.4 MB',
          uploadDate: '2026-09-12',
          previewUrl: 'https://images.unsplash.com/photo-1554415707-9e49666ffb24?w=800&auto=format&fit=crop&q=80',
        },
        productReceived: true,
        status: INVOICE_STATUSES.UNDER_REVIEW,
      }
    ];

    const totalAmt = orderItems.reduce((acc, o) => acc + (Number(o.orderAmount) || 0), 0);
    const primaryOrder = orderItems[0];

    const claimRecord = {
      id: `inv_${Date.now()}`,
      invoiceNumber: primaryOrder.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      primaryOrderId: primaryOrder.orderId || `00${Date.now().toString().slice(-8)}`,
      creatorId: newClaim.creatorId || 'cr_001',
      creatorName: newClaim.creatorName || 'Aditi Sharma',
      creatorHandle: newClaim.creatorHandle || '@aditisharma',
      creatorAvatarColor: '#655bef',
      creatorPlatform: 'Instagram',
      creatorEmail: 'aditi.sharma.collabs@gmail.com',
      creatorPhone: '+91 98201 55432',
      campaignId: newClaim.campaignId || 'camp_bc_001',
      campaignName: newClaim.campaignName || 'Myntra Autumn/Winter 2026 Runway Collab',
      portalType: 'brand-connect',
      submittedAt: new Date().toISOString(),
      submittedDate: '12 Sep, 2026',
      orderDate: primaryOrder.orderDate || '20 Sep, 2026',
      dueDate: '26 Sep, 2026',
      expenseCategory: INVOICE_CATEGORIES.PRODUCT_PURCHASE,
      description: newClaim.description || `Submitted ${orderItems.length} product purchase order(s) for brand reimbursement.`,
      orders: orderItems.map((o, idx) => ({
        ...o,
        id: `ord_${Date.now()}_${idx + 1}`,
        orderIndex: idx + 1,
        status: INVOICE_STATUSES.UNDER_REVIEW,
        productReceived: true,
      })),
      totalOrderAmount: totalAmt,
      totalAmount: totalAmt,
      subtotal: totalAmt,
      taxRate: 'Included in order',
      taxAmount: 0,
      currency: 'INR',
      status: INVOICE_STATUSES.UNDER_REVIEW,
      ordersCount: orderItems.length,
      allProductsReceived: true,
      lineItems: orderItems.map((ord, idx) => ({
        id: `li_claim_${idx}`,
        description: `${ord.productName || 'Campaign Product'} - Order #${ord.orderId}`,
        quantity: 1,
        unitPrice: Number(ord.orderAmount) || 0,
        total: Number(ord.orderAmount) || 0,
      })),
      taxInfo: {
        panNumber: 'ABCPS1234F',
        gstin: '27ABCPS1234F1Z5',
        msmeNumber: 'UDYAM-MH-01-0023411',
      },
      payoutDetails: {
        accountHolderName: newClaim.creatorName || 'Aditi Sharma',
        bankName: 'HDFC Bank Ltd',
        accountNumber: '••••••••4829',
        ifscCode: 'HDFC0001234',
        upiId: 'aditisharma@okhdfcbank',
        beneficiaryType: 'Individual / Creator',
      },
      attachments: orderItems.map((ord, idx) => ({
        id: `att_claim_${idx}`,
        name: ord.invoicePdf?.name || `Order_${ord.orderId}_Invoice.pdf`,
        fileSize: ord.invoicePdf?.fileSize || '2.4 MB',
        type: 'invoice_pdf',
        uploadDate: '2026-09-12',
        previewUrl: ord.invoicePdf?.previewUrl || 'https://images.unsplash.com/photo-1554415707-9e49666ffb24?w=800&auto=format&fit=crop&q=80',
      })),
    };

    setInvoices(prev => [claimRecord, ...prev]);
    return claimRecord;
  };

  // Reset to initial mock data
  const resetInvoices = () => {
    setInvoices(INITIAL_INVOICES);
    localStorage.setItem('hp_creator_invoices_v2', JSON.stringify(INITIAL_INVOICES));
  };

  // Selectors
  const getInvoiceById = (id) => invoices.find(inv => inv.id === id) || null;
  const getInvoicesForCampaign = (campaignId) => invoices.filter(inv => inv.campaignId === campaignId);
  const getInvoicesForCreator = (creatorId) => invoices.filter(inv => inv.creatorId === creatorId);

  // Computed metrics
  const pendingCount = useMemo(() =>
    invoices.filter(inv => inv.status === INVOICE_STATUSES.UNDER_REVIEW || inv.status === 'Pending Verification').length,
    [invoices]
  );
  const approvedCount = useMemo(() =>
    invoices.filter(inv => inv.status === INVOICE_STATUSES.APPROVED || inv.status === 'Verified').length,
    [invoices]
  );
  const reimbursedCount = useMemo(() =>
    invoices.filter(inv => inv.status === INVOICE_STATUSES.REIMBURSED).length,
    [invoices]
  );
  const rejectedCount = useMemo(() =>
    invoices.filter(inv => inv.status === INVOICE_STATUSES.REJECTED).length,
    [invoices]
  );

  const totalClaimedAmount = useMemo(() =>
    invoices.reduce((s, inv) => s + (inv.totalAmount || inv.totalOrderAmount || 0), 0),
    [invoices]
  );
  const totalPendingAmount = useMemo(() =>
    invoices
      .filter(inv => inv.status === INVOICE_STATUSES.UNDER_REVIEW || inv.status === 'Pending Verification')
      .reduce((s, inv) => s + (inv.totalAmount || inv.totalOrderAmount || 0), 0),
    [invoices]
  );
  const totalApprovedAmount = useMemo(() =>
    invoices
      .filter(inv => inv.status === INVOICE_STATUSES.APPROVED || inv.status === 'Verified')
      .reduce((s, inv) => s + (inv.totalAmount || inv.totalOrderAmount || 0), 0),
    [invoices]
  );
  const totalReimbursedAmount = useMemo(() =>
    invoices
      .filter(inv => inv.status === INVOICE_STATUSES.REIMBURSED)
      .reduce((s, inv) => s + (inv.totalAmount || inv.totalOrderAmount || 0), 0),
    [invoices]
  );

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        verifyInvoice,
        rejectInvoice,
        updateOrderStatus,
        reimburseInvoice,
        reopenInvoice,
        submitNewCreatorClaim,
        resetInvoices,
        getInvoiceById,
        getInvoicesForCampaign,
        getInvoicesForCreator,
        pendingCount,
        approvedCount,
        reimbursedCount,
        rejectedCount,
        totalClaimedAmount,
        totalPendingAmount,
        totalApprovedAmount,
        totalReimbursedAmount,
        INVOICE_STATUSES,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
}
