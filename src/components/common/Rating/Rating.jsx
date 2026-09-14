import React from 'react';
import { Star } from 'lucide-react';

export function Rating({ score = 5, reviewCount = 0, size = 14 }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const fillAmount = Math.max(0, Math.min(1, score - i));
    return { index: i, fillAmount };
  });

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.8rem',
        color: 'var(--lumora-text-muted)',
      }}
      aria-label={`Rating: ${score} out of 5 stars`}
    >
      <div style={{ display: 'inline-flex', gap: '2px', color: 'var(--lumora-star)' }}>
        {stars.map(({ index, fillAmount }) => (
          <Star
            key={index}
            size={size}
            fill={fillAmount > 0.5 ? 'currentColor' : 'none'}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <span style={{ fontWeight: 600, color: 'var(--lumora-text-main)', marginLeft: '2px' }}>
        {score.toFixed(1)}
      </span>
      {reviewCount > 0 && (
        <span style={{ fontSize: '0.75rem', color: 'var(--lumora-text-light)' }}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

export default Rating;
