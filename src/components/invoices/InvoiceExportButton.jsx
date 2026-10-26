import { useState, useRef, useEffect } from 'react';
import { Download, Check } from 'lucide-react';
import './InvoiceExportButton.css';

/**
 * Escapes a cell value for standard CSV compatibility (RFC 4180)
 */
function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Initiates browser download of a CSV file with UTF-8 BOM for Excel support
 */
function triggerCSVDownload(filename, headers, rows) {
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\r\n');

  // Prepend UTF-8 BOM (\uFEFF) so Excel opens UTF-8 properly (currency symbols, names, etc.)
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function InvoiceExportButton({
  invoices = [],
  filteredInvoices = null,
  campaignName = '',
  buttonText = 'Export',
}) {
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const showToast = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleDirectExport = () => {
    // Prefer filtered list if present, otherwise export all invoices
    const targetList = (filteredInvoices && filteredInvoices.length > 0)
      ? filteredInvoices
      : invoices;

    if (!targetList || !targetList.length) return;

    const headers = [
      'Invoice / Claim ID',
      'Primary Order ID',
      'Creator Name',
      'Creator Handle',
      'Platform',
      'Campaign Name',
      'Expense Category',
      'Orders Count',
      'Total Claimed (INR)',
      'Approved Amount (INR)',
      'Status',
      'Order Date',
      'Submitted Date',
      'Verified By',
      'Verification Notes',
      'Rejection Reason'
    ];

    const rows = targetList.map(inv => {
      const orders = inv.orders || [];
      const approvedAmount = orders.length > 0
        ? orders.filter(o => o.status === 'Approved' || o.status === 'Verified').reduce((sum, o) => sum + (o.orderAmount || 0), 0)
        : (inv.status === 'Approved' ? (inv.totalAmount || inv.totalOrderAmount || 0) : 0);

      return [
        inv.invoiceNumber || inv.id,
        inv.primaryOrderId || (orders[0]?.orderId) || '',
        inv.creatorName || '',
        inv.creatorHandle || '',
        inv.creatorPlatform || 'Instagram',
        inv.campaignName || campaignName || '',
        inv.expenseCategory || 'Product Purchase Reimbursement',
        orders.length || inv.ordersCount || 1,
        inv.totalOrderAmount || inv.totalAmount || 0,
        approvedAmount,
        inv.status || 'Approved',
        inv.orderDate || inv.submittedDate || '',
        inv.submittedDate || '',
        inv.verifiedBy || (inv.status === 'Approved' ? 'HaulPack Admin' : ''),
        inv.verificationNotes || '',
        inv.rejectionReason || ''
      ];
    });

    const slug = (campaignName || 'haulpack_invoices')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const todayStr = new Date().toISOString().slice(0, 10);
    const filename = `${slug}_invoices_${todayStr}.csv`;

    triggerCSVDownload(filename, headers, rows);
    showToast(`Downloaded ${targetList.length} invoices as CSV`);
  };

  return (
    <div className="inv-export-container">
      <button
        type="button"
        className="inv-export-btn"
        onClick={handleDirectExport}
        title="Download invoices as CSV"
      >
        <Download size={13.5} className="inv-export-btn__icon" />
        <span className="inv-export-btn__text">{buttonText}</span>
      </button>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="inv-export-toast" role="status" aria-live="polite">
          <div className="inv-export-toast__icon">
            <Check size={13} strokeWidth={2.5} />
          </div>
          <span className="inv-export-toast__text">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
