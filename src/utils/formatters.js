/* Utility formatters for numbers, currency, and dates */

export function formatNumber(num) {
  if (num === null || num === undefined) return '—';
  if (num >= 10000000) return (num / 10000000).toFixed(1).replace(/\.0$/, '') + 'Cr';
  if (num >= 100000) return (num / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toLocaleString('en-IN');
}

export function formatCurrency(num) {
  if (num === null || num === undefined) return '—';
  if (num >= 10000000) return '₹' + (num / 10000000).toFixed(1).replace(/\.0$/, '') + 'Cr';
  if (num >= 100000) return '₹' + (num / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
  if (num >= 1000) return '₹' + (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return '₹' + num.toLocaleString('en-IN');
}

export function formatCurrencyFull(num) {
  if (num === null || num === undefined) return '—';
  return '₹' + num.toLocaleString('en-IN');
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const dateFormatted = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${dateFormatted}, ${timeFormatted}`;
}

export function formatDateRange(start, end) {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function formatPercent(num) {
  if (num === null || num === undefined) return '—';
  return num.toFixed(1) + '%';
}

export function formatCompactNumber(num) {
  if (num === null || num === undefined) return '—';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function getDaysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
}

export function getSocialUrl(platform, handle) {
  if (!handle) return '#';
  const cleanHandle = handle.replace(/^@/, '');
  if (platform === 'YouTube') {
    return `https://www.youtube.com/@${cleanHandle}`;
  }
  return `https://www.instagram.com/${cleanHandle}/`;
}

