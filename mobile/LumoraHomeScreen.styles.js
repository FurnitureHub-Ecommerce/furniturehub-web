import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const COLORS = {
  bgPrimary: '#F7F4EE',    // Warm Ivory
  bgSecondary: '#E9E1D5',  // Warm Sand / Beige
  accentWood: '#8A6A48',   // Warm Wood Brown
  textMain: '#252525',     // Soft Charcoal Black
  textMuted: '#6E6860',    // Warm Taupe Grey
  textLight: '#8F887E',    // Light Taupe
  cardWhite: '#FFFFFF',    // Clean Surface
  border: '#E2DBD0',       // Subtle Divider
  star: '#C89D5C',         // Elegant Gold Star
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* Header Bar */
  headerBar: {
    flexDirection: 'row',
    justify-content: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 3,
    color: COLORS.textMain,
    fontFamily: 'System',
  },
  brandSubtitle: {
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 2,
    color: COLORS.accentWood,
    marginTop: -2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    padding: 6,
  },
  badgeContainer: {
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: COLORS.accentWood,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justify-content: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },

  /* Hero Section */
  heroCard: {
    width: width - 32,
    height: 380,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.textMain,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(37, 37, 37, 0.45)',
  },
  heroContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-end',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentWood,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 32,
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#E2DBD0',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  heroCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justify-content: 'space-between',
  },
  heroPrice: {
    color: COLORS.bgSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  heroButton: {
    backgroundColor: COLORS.accentWood,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 6,
  },
  heroButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  /* USP Ticker Horizontal */
  uspBar: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.bgSecondary,
    borderVerticalWidth: 1,
    borderColor: COLORS.border,
    marginTop: 20,
  },
  uspItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    gap: 8,
  },
  uspText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain,
  },

  /* Section Title */
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 16,
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.accentWood,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textMain,
    marginTop: 4,
  },

  /* Categories Horizontal List */
  categoryCard: {
    width: 140,
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    marginLeft: 16,
    backgroundColor: COLORS.bgSecondary,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(37, 37, 37, 0.4)',
    padding: 12,
    justifyContent: 'flex-end',
  },
  categoryName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  categoryCount: {
    color: '#E2DBD0',
    fontSize: 10,
    marginTop: 2,
  },

  /* Tabs Horizontal Bar */
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabChipActive: {
    backgroundColor: COLORS.textMain,
    borderColor: COLORS.textMain,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },

  /* Products Horizontal FlatList */
  productCard: {
    width: width * 0.65,
    backgroundColor: COLORS.cardWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginLeft: 16,
    overflow: 'hidden',
  },
  productImageContainer: {
    width: '100%',
    height: 220,
    backgroundColor: COLORS.bgSecondary,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justify-content: 'center',
  },
  productBody: {
    padding: 12,
  },
  productVariant: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  productFooter: {
    flexDirection: 'row',
    justify-content: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  addBagBtn: {
    backgroundColor: COLORS.accentWood,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  addBagText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Lookbook Room Feature */
  lookbookCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.cardWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lookbookImage: {
    width: '100%',
    height: 240,
  },
  lookbookContent: {
    padding: 16,
  },
  lookbookTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  lookbookDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },

  /* Value Props 2x2 Grid */
  valueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 12,
  },
  valueCol: {
    width: '50%',
    padding: 6,
  },
  valueBox: {
    backgroundColor: COLORS.cardWhite,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 130,
  },
  valueTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
    marginTop: 8,
    marginBottom: 4,
  },
  valueDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 14,
  },

  /* Testimonial Quote Box */
  testimonialBox: {
    marginHorizontal: 16,
    backgroundColor: COLORS.cardWhite,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  testimonialQuote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.textMain,
    lineHeight: 20,
    marginBottom: 12,
  },
  testimonialAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accentWood,
  },
  testimonialRole: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
