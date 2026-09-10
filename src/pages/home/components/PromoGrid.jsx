import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './PromoGrid.css';

import imgDesk  from '../../../assets/images/promo-desk.png';
import imgTeak  from '../../../assets/images/promo-teak.png';
import imgSofa  from '../../../assets/images/promo-sofa.png';
import imgLamp  from '../../../assets/images/promo-lamp.png';

/** Map image key → imported asset */
const IMAGE_MAP = {
  'promo-desk': imgDesk,
  'promo-teak': imgTeak,
  'promo-sofa': imgSofa,
  'promo-lamp': imgLamp,
};

/**
 * PromoGrid
 *
 * Desktop layout (3 CSS Grid columns):
 *   [Large – desk]  [Small – teak ]  [Large – lamp]
 *                   [Small – sofa ]
 *
 * Data comes from homeData.js – no inline hardcoding.
 */
import { PROMO_BANNERS } from '../../../data/homeData';

function PromoGrid() {
  return (
    <section className="promo-grid" aria-label="Promotional banners">
      {PROMO_BANNERS.map((banner, idx) => {
        const isLarge = banner.type === 'large';
        const isRight = idx === 3;           // last item = right column

        return (
          <article
            key={banner.id}
            className={[
              'promo-banner',
              isLarge ? 'promo-banner--large' : 'promo-banner--small',
              `promo-banner--${banner.id}`,
              isRight ? 'promo-banner--right' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {/* Product image */}
            <img
              src={IMAGE_MAP[banner.image]}
              alt={banner.title.replace('\n', ' ')}
              className="promo-banner__img"
              loading="lazy"
            />

            {/* Discount badge (if applicable) */}
            {banner.badge && (
              <span className="promo-banner__badge" aria-label={`Discount ${banner.badge}`}>
                {banner.badge}
              </span>
            )}

            {/* Text content */}
            <div className="promo-banner__content">
              <h3 className="promo-banner__title">{banner.title}</h3>

              {banner.price && (
                <p className="promo-banner__price">{banner.price}</p>
              )}

              {banner.cta && (
                <Link
                  id={`promo-cta-${banner.id}`}
                  to={banner.link}
                  className="promo-banner__cta"
                  aria-label={`${banner.cta} – ${banner.title.replace('\n', ' ')}`}
                >
                  {banner.cta}
                  <span className="promo-banner__cta-arrow" aria-hidden="true">
                    <ArrowRight size={11} strokeWidth={1.5} />
                  </span>
                </Link>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default PromoGrid;
