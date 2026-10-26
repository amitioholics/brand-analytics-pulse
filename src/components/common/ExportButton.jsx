import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';

function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function downloadDataCSV(filename, data) {
  if (!Array.isArray(data) || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(item => headers.map(h => escapeCSV(item[h])).join(','));
  const csvContent = [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
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

export default function ExportButton({ data = null, filename = 'report' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = () => {
    if (data && Array.isArray(data) && data.length > 0) {
      downloadDataCSV(filename, data);
    } else {
      setOpen(!open);
    }
  };

  const handleExport = (type) => {
    downloadDataCSV(`${type.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`, [
      { Report: type, ExportedAt: new Date().toISOString(), Status: 'Success' }
    ]);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={handleClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px',
          background: 'var(--hp-primary)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Download size={15} />
        Export
        {!data && <ChevronDown size={14} />}
      </button>

      {open && !data && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 4,
          background: 'var(--hp-white)',
          border: '1px solid var(--hp-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          minWidth: 200,
          zIndex: 50,
          overflow: 'hidden',
        }}>
          {['Campaign Report', 'Creator Report', 'Content Report'].map(item => (
            <button
              key={item}
              onClick={() => handleExport(item)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                fontSize: 'var(--text-sm)',
                color: 'var(--hp-text-primary)',
                fontWeight: 500,
                borderBottom: '1px solid var(--hp-border-light)',
                transition: 'background 0.15s',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.target.style.background = 'var(--hp-bg)'}
              onMouseLeave={e => e.target.style.background = 'transparent'}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
