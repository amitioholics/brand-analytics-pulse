import { useState, useRef, useEffect } from 'react';
import { Download, Check } from 'lucide-react';
import './CreatorExportButton.css';

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

  // Prepend UTF-8 BOM (\uFEFF) so Excel / Numbers opens UTF-8 properly (currency, handles, etc.)
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

export default function CreatorExportButton({
  creators = [],
  filteredCreators = null,
  campaignName = 'HaulPack x Amazon Head & Shoulders',
  buttonText = 'Download Creator Data',
  variant = 'primary',
  title = 'Download creator performance & sales data as CSV',
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
    }, 3000);
  };

  const handleExport = (e) => {
    e.stopPropagation();

    // Prefer filtered list if present, otherwise export all creators
    const targetList = (filteredCreators && filteredCreators.length > 0)
      ? filteredCreators
      : creators;

    if (!targetList || !targetList.length) {
      showToast('No creator data available to download');
      return;
    }

    const headers = [
      'Rank',
      'Creator Name',
      'Social Handle',
      'Platforms',
      'Content Deliverables',
      'Reach / Views',
      'Units Sold',
      'Gross Sales (INR)',
      'Orders',
      'Avg Order Value (INR)',
      'Attribution Status',
      'Campaign Name',
      'Exported Date'
    ];

    const todayStr = new Date().toISOString().slice(0, 10);

    const rows = targetList.map((cr, idx) => {
      const platformsStr = (cr.platforms || [])
        .map(p => `${p.type === 'youtube' ? 'YouTube' : 'Instagram'}: ${p.label}`)
        .join(' | ') || (cr.platform || 'Instagram');

      const units = cr.unitsSold || 0;
      const sales = cr.sales || 0;
      const orders = cr.orders || units;
      const aov = orders > 0 ? (sales / orders).toFixed(2) : '0.00';

      return [
        idx + 1,
        cr.name || 'Creator',
        cr.handle || cr.socialHandle || '@creator',
        platformsStr,
        cr.content ?? cr.deliverables ?? 0,
        cr.views ?? cr.reach ?? 0,
        units,
        sales,
        orders,
        aov,
        sales > 0 ? 'Verified & Synced' : 'Enrolled',
        campaignName,
        todayStr
      ];
    });

    const slug = (campaignName || 'haulpack_creators')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const filename = `${slug}_creator_data_${todayStr}.csv`;

    triggerCSVDownload(filename, headers, rows);
    showToast(`Downloaded ${targetList.length} creators data as CSV`);
  };

  const isPrimary = variant === 'primary';

  return (
    <div className="cr-export-container">
      <button
        type="button"
        className={`cr-export-btn ${isPrimary ? 'cr-export-btn--primary' : 'cr-export-btn--secondary'}`}
        onClick={handleExport}
        title={title}
      >
        <Download size={13.5} className="cr-export-btn__icon" />
        <span className="cr-export-btn__text">{buttonText}</span>
      </button>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="cr-export-toast" role="status" aria-live="polite">
          <div className="cr-export-toast__icon">
            <Check size={13} strokeWidth={2.5} />
          </div>
          <span className="cr-export-toast__text">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

