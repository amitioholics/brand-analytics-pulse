import { useState, useRef, useEffect } from 'react';
import {
  Download, ChevronDown, FileSpreadsheet, Receipt, Filter, FileJson, Check
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
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

/**
 * Initiates browser download of a JSON file
 */
function triggerJSONDownload(filename, data) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function InvoiceExportButton({
  invoices = [],
  filteredInvoices = null,
  campaignName = '',
  statusFilter = 'all',
  buttonText = 'Export',
  align = 'right',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const menuRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Cleanup toast timer on unmount
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
    }, 3200);
  };

  const activeFilteredList = filteredInvoices || invoices;
  const totalInvoicesCount = invoices.length;
  const filteredCount = activeFilteredList.length;

  const totalAmountAll = invoices.reduce((sum, inv) => {
    return sum + (inv.totalOrderAmount || inv.totalAmount || 0);
  }, 0);

  const getSlug = (str) => {
    return (str || 'campaign')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const campSlug = getSlug(campaignName || 'haulpack_invoices');

  // 1. Export All Invoices (Summary)
  const handleExportAll = () => {
    if (!invoices.length) return;
    const headers = [
      'Invoice / Claim ID',
      'Primary Order ID',
      'Creator Name',
      'Creator Handle',
      'Platform',
      'Creator Email',
      'Campaign Name',
      'Expense Category',
      'Orders Count',
      'Total Claimed (INR)',
      'Approved Amount (INR)',
      'Status',
      'Order Date',
      'Submitted Date',
      'Verified By',
      'Verified Date',
      'Rejection Reason'
    ];

    const rows = invoices.map(inv => {
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
        inv.creatorEmail || '',
        inv.campaignName || campaignName || '',
        inv.expenseCategory || 'Product Purchase Reimbursement',
        orders.length || inv.ordersCount || 1,
        inv.totalOrderAmount || inv.totalAmount || 0,
        approvedAmount,
        inv.status || 'Approved',
        inv.orderDate || inv.submittedDate || '',
        inv.submittedDate || '',
        inv.verifiedBy || (inv.status === 'Approved' ? 'HaulPack Admin' : ''),
        inv.verifiedAt ? inv.verifiedAt.slice(0, 10) : '',
        inv.rejectionReason || ''
      ];
    });

    const filename = `${campSlug}_all_invoices_${todayStr}.csv`;
    triggerCSVDownload(filename, headers, rows);
    showToast(`Exported all ${invoices.length} invoices to ${filename}`);
    setIsOpen(false);
  };

  // 2. Export Filtered View (Summary)
  const handleExportFiltered = () => {
    if (!activeFilteredList.length) return;
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
      'Rejection Reason'
    ];

    const rows = activeFilteredList.map(inv => {
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
        inv.rejectionReason || ''
      ];
    });

    const filterLabel = statusFilter !== 'all' ? statusFilter.replace(/_/g, '-') : 'filtered';
    const filename = `${campSlug}_${filterLabel}_invoices_${todayStr}.csv`;
    triggerCSVDownload(filename, headers, rows);
    showToast(`Exported ${activeFilteredList.length} filtered invoices to ${filename}`);
    setIsOpen(false);
  };

  // 3. Export Itemized Line-Items Breakdown (Each Order receipt as a row)
  const handleExportItemized = () => {
    if (!invoices.length) return;
    const headers = [
      'Claim ID',
      'Creator Name',
      'Creator Handle',
      'Platform',
      'Campaign Name',
      'Order Item Index',
      'Amazon Order ID',
      'Invoice / Receipt #',
      'Order Date',
      'Order Amount (INR)',
      'Product Received',
      'Order Status (Admin)',
      'Overall Claim Status',
      'Admin Verification Note',
      'Rejection Reason'
    ];

    const rows = [];
    invoices.forEach(inv => {
      const orders = inv.orders && inv.orders.length > 0 ? inv.orders : [
        {
          orderIndex: 1,
          orderId: inv.primaryOrderId || inv.invoiceNumber || '—',
          invoiceNumber: inv.invoiceNumber || '—',
          orderAmount: inv.totalOrderAmount || inv.totalAmount || 0,
          status: inv.status || 'Approved',
          productReceived: true,
          orderDate: inv.orderDate || inv.submittedDate || '',
        }
      ];

      orders.forEach((ord, idx) => {
        rows.push([
          inv.invoiceNumber || inv.id,
          inv.creatorName || '',
          inv.creatorHandle || '',
          inv.creatorPlatform || 'Instagram',
          inv.campaignName || campaignName || '',
          `Order #${ord.orderIndex || idx + 1}`,
          ord.orderId || inv.primaryOrderId || '—',
          ord.invoiceNumber || inv.invoiceNumber || '—',
          ord.orderDate || inv.orderDate || inv.submittedDate || '',
          ord.orderAmount || 0,
          ord.productReceived !== false ? 'Yes' : 'No',
          ord.status || inv.status || 'Approved',
          inv.status || 'Approved',
          inv.verificationNotes || (ord.status === 'Approved' || inv.status === 'Approved' ? 'Verified by HaulPack Admin' : 'Awaiting verification'),
          ord.rejectionReason || inv.rejectionReason || ''
        ]);
      });
    });

    const filename = `${campSlug}_itemized_orders_${todayStr}.csv`;
    triggerCSVDownload(filename, headers, rows);
    showToast(`Exported ${rows.length} line items across ${invoices.length} claims to ${filename}`);
    setIsOpen(false);
  };

  // 4. Export as JSON
  const handleExportJSON = () => {
    if (!invoices.length) return;
    const payload = {
      exportDate: new Date().toISOString(),
      campaign: campaignName || 'HaulPack Brand Campaign',
      totalClaims: invoices.length,
      totalClaimedAmount: totalAmountAll,
      currency: 'INR',
      invoices: invoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        primaryOrderId: inv.primaryOrderId,
        creator: {
          name: inv.creatorName,
          handle: inv.creatorHandle,
          platform: inv.creatorPlatform,
          email: inv.creatorEmail || null,
        },
        expenseCategory: inv.expenseCategory,
        totalAmount: inv.totalOrderAmount || inv.totalAmount,
        status: inv.status,
        submittedDate: inv.submittedDate,
        orderDate: inv.orderDate,
        verifiedBy: inv.verifiedBy,
        orders: inv.orders || [],
      })),
    };

    const filename = `${campSlug}_invoices_${todayStr}.json`;
    triggerJSONDownload(filename, payload);
    showToast(`Exported ${invoices.length} invoices as JSON`);
    setIsOpen(false);
  };

  return (
    <div className="inv-export-container" ref={menuRef}>
      <button
        type="button"
        className={`inv-export-btn ${isOpen ? 'inv-export-btn--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Export reimbursement invoices to CSV or JSON"
        aria-expanded={isOpen}
      >
        <Download size={13.5} className="inv-export-btn__icon" />
        <span className="inv-export-btn__text">{buttonText}</span>
        {totalInvoicesCount > 0 && (
          <span className="inv-export-btn__badge">{totalInvoicesCount}</span>
        )}
        <ChevronDown size={12} className={`inv-export-btn__chevron ${isOpen ? 'inv-export-btn__chevron--open' : ''}`} />
      </button>

      {isOpen && (
        <div className={`inv-export-menu ${align === 'left' ? 'inv-export-menu--left' : 'inv-export-menu--right'}`}>
          <div className="inv-export-menu__header">
            <span className="inv-export-menu__header-title">Export Invoices</span>
            <span className="inv-export-menu__header-sub">
              {totalInvoicesCount} claims · {formatCurrency(totalAmountAll)}
            </span>
          </div>

          <div className="inv-export-menu__list">
            {/* Option 1: All Invoices */}
            <button
              type="button"
              className="inv-export-menu__item"
              onClick={handleExportAll}
            >
              <div className="inv-export-menu__item-icon inv-export-menu__item-icon--green">
                <FileSpreadsheet size={15} />
              </div>
              <div className="inv-export-menu__item-content">
                <div className="inv-export-menu__item-title">
                  <span>All Invoices (CSV)</span>
                  <span className="inv-export-menu__item-tag">{totalInvoicesCount}</span>
                </div>
                <div className="inv-export-menu__item-desc">
                  Summary list of all claims with payout totals & verification status
                </div>
              </div>
            </button>

            {/* Option 2: Filtered View (if filter or search applied) */}
            {filteredCount !== totalInvoicesCount && (
              <button
                type="button"
                className="inv-export-menu__item"
                onClick={handleExportFiltered}
              >
                <div className="inv-export-menu__item-icon inv-export-menu__item-icon--blue">
                  <Filter size={15} />
                </div>
                <div className="inv-export-menu__item-content">
                  <div className="inv-export-menu__item-title">
                    <span>Current Filtered View (CSV)</span>
                    <span className="inv-export-menu__item-tag">{filteredCount}</span>
                  </div>
                  <div className="inv-export-menu__item-desc">
                    Only export claims matching current {statusFilter !== 'all' ? `"${statusFilter.replace(/_/g, ' ')}"` : 'search'} filters
                  </div>
                </div>
              </button>
            )}

            {/* Option 3: Itemized Orders Breakdown */}
            <button
              type="button"
              className="inv-export-menu__item"
              onClick={handleExportItemized}
            >
              <div className="inv-export-menu__item-icon inv-export-menu__item-icon--purple">
                <Receipt size={15} />
              </div>
              <div className="inv-export-menu__item-content">
                <div className="inv-export-menu__item-title">
                  <span>Itemized Orders Breakdown (CSV)</span>
                </div>
                <div className="inv-export-menu__item-desc">
                  Line-by-line Amazon order IDs, receipt numbers & admin status
                </div>
              </div>
            </button>

            {/* Option 4: JSON Export */}
            <button
              type="button"
              className="inv-export-menu__item"
              onClick={handleExportJSON}
            >
              <div className="inv-export-menu__item-icon inv-export-menu__item-icon--amber">
                <FileJson size={15} />
              </div>
              <div className="inv-export-menu__item-content">
                <div className="inv-export-menu__item-title">
                  <span>Export as JSON</span>
                </div>
                <div className="inv-export-menu__item-desc">
                  Structured data for finance API or ERP import (Tally, Zoho)
                </div>
              </div>
            </button>
          </div>

          <div className="inv-export-menu__footer">
            <span>✓ Compatible with Excel, Google Sheets & accounting tools</span>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="inv-export-toast" role="status" aria-live="polite">
          <div className="inv-export-toast__icon">
            <Check size={14} strokeWidth={2.5} />
          </div>
          <span className="inv-export-toast__text">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
