import { Star } from 'lucide-react';

export function Rating({ score = 0, reviewCount = 0, size = 14 }) {
  const numScore = Number(score) || 0;
  const numReviews = Number(reviewCount) || 0;

  if (numReviews <= 0 || numScore <= 0) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: '#8A8278',
          fontWeight: 500,
          letterSpacing: '0.02em',
        }}
      >
        Mới • Chưa có đánh giá
      </span>
    );
  }

  const stars = Array.from({ length: 5 }, (_, i) => {
    const fillAmount = Math.max(0, Math.min(1, numScore - i));
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
      aria-label={`Rating: ${numScore} out of 5 stars`}
    >
      <div style={{ display: 'inline-flex', gap: '2px', color: 'var(--lumora-star, #C89D5C)' }}>
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
        {numScore.toFixed(1)}
      </span>
      {numReviews > 0 && (
        <span style={{ fontSize: '0.75rem', color: 'var(--lumora-text-light)' }}>
          ({numReviews})
        </span>
      )}
    </div>
  );
}

export default Rating;
