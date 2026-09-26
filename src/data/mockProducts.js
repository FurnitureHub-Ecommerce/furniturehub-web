/**
 * src/data/mockProducts.js
 * Dữ liệu giả sát thực tế dành cho phần Web Customer FurnitureHub:
 * Task 3 (Product List + Detail), Task 4 (Category + Brand + Variant), Task 5 (Image Gallery + Variant Matrix).
 */

export const CATEGORIES = [
  { id: 'living-room', name: 'Phòng Khách', count: 18, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' },
  { id: 'dining-room', name: 'Phòng Ăn', count: 14, image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80' },
  { id: 'bedroom', name: 'Phòng Ngủ', count: 16, image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80' },
  { id: 'studio-office', name: 'Studio & Văn Phòng', count: 12, image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80' },
  { id: 'lighting-decor', name: 'Đèn & Trang Trí', count: 20, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80' },
];

export const BRANDS = [
  { id: 'lumora-atelier', name: 'LUMORA Atelier', country: 'Nhật Bản' },
  { id: 'nordic-craft', name: 'NordicCraft', country: 'Đan Mạch' },
  { id: 'koto-design', name: 'Koto Design', country: 'Nhật Bản' },
  { id: 'minimalis-studio', name: 'Minimalis Studio', country: 'Ý' },
  { id: 'artisan-woodworks', name: 'Artisan Woodworks', country: 'Thụy Điển' },
];

export const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Ghế Thư Giãn Komorebi Lounge Chair',
    slug: 'komorebi-lounge-chair',
    categoryId: 'living-room',
    categoryName: 'Phòng Khách',
    brandId: 'lumora-atelier',
    brandName: 'LUMORA Atelier',
    basePrice: 1450,
    oldPrice: 1680,
    rating: 4.9,
    reviewCount: 38,
    isNew: true,
    isBestSeller: true,
    inStock: true,
    shortDescription: 'Ghế ngồi thư giãn phong cách Wabi-Sabi chế tác thủ công từ gỗ sồi sấy tự nhiên kết hợp bọc nỉ Bouclé êm ái.',
    description: `Ghế Komorebi Lounge Chair mang thiết kế đương đại kết hợp tinh thần tối giản Wabi-Sabi Nhật Bản. 
    Khung ghế chế tác từ gỗ sồi tự nhiên đạt chứng nhận FSC®, xử lý bề mặt bằng dầu lau tự nhiên giữ nguyên vân gỗ độc bản. 
    Đệm bọc chất liệu Bouclé cao cấp nhập khẩu Đan Mạch mang đến cảm giác chạm vô cùng thư thái.`,
    colors: [
      { id: 'c-oat', name: 'Trắng Kem Oat', hex: '#F4F0EA', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=85' },
      { id: 'c-charcoal', name: 'Xám Than Charcoal', hex: '#343538', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=85' },
      { id: 'c-walnut', name: 'Nâu Gỗ Óc Chó', hex: '#5C4033', image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=1000&q=85' },
    ],
    sizes: [
      { id: 's-standard', name: 'Tiêu chuẩn (85x90cm)', priceAdjustment: 0 },
      { id: 's-xl', name: 'Rộng rãi XL (95x95cm)', priceAdjustment: 180 },
    ],
    materials: [
      { id: 'm-boucle', name: 'Vải Bouclé Cao Cấp', priceAdjustment: 0 },
      { id: 'm-linen', name: 'Vải Lanh Hữu Cơ Bỉ', priceAdjustment: 120 },
      { id: 'm-leather', name: 'Da Nappa Ý Cao Cấp', priceAdjustment: 350 },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85',
    ],
    skuMatrix: {
      'c-oat_s-standard_m-boucle': { stock: 12, price: 1450 },
      'c-oat_s-standard_m-linen': { stock: 5, price: 1570 },
      'c-oat_s-standard_m-leather': { stock: 0, price: 1800 },
      'c-oat_s-xl_m-boucle': { stock: 8, price: 1630 },
      'c-charcoal_s-standard_m-boucle': { stock: 15, price: 1450 },
      'c-charcoal_s-standard_m-leather': { stock: 3, price: 1800 },
      'c-walnut_s-standard_m-boucle': { stock: 0, price: 1450 },
    },
    specifications: [
      { label: 'Kích thước tổng thể', value: '85cm (Rộng) x 90cm (Sâu) x 78cm (Cao)' },
      { label: 'Chiều cao ghế ngồi', value: '42cm' },
      { label: 'Chất liệu khung', value: 'Gỗ sồi trắng FSC® nguyên khối (White Oak)' },
      { label: 'Chất liệu đệm', value: 'Bọt biển Foam tỷ trọng cao 45kg/m³ chống xẹp' },
      { label: 'Trọng lượng', value: '22.5 kg' },
      { label: 'Xuất xứ', value: 'Chế tác tại Kyoto, Nhật Bản' },
      { label: 'Bảo hành', value: 'Bảo hành khung kết cấu 10 năm' },
    ],
    reviews: [
      {
        id: 'r-1',
        userName: 'Minh Trí',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        rating: 5,
        date: '15/09/2026',
        comment: 'Ghế đóng gói rất chắc chắn, giao hàng White Glove hỗ trợ tận nơi. Cảm giác ngồi êm ái, vân gỗ tự nhiên rất đẹp!',
        verified: true,
      },
      {
        id: 'r-2',
        userName: 'Thanh Hằng',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        rating: 5,
        date: '08/09/2026',
        comment: 'Vải Bouclé màu Oat rất sang trọng, khớp nối mộc gỗ tinh xảo xứng đáng từng xu.',
        verified: true,
      },
    ],
  },

  {
    id: 'prod-2',
    name: 'Sofa Tối Giản Kyoto Low-Profile',
    slug: 'kyoto-low-profile-sofa',
    categoryId: 'living-room',
    categoryName: 'Phòng Khách',
    brandId: 'koto-design',
    brandName: 'Koto Design',
    basePrice: 3200,
    oldPrice: 3500,
    rating: 5.0,
    reviewCount: 42,
    isNew: true,
    isBestSeller: true,
    inStock: true,
    shortDescription: 'Sofa băng gầm thấp bọc lanh hữu cơ mềm mại, mang lại cảm giác không gian thoáng đãng rộng mở.',
    description: `Kyoto Low-Profile Sofa tạo ấn tượng với đường nét nằm ngang thanh thoát và phom dáng chắc chắn. 
    Lớp vải bọc lanh thiên nhiên đã qua xử lý enzyme giúp bề mặt êm dịu chạm mềm mại.`,
    colors: [
      { id: 'c-sand', name: 'Beige Cát Sand', hex: '#E2D7C5', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85' },
      { id: 'c-olive', name: 'Xanh Rêu Olive', hex: '#556B2F', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1000&q=85' },
      { id: 'c-slate', name: 'Xám Đá Slate', hex: '#708090', image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1000&q=85' },
    ],
    sizes: [
      { id: 's-2seater', name: '2 Chỗ (200cm)', priceAdjustment: 0 },
      { id: 's-3seater', name: '3 Chỗ (240cm)', priceAdjustment: 450 },
      { id: 's-lshape', name: 'Góc L (280cm)', priceAdjustment: 900 },
    ],
    materials: [
      { id: 'm-flax', name: 'Vải Lanh Hữu Cơ', priceAdjustment: 0 },
      { id: 'm-velvet', name: 'Vải Nhung Mịn Cotton', priceAdjustment: 200 },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1000&q=85',
    ],
    skuMatrix: {
      'c-sand_s-2seater_m-flax': { stock: 8, price: 3200 },
      'c-sand_s-3seater_m-flax': { stock: 4, price: 3650 },
      'c-olive_s-2seater_m-flax': { stock: 2, price: 3200 },
      'c-slate_s-2seater_m-flax': { stock: 0, price: 3200 },
    },
    specifications: [
      { label: 'Kích thước', value: '200cm (Dài) x 95cm (Sâu) x 70cm (Cao)' },
      { label: 'Khung trong', value: 'Gỗ tần bì Smoked Ash chịu lực' },
      { label: 'Bảo hành', value: '10 năm kết cấu khung' },
    ],
    reviews: [
      {
        id: 'r-3',
        userName: 'Hoàng Nam',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
        rating: 5,
        date: '20/09/2026',
        comment: 'Sofa vừa vặn với căn hộ chung cư cao cấp của mình, ngồi êm nhưng không bị lún quá.',
        verified: true,
      },
    ],
  },

  {
    id: 'prod-3',
    name: 'Đèn Treo ĐÁ Alabaster Aura',
    slug: 'aura-alabaster-pendant',
    categoryId: 'lighting-decor',
    categoryName: 'Đèn & Trang Trí',
    brandId: 'minimalis-studio',
    brandName: 'Minimalis Studio',
    basePrice: 680,
    oldPrice: 750,
    rating: 4.8,
    reviewCount: 19,
    isNew: true,
    isBestSeller: false,
    inStock: true,
    shortDescription: 'Đèn thả trần bằng đá cẩm thạch Alabaster Tây Ban Nha thổi tay kết hợp chi tiết đồng thau chải.',
    description: `Aura Alabaster Pendant toát lên ánh sáng dịu nhẹ ấm áp xuyên qua các vân đá cẩm thạch tự nhiên. 
    Mỗi chiếc đèn là một tác phẩm độc bản không trùng lặp vân đá.`,
    colors: [
      { id: 'c-brass', name: 'Đồng Thau Brushed Brass', hex: '#C5A059', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85' },
      { id: 'c-black', name: 'Thép Đen Oxide', hex: '#222222', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=85' },
    ],
    sizes: [
      { id: 's-single', name: 'Đơn (Ø25cm)', priceAdjustment: 0 },
      { id: 's-trio', name: 'Bộ 3 Đèn Chùm', priceAdjustment: 720 },
    ],
    materials: [
      { id: 'm-alabaster', name: 'Đá Alabaster Tự Nhiên', priceAdjustment: 0 },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=85',
    ],
    skuMatrix: {
      'c-brass_s-single_m-alabaster': { stock: 10, price: 680 },
      'c-black_s-single_m-alabaster': { stock: 6, price: 680 },
    },
    specifications: [
      { label: 'Đường kính', value: '25cm' },
      { label: 'Nguồn sáng', value: 'Bóng LED E27 2700K Ánh sáng ấm' },
      { label: 'Xuất xứ', value: 'Tây Ban Nha / Ý' },
    ],
    reviews: [],
  },

  {
    id: 'prod-4',
    name: 'Bàn Ăn Gỗ Óc Chó Nami Solid Walnut',
    slug: 'nami-walnut-dining-table',
    categoryId: 'dining-room',
    categoryName: 'Phòng Ăn',
    brandId: 'artisan-woodworks',
    brandName: 'Artisan Woodworks',
    basePrice: 2450,
    oldPrice: 2800,
    rating: 4.95,
    reviewCount: 64,
    isNew: false,
    isBestSeller: true,
    inStock: true,
    shortDescription: 'Bàn ăn 6 - 8 chỗ nguyên khối từ gỗ óc chó đen Bắc Mỹ phủ lớp dầu lau mờ chống nước.',
    description: `Bàn ăn Nami Solid Walnut là trung tâm ấm cúng của mọi căn phòng ăn. 
    Các cạnh mặt bàn uốn lượn tự nhiên giữ nét mộc mạc và sang trọng tuyệt đỉnh.`,
    colors: [
      { id: 'c-darkwalnut', name: 'Óc Chó Đậm Natural', hex: '#4A3525', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=85' },
      { id: 'c-lightoak', name: 'Sồi Tự Nhiên Light Oak', hex: '#D2B48C', image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1000&q=85' },
    ],
    sizes: [
      { id: 's-180cm', name: '6 Ghế (180x90cm)', priceAdjustment: 0 },
      { id: 's-220cm', name: '8 Ghế (220x100cm)', priceAdjustment: 400 },
      { id: 's-260cm', name: '10 Ghế (260x100cm)', priceAdjustment: 850 },
    ],
    materials: [
      { id: 'm-walnut', name: 'Gỗ Óc Chó Nguyên Khối', priceAdjustment: 0 },
      { id: 'm-oak', name: 'Gỗ Sồi Trắng Bắc Mỹ', priceAdjustment: -350 },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1000&q=85',
    ],
    skuMatrix: {
      'c-darkwalnut_s-180cm_m-walnut': { stock: 7, price: 2450 },
      'c-darkwalnut_s-220cm_m-walnut': { stock: 3, price: 2850 },
      'c-lightoak_s-180cm_m-oak': { stock: 9, price: 2100 },
    },
    specifications: [
      { label: 'Kích thước', value: '180cm (Dài) x 90cm (Rộng) x 75cm (Cao)' },
      { label: 'Độ dày mặt bàn', value: '3.8 cm' },
      { label: 'Hoàn thiện', value: 'Dầu lau Rubio Monocoat Thụy Sĩ' },
    ],
    reviews: [],
  },

  {
    id: 'prod-5',
    name: 'Giường Ngủ Sora Sanctuary Bed Frame',
    slug: 'sora-sanctuary-bed-frame',
    categoryId: 'bedroom',
    categoryName: 'Phòng Ngủ',
    brandId: 'nordic-craft',
    brandName: 'NordicCraft',
    basePrice: 2100,
    oldPrice: 2350,
    rating: 5.0,
    reviewCount: 31,
    isNew: true,
    isBestSeller: true,
    inStock: true,
    shortDescription: 'Khung giường kiểu Nhật Bản gầm giấu hiệu ứng lơ lửng kết hợp đầu giường tựa nỉ êm ái.',
    description: `Khung giường Sora Sanctuary mang đến sự bình yên tối đa cho phòng ngủ. Thiết kế chân lùi giấu khéo léo tạo cảm giác khung giường như đang lơ lửng nhẹ nhàng.`,
    colors: [
      { id: 'c-nuroak', name: 'Gỗ Sồi Nhật Natural', hex: '#DEB887', image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1000&q=85' },
      { id: 'c-smokedwalnut', name: 'Óc Chó Khói Smoked', hex: '#3B2F2F', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1000&q=85' },
    ],
    sizes: [
      { id: 's-queen', name: 'Queen Size (160x200cm)', priceAdjustment: 0 },
      { id: 's-king', name: 'King Size (180x200cm)', priceAdjustment: 300 },
      { id: 's-superking', name: 'Super King (200x220cm)', priceAdjustment: 600 },
    ],
    materials: [
      { id: 'm-naturaloak', name: 'Khung Sồi & Đệm Nỉ', priceAdjustment: 0 },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1000&q=85',
    ],
    skuMatrix: {
      'c-nuroak_s-queen_m-naturaloak': { stock: 6, price: 2100 },
      'c-nuroak_s-king_m-naturaloak': { stock: 2, price: 2400 },
      'c-smokedwalnut_s-queen_m-naturaloak': { stock: 0, price: 2100 },
    },
    specifications: [
      { label: 'Kích thước lọt lòng', value: '160cm x 200cm' },
      { label: 'Chiều cao đầu giường', value: '105cm' },
      { label: 'Bảo hành', value: '10 năm' },
    ],
    reviews: [],
  },

  {
    id: 'prod-6',
    name: 'Ghế Làm Việc Zenith Curved Desk Chair',
    slug: 'zenith-curved-desk-chair',
    categoryId: 'studio-office',
    categoryName: 'Studio & Văn Phòng',
    brandId: 'minimalis-studio',
    brandName: 'Minimalis Studio',
    basePrice: 920,
    oldPrice: null,
    rating: 4.7,
    reviewCount: 27,
    isNew: false,
    isBestSeller: false,
    inStock: true,
    shortDescription: 'Ghế xoay văn phòng điều hành bọc da Nappa chân thép sơn tĩnh điện đen cao cấp.',
    description: `Zenith Curved Desk Chair kết hợp hoàn hảo tính chuẩn nhân trắc học ergonomic với phong cách hiện đại tối giản.`,
    colors: [
      { id: 'c-tan', name: 'Da Bò Tân Saddle Tan', hex: '#A0522D', image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=1000&q=85' },
      { id: 'c-blackleather', name: 'Da Đen Obsidian', hex: '#1C1C1C', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=85' },
    ],
    sizes: [
      { id: 's-standardchair', name: 'Chân Xoay Tiêu Chuẩn', priceAdjustment: 0 },
    ],
    materials: [
      { id: 'm-nappa', name: 'Da Bò Nappa Thật', priceAdjustment: 0 },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=85',
    ],
    skuMatrix: {
      'c-tan_s-standardchair_m-nappa': { stock: 11, price: 920 },
      'c-blackleather_s-standardchair_m-nappa': { stock: 5, price: 920 },
    },
    specifications: [
      { label: 'Chất liệu da', value: '100% Da Bò Nappa Ý' },
      { label: 'Tính năng', value: 'Xoay 360 độ, Nâng hạ piston class 4' },
    ],
    reviews: [],
  },
];
