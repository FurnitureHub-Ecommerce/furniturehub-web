import React, { useState } from 'react';
import { MapPin, Check, Clock, Shield } from 'lucide-react';
import { orders, orderMetrics } from '../../data/orderData';
import StaffMetrics from '../../components/staff/StaffMetrics/StaffMetrics';
import OrderTable from '../../components/order/OrderTable/OrderTable';

const StaffOrders = () => {
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || null);
  const [showNotification, setShowNotification] = useState(true);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  return (
    <div className="staff-orders">
      {/* Role Guard Banner */}
      <div className="role-guard-banner">
        <div className="role-guard__left">
          <div className="role-guard__status">
            <span className="role-guard__dot" />
            <span className="role-guard__label">STAFF ROLE GUARD ACTIVE</span>
          </div>
          <span className="role-guard__scope">
            <strong>AuthScope:</strong> staff.fulfillment.manage — Verified station Desk Terminal A-04.
          </span>
        </div>
        <div className="role-guard__right">
          <span className="sla-badge">
            <Clock size={14} />
            Shift A active
          </span>
        </div>
      </div>

      {/* Page Header */}
      <div className="staff-page-header">
        <div className="staff-page-header__info">
          <p className="staff-breadcrumb">
            OPERATIONS PROTOCOL // ROUTE /STAFF / ROTTERDAM CENTRAL HUB
          </p>
          <h1>Order Verification & Fulfillment Desk</h1>
        </div>
        <div className="staff-page-header__actions">
          <span className="sla-badge">
            <Shield size={14} />
            SLA Window: 48m Rem
          </span>
          <button className="batch-release-btn">
            Batch Release (4)
          </button>
        </div>
      </div>

      {/* Order Metrics */}
      <StaffMetrics metrics={orderMetrics} />

      {/* Two-Column Layout */}
      <div className="order-desk-layout">
        {/* Left: Active Orders Table */}
        <OrderTable
          orders={orders}
          selectedOrderId={selectedOrderId}
          onSelectOrder={setSelectedOrderId}
        />

        {/* Right: Order Inspection Panel */}
        {selectedOrder && (
          <div className="order-inspection">
            {/* Header */}
            <div className="order-inspection__header">
              <div>
                <span className="order-inspection__title">
                  ORDER INSPECTION &nbsp; /staff/orders/:id
                </span>
                <div className="order-inspection__id">{selectedOrder.id}</div>
              </div>
              <div className="order-inspection__priority">
                <span className="order-inspection__priority-label">PRIORITY SLA</span>
                <span className="order-inspection__priority-value">Express White-Glove</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="order-inspection__section">
              <span className="order-inspection__section-title">
                LINE ITEMS ({selectedOrder.items.length})
              </span>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="line-item">
                  <img src={item.image} alt={item.name} className="line-item__image" />
                  <div className="line-item__details">
                    <div className="line-item__name">{item.fullName || item.name}</div>
                    <div className="line-item__sku">{item.sku} · Qty: {item.qty}</div>
                    <div className="line-item__finish">{item.finish}</div>
                  </div>
                  <div className="line-item__price">{item.price}</div>
                </div>
              ))}
            </div>

            {/* Client Directive (if any) */}
            {selectedOrder.clientDirective && (
              <div className="order-inspection__section">
                <div className="client-directive">
                  <span className="client-directive__label">
                    ✦ CUSTOM ATELIER CLIENT DIRECTIVES
                  </span>
                  "{selectedOrder.clientDirective}"
                </div>
              </div>
            )}

            {/* Delivery Specification */}
            <div className="order-inspection__section">
              <span className="order-inspection__section-title">DELIVERY SPECIFICATION</span>
              <div className="delivery-spec">
                <div className="delivery-spec__icon">
                  <MapPin size={16} />
                </div>
                <div className="delivery-spec__info">
                  <div className="delivery-spec__address">{selectedOrder.delivery.address}</div>
                  <div className="delivery-spec__city">{selectedOrder.delivery.city}</div>
                  <div className="delivery-spec__notes">
                    <span>
                      <strong>Service:</strong> {selectedOrder.delivery.serviceNote}
                    </span>
                    <span>
                      <strong>Access Window:</strong> {selectedOrder.delivery.accessWindow}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="order-actions">
              <button className="btn-approve">
                <Check size={16} />
                APPROVE & ALLOCATE
              </button>
              <button className="btn-decline">DECLINE / FLAG</button>
            </div>

            {/* Lifecycle Progress Stepper */}
            <div className="lifecycle-stepper">
              <div className="lifecycle-stepper__title">Lifecycle Progress Stepper</div>
              <div className="lifecycle-stepper__subtitle">
                /staff/orders/{selectedOrder.id}/status &nbsp;&nbsp; Live Pipeline Status
              </div>
              <div className="lifecycle-steps">
                {selectedOrder.lifecycle.map((step) => (
                  <div
                    key={step.step}
                    className={`lifecycle-step lifecycle-step--${step.status}`}
                  >
                    <div className="lifecycle-step__circle">
                      {step.status === 'completed' ? <Check size={14} /> : step.step}
                    </div>
                    <span className="lifecycle-step__label">{step.label}</span>
                    <span className="lifecycle-step__time">{step.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Client CRM Profile */}
            <div className="client-crm">
              <div className="client-crm__header">
                <div>
                  <div className="client-crm__title">Client CRM Profile</div>
                  <div className="client-crm__route">/staff/customers/{selectedOrder.client.id}</div>
                </div>
                <span className="client-crm__tier">{selectedOrder.client.tier}</span>
              </div>

              <div className="client-crm__profile">
                <img
                  src={selectedOrder.client.avatar}
                  alt={selectedOrder.client.name}
                  className="client-crm__avatar"
                />
                <div className="client-crm__info">
                  <div className="client-crm__name">{selectedOrder.client.name}</div>
                  <span className="client-crm__contact">{selectedOrder.client.email}</span>
                  <span className="client-crm__contact">{selectedOrder.client.phone}</span>
                </div>
                <div className="client-crm__ltv">
                  <span className="client-crm__ltv-label">LIFETIME LTV</span>
                  <span className="client-crm__ltv-value">{selectedOrder.client.lifetimeValue}</span>
                </div>
              </div>

              {/* Concierge Notes */}
              {selectedOrder.conciergeNotes.length > 0 && (
                <div>
                  <span className="concierge-notes__title">
                    RECENT DIALOGUE & CONCIERGE NOTES
                  </span>
                  {selectedOrder.conciergeNotes.map((note, idx) => (
                    <div key={idx} className="concierge-note">
                      <div className="concierge-note__header">
                        <span className="concierge-note__type">{note.type}</span>
                        <span className="concierge-note__date">{note.date}</span>
                      </div>
                      <p className="concierge-note__text">{note.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dispatch Notification */}
            {showNotification && (
              <div className="dispatch-notification">
                <div className="dispatch-notification__content">
                  <span className="dispatch-notification__title">
                    DISPATCH HANDSHAKE VALIDATED
                  </span>
                  <span className="dispatch-notification__text">
                    Order {selectedOrder.id} confirmed and sent to Storage Ops.
                  </span>
                </div>
                <button
                  className="dispatch-notification__close"
                  onClick={() => setShowNotification(false)}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffOrders;
