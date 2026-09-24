// Fixture chỉ phục vụ màn hình giám sát, không phải schema hoặc API contract.
export const monitoringReferenceDate = '2026-09-18';
export const monitoringStatuses = [
  { id: 'pending', label: 'Chờ xác nhận' },
  { id: 'crafting', label: 'Đang chế tác tại xưởng' },
  { id: 'packing', label: 'Đang kiểm định & Đóng kiện' },
  { id: 'shipping', label: 'Đang vận chuyển White-Glove' },
  { id: 'completed', label: 'Hoàn tất bàn giao' },
];

export const monitoringWarehouses = [
  { id: 'rotterdam', name: 'Rotterdam Vault', description: 'Cảng logistics quốc tế trung chuyển Bắc Âu', finishedPackages: 620, occupiedM3: 842, capacityM3: 1000 },
  { id: 'milan', name: 'Milan Depository', description: 'Xưởng chế tác & kho hoàn thiện Ý', finishedPackages: 480, occupiedM3: 608, capacityM3: 800 },
  { id: 'paris', name: 'Paris Depository', description: 'Trung tâm phân phối vùng thủ đô Pháp', finishedPackages: 240, occupiedM3: 327, capacityM3: 600 },
  { id: 'zurich', name: 'Zurich Depository', description: 'Kho kim hoàn & phụ kiện Bespoke Thụy Sĩ', finishedPackages: 142, occupiedM3: 164, capacityM3: 500 },
];

export const monitoringMaterials = [
  { id: 'raw-stone', sku: 'RAW-TRV-NVN-02', name: 'Phôi Travertine Navona (Honed Slab)', warehouseId: 'rotterdam', location: 'Khu bãi đá A3', quantity: 1.8, threshold: 5, unit: 'khối', leadDays: 14, supplier: 'Mỏ Tivoli, Rome', impact: 'Ảnh hưởng 3 bàn tiệc Monolith' },
  { id: 'raw-oak', sku: 'RAW-OAK-SMK-88', name: 'Gỗ Sồi Hun Khói Châu Âu (Smoked Oak 80mm)', warehouseId: 'milan', location: 'Lò sấy vùng Brianza', quantity: 3.2, threshold: 8, unit: 'm³', leadDays: 21, supplier: 'Xưởng cưa Rừng Đen', impact: 'Ảnh hưởng dòng ghế Caldera' },
  { id: 'raw-brass', sku: 'RAW-BRS-PAT-09', name: 'Đồng Thau Honed Brass Patina (Thanh Đúc)', warehouseId: 'zurich', location: 'Kho kim khí an ninh', quantity: 85, threshold: 150, unit: 'kg', leadDays: 7, supplier: 'Xưởng luyện kim Florence', impact: 'Phụ kiện chân bàn Svelta' },
];

const orderRows = [
  ['LM-8921', '2026-09-18T10:42:00+07:00', 'Genevieve V.', 'Bàn Monolith Travertine & Ghế Caldera', 'Đá Navona Honed • Gỗ oiled ash', 24850, 'rotterdam', 'packing', 'Cần xe cẩu chuyên dụng tầng 3'],
  ['LM-8919', '2026-09-18T08:15:00+07:00', 'Studio Archipel B.V.', 'Bàn tiệc Svelta & 6 Ghế Walnut', 'Gỗ óc chó • Đồng thau mộc', 18200, 'milan', 'crafting', 'Kiểm tra bề mặt trước đóng kiện'],
  ['LM-8918', '2026-09-18T07:20:00+07:00', 'Camille Dubois', 'Đèn Murano Pearl', 'Thủy tinh thủ công', 2400, 'paris', 'pending', 'Chưa xác nhận lịch bàn giao'],
  ['LM-8902', '2026-09-17T16:30:00+07:00', "Maison de L’Ombre", 'Bộ Sofa Kyoto Modular & Đèn Murano', 'Linen dệt bouclé • Kính Murano', 39400, 'paris', 'shipping', 'Bàn giao tại địa chỉ khách hàng'],
  ['LM-8890', '2026-09-16T09:00:00+07:00', 'Clara Moreau', 'Ghế Atelier Walnut', 'Gỗ óc chó', 3250, 'zurich', 'completed', 'Bàn giao hoàn tất trong fixture'],
  ['LM-8881', '2026-09-15T14:00:00+07:00', 'Lukas Weber', 'Bàn Nordic Round', 'Gỗ sồi', 6900, 'rotterdam', 'packing', 'Đóng kiện chống va đập'],
  ['LM-8872', '2026-09-13T11:00:00+07:00', 'Isabella Conti', 'Giường Serene Walnut', 'Gỗ óc chó', 7800, 'milan', 'crafting', 'Kiểm tra lắp ghép'],
  ['LM-8860', '2026-09-12T00:00:00+07:00', 'Oliver Bennett', 'Forma Stone Console', 'Đá Travertine', 4600, 'paris', 'pending', 'Chờ xác nhận đơn'],
  ['LM-8854', '2026-09-11T16:00:00+07:00', 'Sofia Rossi', 'Linen Sanctuary Bench', 'Vải linen', 1950, 'zurich', 'completed', 'Bàn giao hoàn tất trong fixture'],
  ['LM-8840', '2026-09-05T10:00:00+07:00', 'Henrik Larsen', 'Atelier Reading Lamp', 'Kim loại', 1250, 'rotterdam', 'shipping', 'Kiện hàng đang vận chuyển'],
  ['LM-8832', '2026-08-28T13:00:00+07:00', 'Nguyễn Minh Anh', 'Travertine Nightstand', 'Đá tự nhiên', 2800, 'milan', 'packing', 'Kiểm định trước bàn giao'],
  ['LM-8821', '2026-08-20T00:00:00+07:00', 'Trần Hoàng Nam', 'Sculpture Glass Floor Lamp', 'Thủy tinh smoked', 5200, 'paris', 'completed', 'Bàn giao hoàn tất trong fixture'],
  ['LM-8814', '2026-08-19T23:59:00+07:00', 'Matteo Ricci', 'Kyoto Modular Sofa', 'Vải bouclé', 11200, 'zurich', 'crafting', 'Chờ hoàn thiện bề mặt'],
  ['LM-8802', '2026-08-05T12:00:00+07:00', 'Amélie Laurent', 'Svelta Dining Table', 'Đá Navona', 8400, 'rotterdam', 'completed', 'Bàn giao hoàn tất trong fixture'],
  ['LM-8790', '2026-07-22T10:00:00+07:00', 'Gabriel Martin', 'Arc Oak Dining Chair', 'Gỗ sồi', 1450, 'milan', 'pending', 'Chờ xác nhận đơn'],
];

export const monitoringOrders = orderRows.map(([id, createdAt, customer, itemName, materials, total, warehouseId, status, note]) => ({ id, createdAt, customer, itemName, materials, total, warehouseId, status, note }));
