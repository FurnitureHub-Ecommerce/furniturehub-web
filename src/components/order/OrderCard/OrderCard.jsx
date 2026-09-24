import React from 'react';
import OrderStatusBadge from '../OrderStatusbadge/OrderStatusBadge';
import './OrderCard.css';

const OrderCard = ({ order }) => {
  return (
    <div className="order-card">
      <div className="order-card__header">
        <span className="order-card__id">{order.id}</span>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="order-card__body">
        <div className="order-card__client">
          <strong>{order.clientName}</strong>
          <span className="order-card__tier">{order.clientTier}</span>
        </div>
        <div className="order-card__details">
          <span>{order.date}</span>
          <strong className="order-card__total">{order.total}</strong>
        </div>
      </div>
      <div className="order-card__items">
        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default OrderCard;
