import { Users, CheckCircle2, Truck, PackageCheck, Package, ArrowRight, Sparkles } from 'lucide-react';
import './BarterFulfillmentCard.css';

export default function BarterFulfillmentCard({ campaign, fulfillment, onCardClick }) {
  if (!fulfillment) return null;

  const {
    totalRegistered = 0,
    deliveredCount = 0,
    yetToReceiveCount = 0,
    inTransitCount = 0,
    dispatchedCount = 0,
    processingCount = 0,
    fulfillmentRate = 0,
  } = fulfillment;

  return (
    <div className="barter-fulfillment-card">
      <div className="barter-fulfillment-card__header">
        <div className="barter-fulfillment-card__header-left">
          <div className="barter-fulfillment-card__badge">
            <Package size={14} />
            <span>Barter Fulfillment & Creator Registrations</span>
          </div>
          <h3 className="barter-fulfillment-card__title">
            Product Dispatch & Delivery Tracking
          </h3>
          {campaign.barterKitName && (
            <p className="barter-fulfillment-card__subtitle">
              Dispatched Kit: <strong>{campaign.barterKitName}</strong>
            </p>
          )}
        </div>

        <div className="barter-fulfillment-card__header-right">
          <div className="barter-fulfillment-card__progress-info">
            <div className="barter-fulfillment-card__progress-label">
              <span>Overall Delivery Rate</span>
              <strong>{fulfillmentRate}% Fulfilled</strong>
            </div>
            <div className="barter-fulfillment-card__progress-track" title={`${deliveredCount} of ${totalRegistered} delivered`}>
              <div
                className="barter-fulfillment-card__progress-fill barter-fulfillment-card__progress-fill--delivered"
                style={{ width: `${totalRegistered > 0 ? (deliveredCount / totalRegistered) * 100 : 0}%` }}
              />
              <div
                className="barter-fulfillment-card__progress-fill barter-fulfillment-card__progress-fill--transit"
                style={{ width: `${totalRegistered > 0 ? (inTransitCount / totalRegistered) * 100 : 0}%` }}
              />
              <div
                className="barter-fulfillment-card__progress-fill barter-fulfillment-card__progress-fill--pending"
                style={{ width: `${totalRegistered > 0 ? ((dispatchedCount + processingCount) / totalRegistered) * 100 : 0}%` }}
              />
            </div>
            <div className="barter-fulfillment-card__progress-legend">
              <span className="legend-dot legend-dot--delivered">Delivered ({deliveredCount})</span>
              <span className="legend-dot legend-dot--transit">In Transit ({inTransitCount})</span>
              <span className="legend-dot legend-dot--pending">Packing ({dispatchedCount + processingCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Clickable Action Cards */}
      <div className="barter-fulfillment-card__tiles">
        {/* Tile 1: Registered Creators */}
        <div
          className="barter-tile barter-tile--registered"
          onClick={() => onCardClick && onCardClick('all')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onCardClick && onCardClick('all')}
          title="Click to see list of all registered creators"
        >
          <div className="barter-tile__icon-wrap">
            <Users size={22} />
          </div>
          <div className="barter-tile__content">
            <span className="barter-tile__label">Total Registered</span>
            <div className="barter-tile__val-row">
              <span className="barter-tile__value">{totalRegistered}</span>
              <span className="barter-tile__unit">Creators</span>
            </div>
            <p className="barter-tile__sub">Applied & approved in campaign</p>
          </div>
          <div className="barter-tile__footer">
            <span className="barter-tile__cta">View All Registered</span>
            <ArrowRight size={14} className="barter-tile__arrow" />
          </div>
        </div>

        {/* Tile 2: Got Products / Delivered */}
        <div
          className="barter-tile barter-tile--delivered"
          onClick={() => onCardClick && onCardClick('delivered')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onCardClick && onCardClick('delivered')}
          title="Click to see creators who have got their products"
        >
          <div className="barter-tile__icon-wrap">
            <PackageCheck size={22} />
          </div>
          <div className="barter-tile__content">
            <span className="barter-tile__label">Products Got / Delivered</span>
            <div className="barter-tile__val-row">
              <span className="barter-tile__value">{deliveredCount}</span>
              <span className="barter-tile__unit">Creators ({fulfillmentRate}%)</span>
            </div>
            <p className="barter-tile__sub">Shipment delivered & POD verified</p>
          </div>
          <div className="barter-tile__footer">
            <span className="barter-tile__cta">View Delivered Creators</span>
            <ArrowRight size={14} className="barter-tile__arrow" />
          </div>
        </div>

        {/* Tile 3: Yet to Get Products */}
        <div
          className="barter-tile barter-tile--pending"
          onClick={() => onCardClick && onCardClick('pending')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onCardClick && onCardClick('pending')}
          title="Click to see creators who are yet to get their products"
        >
          <div className="barter-tile__icon-wrap">
            <Truck size={22} />
          </div>
          <div className="barter-tile__content">
            <span className="barter-tile__label">Yet to Get Products</span>
            <div className="barter-tile__val-row">
              <span className="barter-tile__value">{yetToReceiveCount}</span>
              <span className="barter-tile__unit">Creators</span>
            </div>
            <p className="barter-tile__sub">
              {inTransitCount} in transit • {dispatchedCount} dispatched • {processingCount} packing
            </p>
          </div>
          <div className="barter-tile__footer">
            <span className="barter-tile__cta">View Pending Creators</span>
            <ArrowRight size={14} className="barter-tile__arrow" />
          </div>
        </div>
      </div>
    </div>
  );
}
