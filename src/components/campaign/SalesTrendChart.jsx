import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Package, DollarSign
} from 'lucide-react';
import {
  getSalesPipelineTimeline
} from '../../data/productSales';
import { formatCurrency, formatCompactNumber, formatDateShort } from '../../utils/formatters';
import './SalesTrendChart.css';

const METRIC_TABS = [
  { id: 'sales', label: 'Daily Sales', icon: TrendingUp, color: '#10b981', gradientId: 'gradSales' },
  { id: 'cumulative', label: 'Cumulative Revenue', icon: DollarSign, color: '#6538ea', gradientId: 'gradCumSales' },
  { id: 'units', label: 'Units Sold', icon: Package, color: '#3b82f6', gradientId: 'gradUnits' },
];

const TIME_FILTERS = [
  { id: '7', label: '7 Days' },
  { id: '14', label: '14 Days' },
  { id: 'all', label: 'Campaign Duration' },
];

function formatFullDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function CustomTooltip({ active, payload, label, selectedMetric }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div className="sales-trend-tooltip">
      <div className="sales-trend-tooltip__date">{formatFullDate(label)}</div>
      <div className="sales-trend-tooltip__main">
        {selectedMetric === 'sales' && (
          <>
            <span className="sales-trend-tooltip__val" style={{ color: '#10b981' }}>
              {formatCurrency(item.sales)}
            </span>
            <span className="sales-trend-tooltip__sub">({item.units} units sold)</span>
          </>
        )}
        {selectedMetric === 'cumulative' && (
          <>
            <span className="sales-trend-tooltip__val" style={{ color: '#6538ea' }}>
              {formatCurrency(item.cumulativeSales)}
            </span>
            <span className="sales-trend-tooltip__sub">Cumulative GMV</span>
          </>
        )}
        {selectedMetric === 'units' && (
          <>
            <span className="sales-trend-tooltip__val" style={{ color: '#3b82f6' }}>
              {item.units} units
            </span>
            <span className="sales-trend-tooltip__sub">({formatCurrency(item.sales)})</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function SalesTrendChart({ campaignId = '6ace2b3abe742272b6135d8e' }) {
  const [selectedMetric, setSelectedMetric] = useState('sales');
  const [timeFilter, setTimeFilter] = useState('all');

  const rawTimeline = useMemo(() => {
    return getSalesPipelineTimeline(campaignId, timeFilter);
  }, [campaignId, timeFilter]);

  const activeMetricConfig = METRIC_TABS.find(m => m.id === selectedMetric) || METRIC_TABS[0];

  const chartData = useMemo(() => {
    return rawTimeline.map(item => ({
      date: item.date,
      value: selectedMetric === 'cumulative'
        ? item.cumulativeSales
        : selectedMetric === 'units'
        ? item.units
        : item.sales,
      sales: item.sales,
      units: item.units,
      cumulativeSales: item.cumulativeSales,
    }));
  }, [rawTimeline, selectedMetric]);

  return (
    <div className="sales-trend-box">
      {/* Header */}
      <div className="sales-trend-box__header">
        <div className="sales-trend-box__title-wrap">
          <div className="sales-trend-box__title-row">
            <div className="sales-trend-box__icon-badge">
              <TrendingUp size={16} color="#10b981" />
            </div>
            <h3 className="sales-trend-box__title">Sales Growth Trend & Pipeline Velocity</h3>
          </div>
          <p className="sales-trend-box__subtitle">
            Daily tracked gross merchandise value (GMV) and product sales velocity attributed to creator storefront links.
          </p>
        </div>
      </div>

      {/* Control Switchers: Metric Tabs + Time Filters */}
      <div className="sales-trend-controls">
        <div className="sales-trend-metric-tabs">
          {METRIC_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = selectedMetric === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`sales-trend-metric-tab ${isActive ? 'sales-trend-metric-tab--active' : ''}`}
                onClick={() => setSelectedMetric(tab.id)}
                style={isActive ? { borderColor: tab.color, color: tab.color, background: `${tab.color}10` } : undefined}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="sales-trend-time-filters">
          {TIME_FILTERS.map(tf => (
            <button
              key={tf.id}
              type="button"
              className={`sales-trend-time-btn ${timeFilter === tf.id ? 'sales-trend-time-btn--active' : ''}`}
              onClick={() => setTimeFilter(tf.id)}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Area Chart */}
      <div className="sales-trend-chart-area">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradCumSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6538ea" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#6538ea" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradUnits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={selectedMetric === 'units' ? (v) => v : (v) => formatCompactNumber(v)}
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              width={65}
            />
            <Tooltip content={<CustomTooltip selectedMetric={selectedMetric} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={activeMetricConfig.color}
              strokeWidth={2.5}
              fill={`url(#${activeMetricConfig.gradientId})`}
              dot={{ r: 3, fill: activeMetricConfig.color, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: activeMetricConfig.color, stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
