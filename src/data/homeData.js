/**
 * src/data/homeData.js
 * Mock data for the Home page sections.
 * Replace with API calls later.
 */

import imgPuff  from '../assets/images/product-chair-puff.jpg';
import imgBombi from '../assets/images/product-chair-bombi.jpg';
import imgWood  from '../assets/images/product-chair-wood.jpg';
import imgEasy  from '../assets/images/product-chair-easy.jpg';

/* ---- Promo Grid banners ---- */
export const PROMO_BANNERS = [
  {
    id: 'desk',
    type: 'large',
    title: 'MY SMALL WRITING\nDESK',
    price: null,
    badge: '-20%',
    cta: 'Shop Now',
    link: '/products',
    image: 'promo-desk',
  },
  {
    id: 'teak',
    type: 'small',
    title: 'MODULAR LOUNGE\nTEAK',
    price: '$129.00',
    badge: null,
    cta: null,
    link: '/products',
    image: 'promo-teak',
  },
  {
    id: 'sofa',
    type: 'small',
    title: 'Modular technical\nfabric sofa',
    price: null,
    badge: null,
    cta: 'Shop Now',
    link: '/products',
    image: 'promo-sofa',
  },
  {
    id: 'lamp',
    type: 'large',
    title: 'DIRECT LIGHT\nPENDANT LAMP',
    price: '$129.00',
    badge: null,
    cta: 'Shop Now',
    link: '/products',
    image: 'promo-lamp',
  },
];

/* ---- Products (used in ProductTabs) ---- */
export const PRODUCTS = [
  /* ── FEATURED ── */
  { id: 1,  tab: 'featured',    name: 'Puff Lounge Chair',            slug: 'puff-lounge-chair',     price: '$249.00', oldPrice: '$310.00', rating: 5, reviewCount: 12, image: imgPuff,  isNew: true,  discount: 15 },
  { id: 2,  tab: 'featured',    name: 'Bombi Wood Chair',             slug: 'bombi-wood-chair',      price: '$129.00', oldPrice: null,      rating: 4, reviewCount: 8,  image: imgBombi, isNew: false, discount: null },
  { id: 3,  tab: 'featured',    name: 'Walnut Dining Chair',          slug: 'walnut-dining-chair',   price: '$189.00', oldPrice: '$220.00', rating: 4, reviewCount: 5,  image: imgWood,  isNew: false, discount: null },
  { id: 4,  tab: 'featured',    name: 'Easy Chair With Armrests',     slug: 'easy-chair-armrests',   price: '$299.00', oldPrice: null,      rating: 5, reviewCount: 20, image: imgEasy,  isNew: true,  discount: null },
  { id: 5,  tab: 'featured',    name: 'Scandinavian Puff Chair',      slug: 'scandinavian-puff',     price: '$219.00', oldPrice: '$260.00', rating: 3, reviewCount: 3,  image: imgPuff,  isNew: false, discount: 10 },

  /* ── LATEST ── */
  { id: 6,  tab: 'latest',      name: 'Upholstered Accent Chair',    slug: 'upholstered-accent',    price: '$179.00', oldPrice: null,      rating: 4, reviewCount: 7,  image: imgEasy,  isNew: true,  discount: null },
  { id: 7,  tab: 'latest',      name: 'Trestle-Based Wood Chair',    slug: 'trestle-wood-chair',    price: '$149.00', oldPrice: '$180.00', rating: 4, reviewCount: 6,  image: imgWood,  isNew: false, discount: null },
  { id: 8,  tab: 'latest',      name: 'Compact Bombi Chair',         slug: 'compact-bombi',         price: '$109.00', oldPrice: null,      rating: 5, reviewCount: 15, image: imgBombi, isNew: true,  discount: null },
  { id: 9,  tab: 'latest',      name: 'Lounge Puff Armchair',        slug: 'lounge-puff-armchair',  price: '$269.00', oldPrice: '$300.00', rating: 4, reviewCount: 9,  image: imgPuff,  isNew: false, discount: 10 },
  { id: 10, tab: 'latest',      name: 'Natural Oak Side Chair',      slug: 'natural-oak-side',      price: '$139.00', oldPrice: null,      rating: 3, reviewCount: 4,  image: imgBombi, isNew: false, discount: null },

  /* ── BEST SELLER ── */
  { id: 11, tab: 'best-seller', name: 'Easy Chair Premium',          slug: 'easy-chair-premium',    price: '$329.00', oldPrice: null,      rating: 5, reviewCount: 42, image: imgEasy,  isNew: false, discount: null },
  { id: 12, tab: 'best-seller', name: 'Classic Walnut Dining Chair', slug: 'classic-walnut-dining', price: '$199.00', oldPrice: '$240.00', rating: 5, reviewCount: 38, image: imgWood,  isNew: false, discount: 15 },
  { id: 13, tab: 'best-seller', name: 'Puff Chair Grey',             slug: 'puff-chair-grey',       price: '$239.00', oldPrice: null,      rating: 4, reviewCount: 29, image: imgPuff,  isNew: true,  discount: null },
  { id: 14, tab: 'best-seller', name: 'Bombi Oak Chair',             slug: 'bombi-oak-chair',       price: '$119.00', oldPrice: '$140.00', rating: 4, reviewCount: 25, image: imgBombi, isNew: false, discount: null },
  { id: 15, tab: 'best-seller', name: 'Rose Easy Lounge Chair',      slug: 'rose-easy-lounge',      price: '$289.00', oldPrice: null,      rating: 5, reviewCount: 31, image: imgEasy,  isNew: false, discount: null },
];
