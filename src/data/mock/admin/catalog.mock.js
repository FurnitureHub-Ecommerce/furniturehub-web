const createdAt = '2026-09-01T08:00:00.000Z';
const base = (_id, name, description) => ({ _id, name, description, isActive: true, createdAt, updatedAt: createdAt });

export const categoriesMock = [
  base('category-living', 'Phòng Khách (Living)', 'Bàn tiếp, bàn trà, sofa module'),
  base('category-dining', 'Phòng Ăn (Dining)', 'Bàn ăn nguyên khối, ghế bọc da'),
  base('category-bedroom', 'Phòng Ngủ (Sanctuary)', 'Giường và nội thất phòng ngủ'),
  base('category-lighting', 'Chiếu Sáng Điêu Khắc', 'Đèn chùm thủ công, đèn sàn'),
];

export const brandsMock = [
  base('brand-lumora', 'LUMORA Atelier Original', 'Thiết kế nội thất với đường nét tối giản.'),
  base('brand-tuscany', 'Tuscany Stonecraft', 'Chế tác nội thất từ đá tự nhiên.'),
  base('brand-murano', 'Murano Glass Masters', 'Đèn và thiết kế thủy tinh nghệ thuật.'),
  base('brand-nordic', 'Nordic Timbercraft', 'Nội thất gỗ với kỹ thuật mộng truyền thống.'),
].map(brand => ({ ...brand, logo: '' }));

const productRows = [
  ['Svelta Travertine Dining Table', 'Bàn đá tự nhiên với hình khối thanh lịch.', 1, 1],
  ['Atelier Walnut Armchair', 'Ghế thư giãn bằng gỗ óc chó.', 0, 3],
  ['Brutalist Smoked Chandelier', 'Đèn chùm thủy tinh điêu khắc.', 3, 2],
  ['Monolith Travertine Master', 'Bàn lớn với cấu trúc đá nguyên khối.', 0, 1],
  ['Kyoto Modular Linen Sofa', 'Sofa module cho không gian đương đại.', 0, 0],
  ['Arc Oak Dining Chair', 'Ghế ăn gỗ sồi với đường cong nhẹ.', 1, 3],
  ['Serene Walnut Bed', 'Giường gỗ cho không gian nghỉ ngơi.', 2, 3],
  ['Murano Pearl Pendant', 'Đèn thả thủy tinh tông sáng.', 3, 2],
  ['Forma Stone Console', 'Bàn console đá có cấu trúc cân đối.', 0, 1],
  ['Linen Sanctuary Bench', 'Ghế băng bọc vải cho phòng ngủ.', 2, 0],
  ['Nordic Round Dining Table', 'Bàn ăn tròn bằng gỗ tự nhiên.', 1, 3],
  ['Atelier Reading Lamp', 'Đèn đọc sách với hình dáng tối giản.', 3, 0],
  ['Travertine Nightstand', 'Tủ đầu giường có mặt đá tự nhiên.', 2, 1],
  ['Sculpture Glass Floor Lamp', 'Đèn sàn với các chi tiết thủy tinh.', 3, 2],
  ['LUMORA Lounge Ottoman', 'Ghế đôn dành cho không gian lounge.', 0, 0],
];

export const productsMock = productRows.map(([name, description, category, brand], index) => ({
  ...base(`product-${index + 1}`, name, description),
  categoryId: categoriesMock[category]._id,
  brandId: brandsMock[brand]._id,
  images: [],
  isActive: index !== 9 && index !== 13,
}));

const prices = [8400, 3250, 5800, 10050, 11200, 1450, 7800, 2400, 4600, 1950, 6900, 1250, 2800, 5200];
const materials = [
  ['Travertine Navona', 'Calacatta Viola Marble', 'Nero Marquina Black'],
  ['Gỗ óc chó', 'Gỗ sồi', 'Vải bouclé'],
  ['Thủy tinh smoked', 'Thủy tinh amber', 'Thủy tinh frost'],
  ['Travertine Chiaro', 'Travertine Noce', 'Travertine Navona'],
  ['Vải linen', 'Vải wool', 'Vải bouclé'],
];

// Dữ liệu giá dùng EUR cho bản demo; không bổ sung currency hoặc giá gốc vào schema.
// Sản phẩm cuối chưa có Variant để kiểm tra trạng thái trống và giá chưa có dữ liệu.
export const variantsMock = productsMock.slice(0, -1).flatMap((product, index) =>
  [0, 1, 2].map(option => ({
    _id: `variant-${index + 1}-${option + 1}`,
    productId: product._id,
    sku: `LUM-${String(index + 1).padStart(3, '0')}-${option + 1}`,
    color: ['Tự nhiên', 'Nâu', 'Kem'][option],
    size: ['Tiêu chuẩn', 'Lớn', 'Nhỏ'][option],
    material: materials[index % materials.length][option],
    price: prices[index] + option * 450,
    isActive: product.isActive && option !== 2,
    createdAt, updatedAt: createdAt,
  })),
);
