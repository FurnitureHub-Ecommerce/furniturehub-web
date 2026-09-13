import './Rating.css';

/**
 * Rating – renders up to `max` stars filled to `value`.
 *
 * Props:
 *   value       {number}  – rating value (0–5)
 *   max         {number}  – total stars (default 5)
 *   showCount   {boolean} – show review count label
 *   count       {number}  – number of reviews
 */
function Rating({ value = 0, max = 5, showCount = false, count = 0 }) {
  return (
    <div className="rating" aria-label={`Rating: ${value} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`rating__star${i < Math.round(value) ? ' rating__star--filled' : ''}`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
      {showCount && count > 0 && (
        <span className="rating__count">({count})</span>
      )}
    </div>
  );
}

export default Rating;
