import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { styles, COLORS } from './LumoraHomeScreen.styles';

// Realistic Mock Data for Mobile App
const HERO_BANNER = {
  badge: 'Limited Edition 2026',
  title: 'The Wabi-Sabi Living Room Collection',
  subtitle: 'Sculptural seating handcrafted from natural Japanese oak & textured organic linen.',
  priceSnippet: 'From $2,450',
  image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faAEA6?auto=format&fit=crop&w=800&q=80',
};

const CATEGORIES = [
  { id: '1', name: 'Living Room', count: '42 items', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80' },
  { id: '2', name: 'Dining Room', count: '28 items', image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=400&q=80' },
  { id: '3', name: 'Bedroom', count: '34 items', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=80' },
  { id: '4', name: 'Studio & Office', count: '19 items', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80' },
  { id: '5', name: 'Lighting', count: '56 items', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80' },
];

const PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Komorebi Chair',
    variant: 'White Oak / Oat Bouclé',
    price: '$1,450',
    rating: '4.9',
    reviews: '38',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'prod-2',
    name: 'Kyoto Low Sofa',
    variant: 'Organic Flax Linen',
    price: '$3,200',
    rating: '5.0',
    reviews: '42',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'prod-3',
    name: 'Aura Pendant',
    variant: 'Alabaster / Brass',
    price: '$680',
    rating: '4.8',
    reviews: '19',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'prod-4',
    name: 'Nami Walnut Table',
    variant: 'Black Walnut',
    price: '$2,450',
    rating: '4.95',
    reviews: '64',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=400&q=80',
  },
];

const TABS = ['Curated Featured', 'New Arrivals', 'Best Sellers'];

export function LumoraHomeScreen() {
  const [activeTab, setActiveTab] = useState('Curated Featured');
  const [wishlist, setWishlist] = useState(['prod-2']);
  const [cartCount, setCartCount] = useState(3);

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.85} style={styles.categoryCard}>
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <View style={styles.categoryOverlay}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryCount}>{item.count}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => {
    const isSaved = wishlist.includes(item.id);
    return (
      <View style={styles.productCard}>
        <View style={styles.productImageContainer}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={() => toggleWishlist(item.id)}
            activeOpacity={0.7}
          >
            <Text style={{ color: isSaved ? COLORS.accentWood : COLORS.textMuted, fontSize: 16 }}>
              {isSaved ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productBody}>
          <Text style={styles.productVariant}>{item.variant}</Text>
          <Text style={styles.productTitle} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={{ color: COLORS.star }}>★</Text>
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={{ fontSize: 10, color: COLORS.textLight }}>({item.reviews})</Text>
          </View>

          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>{item.price}</Text>
            <TouchableOpacity
              style={styles.addBagBtn}
              onPress={() => setCartCount((prev) => prev + 1)}
            >
              <Text style={styles.addBagText}>+ Bag</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.brandTitle}>LUMORA</Text>
          <Text style={styles.brandSubtitle}>STUDIO</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={{ fontSize: 18, color: COLORS.textMain }}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.badgeContainer]}>
            <Text style={{ fontSize: 18, color: COLORS.textMain }}>🛍️</Text>
            {cartCount > 0 && (
              <View style={styles.badgeDot}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scrollable Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Hero Editorial Banner */}
        <View style={styles.heroCard}>
          <Image source={{ uri: HERO_BANNER.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroBadge}>{HERO_BANNER.badge}</Text>
            <Text style={styles.heroTitle}>{HERO_BANNER.title}</Text>
            <Text style={styles.heroSubtitle}>{HERO_BANNER.subtitle}</Text>

            <View style={styles.heroCtaRow}>
              <Text style={styles.heroPrice}>{HERO_BANNER.priceSnippet}</Text>
              <TouchableOpacity style={styles.heroButton} activeOpacity={0.8}>
                <Text style={styles.heroButtonText}>Explore Collection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* USP Horizontal Ticker */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.uspBar}>
          <View style={styles.uspItem}>
            <Text style={{ color: COLORS.accentWood }}>🌲</Text>
            <Text style={styles.uspText}>FSC® Certified Timber</Text>
          </View>
          <View style={styles.uspItem}>
            <Text style={{ color: COLORS.accentWood }}>🚚</Text>
            <Text style={styles.uspText}>White Glove Delivery</Text>
          </View>
          <View style={styles.uspItem}>
            <Text style={{ color: COLORS.accentWood }}>🛡️</Text>
            <Text style={styles.uspText}>10-Year Frame Warranty</Text>
          </View>
          <View style={styles.uspItem}>
            <Text style={{ color: COLORS.accentWood }}>🌱</Text>
            <Text style={styles.uspText}>Carbon Neutral Shipping</Text>
          </View>
        </ScrollView>

        {/* 2. Featured Categories (Horizontal Snapping Track) */}
        <View style={styles.sectionHeader}>
          <Text style={sectionBadgeStyle}>ARCHITECTURAL SPACES</Text>
          <Text style={styles.sectionTitle}>Featured Categories</Text>
        </View>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={156}
          decelerationRate="fast"
        />

        {/* 3. Product Showcase with Filter Chips */}
        <View style={styles.sectionHeader}>
          <Text style={sectionBadgeStyle}>CRAFTMANSHIP</Text>
          <Text style={styles.sectionTitle}>Timeless Furniture</Text>
        </View>

        <View style={styles.tabsContainer}>
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <FlatList
          data={PRODUCTS}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={200}
          decelerationRate="fast"
        />

        {/* 4. Lookbook Spotlight */}
        <View style={styles.sectionHeader}>
          <Text style={sectionBadgeStyle}>EDITORIAL LOOKBOOK</Text>
          <Text style={styles.sectionTitle}>Kyoto Residence Spotlight</Text>
        </View>

        <View style={styles.lookbookCard}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
            }}
            style={styles.lookbookImage}
          />
          <View style={styles.lookbookContent}>
            <Text style={styles.lookbookTitle}>Harmonized Living Spaces</Text>
            <Text style={styles.lookbookDesc}>
              Featuring solid Japanese oak joinery, hand-blown alabaster lighting, and textured flax linen.
            </Text>
          </View>
        </View>

        {/* 5. Value Propositions 2x2 */}
        <View style={styles.sectionHeader}>
          <Text style={sectionBadgeStyle}>LUMORA PILLARS</Text>
          <Text style={styles.sectionTitle}>Built for Generations</Text>
        </View>

        <View style={styles.valueGrid}>
          <View style={styles.valueCol}>
            <View style={styles.valueBox}>
              <Text style={{ fontSize: 20 }}>🔨</Text>
              <Text style={styles.valueTitle}>Artisan Crafted</Text>
              <Text style={styles.valueDesc}>Mortised timber joinery by master woodworkers.</Text>
            </View>
          </View>
          <View style={styles.valueCol}>
            <View style={styles.valueBox}>
              <Text style={{ fontSize: 20 }}>🌐</Text>
              <Text style={styles.valueTitle}>Carbon Neutral</Text>
              <Text style={styles.valueDesc}>100% offset white-glove transport to room.</Text>
            </View>
          </View>
          <View style={styles.valueCol}>
            <View style={styles.valueBox}>
              <Text style={{ fontSize: 20 }}>🛡️</Text>
              <Text style={styles.valueTitle}>10-Yr Guarantee</Text>
              <Text style={styles.valueDesc}>Unwavering structural hardwood warranty.</Text>
            </View>
          </View>
          <View style={styles.valueCol}>
            <View style={styles.valueBox}>
              <Text style={{ fontSize: 20 }}>🎨</Text>
              <Text style={styles.valueTitle}>Custom Fabrics</Text>
              <Text style={styles.valueDesc}>Over 80 organic linen & wool swatches.</Text>
            </View>
          </View>
        </View>

        {/* 6. Testimonial Quote */}
        <View style={styles.sectionHeader}>
          <Text style={sectionBadgeStyle}>COLLECTOR REVIEWS</Text>
        </View>

        <View style={styles.testimonialBox}>
          <Text style={styles.testimonialQuote}>
            "LUMORA transformed our penthouse into a warm architectural sanctuary. The wood joinery is pure poetry."
          </Text>
          <Text style={styles.testimonialAuthor}>Elena Rostova</Text>
          <Text style={styles.testimonialRole}>Architectural Digest Top 100 Interior Designer</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const sectionBadgeStyle = styles.sectionBadge;

export default LumoraHomeScreen;
