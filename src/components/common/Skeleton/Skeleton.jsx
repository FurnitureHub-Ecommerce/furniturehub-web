import React from 'react';
import './Skeleton.css';

export function Skeleton({ width, height, borderRadius, style, className = '' }) {
  const customStyles = {
    width: width || '100%',
    height: height || '1rem',
    borderRadius: borderRadius || 'var(--radius-sm)',
    ...style,
  };

  return <div className={`skeleton ${className}`} style={customStyles} aria-hidden="true" />;
}

export function ProductCardSkeleton() {
  return (
    <div className="product-skeleton-card">
      <Skeleton height="320px" borderRadius="var(--radius-md)" />
      <div className="product-skeleton-card__body">
        <Skeleton width="40%" height="0.8rem" style={{ marginTop: '12px' }} />
        <Skeleton width="85%" height="1.2rem" style={{ marginTop: '8px' }} />
        <Skeleton width="60%" height="1rem" style={{ marginTop: '8px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
          <Skeleton width="30%" height="1.2rem" />
          <Skeleton width="40%" height="2rem" borderRadius="var(--radius-full)" />
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="hero-skeleton">
      <Skeleton height="580px" borderRadius="0" />
    </div>
  );
}

export default Skeleton;
