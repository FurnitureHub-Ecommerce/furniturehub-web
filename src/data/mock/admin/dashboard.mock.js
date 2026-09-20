// Presentation fixtures only. These are not Catalog models or an API contract.
export const reportPeriods = [
  {
    id: "2025-Q4",
    label: "Quý 4/2025",
    start: "2025-10-01",
    end: "2025-12-31",
  },
  {
    id: "2025-Q3",
    label: "Quý 3/2025",
    start: "2025-07-01",
    end: "2025-09-30",
  },
];

const materialNames = [
  "Bàn đá Travertine Navona",
  "Gỗ óc chó Bắc Mỹ (Black Walnut)",
  "Đèn chùm Murano & Đức Bronze",
  "Ghế bọc dệt Bouclé & Da Aniline",
];
const materialColors = ["#705232", "#91704b", "#b99a74", "#d4c7bb"];

export const dashboardFixture = {
  profile: { name: "Executive Atelier", role: "Tài khoản trình diễn" },
  distribution: "Rotterdam • Milan • Paris • Zurich",
  reports: {
    "2025-Q4": {
      revenue: 3420500,
      previousRevenue: 3150000,
      margin: 42.8,
      inventoryValue: 8194520,
      commissions: 48,
      averageCommission: 14200,
      sla: 99.4,
      members: 1482,
      repeatRate: 68.2,
      growth: 34,
      materials: [38, 27, 21, 14],
      channels: [1820000, 1150500, 450000],
    },
    "2025-Q3": {
      revenue: 3150000,
      previousRevenue: 2900000,
      margin: 40.6,
      inventoryValue: 7862000,
      commissions: 43,
      averageCommission: 13800,
      sla: 98.8,
      members: 1396,
      repeatRate: 65.4,
      growth: 29,
      materials: [35, 29, 20, 16],
      channels: [1650000, 1050000, 450000],
    },
  },
  materialNames,
  materialColors,
  channels: ["BÁN LẺ LIVING", "PENTHOUSE & VILLA", "BẢO DƯỠNG & WHITE-GLOVE"],
  channelDescriptions: [
    "tỷ trọng doanh thu",
    "tỷ trọng hợp đồng",
    "dịch vụ cao cấp",
  ],
  stories: [
    {
      id: "stone",
      eyebrow: "KHAI THÁC & TUYỂN CHỌN",
      title: "Navona Travertine Quarry Select",
    },
    {
      id: "wood",
      eyebrow: "ATELIER CHẾ TÁC GỖ",
      title: "Hand-Crafted Walnut Masterpieces",
    },
    {
      id: "vault",
      eyebrow: "KHO LƯU TRỮ TIÊU CHUẨN BẢO TÀNG",
      title: "Zurich Private Vault Operations",
    },
  ],
  hubs: [
    {
      id: "rotterdam",
      label: "HUB 01 • BẮC ÂU",
      title: "Rotterdam Central Hub",
      description: "Cảng tiếp nhận nguyên liệu & xuất khẩu xuyên biên giới",
      utilization: 87.4,
      note: "Cao điểm xuất hàng Bắc Âu & UK",
      activity: "Đang điều phối giao:",
      amount: "12 đơn hàng",
      icon: "truck",
    },
    {
      id: "milan",
      label: "HUB 02 • NAM ÂU",
      title: "Milan Atelier Depository",
      description: "Trung tâm chế tác thủ công đá Travertine & Mộc tinh xảo",
      utilization: 64.2,
      note: "Trạng thái vận hành ổn định",
      activity: "Đang trực tiếp chế tác:",
      amount: "18 đơn hàng",
      icon: "hammer",
    },
    {
      id: "paris",
      label: "HUB 03 • TÂY ÂU",
      title: "Paris Rive Gauche Vault",
      description: "Phòng trưng bày Private Salon & Đặt hàng kiến trúc",
      utilization: 72,
      note: "Chuẩn bị bộ sưu tập Tuần lễ Thiết kế",
      activity: "VIP đặt lịch đón nhận:",
      amount: "9 đoàn VIP",
      icon: "building",
    },
    {
      id: "zurich",
      label: "HUB 04 • THỤY SĨ",
      title: "Zurich Private Depot",
      description: "Kho bảo chứng nghệ thuật & Ký gửi di sản Sovereign",
      utilization: 45.8,
      note: "Dung lượng bảo mật sẵn sàng 54.2%",
      activity: "Chờ nghiệm thu ủy thác:",
      amount: "5 tác phẩm",
      icon: "shield",
    },
  ],
  alerts: [
    {
      id: "stock",
      type: "danger",
      label: "CẢNH BÁO CẤP 1 // NGUYÊN VẬT LIỆU",
      time: "10 phút trước",
      title: "3 SKU đá Travertine khối lớn chạm ngưỡng an toàn dự trữ",
      description:
        "Tồn kho tại mỏ Tivoli (Ý) dự kiến giao chỉ còn 4 slab nguyên khối. Cần ký duyệt phụ lục bổ sung hợp đồng khai thác xưởng trước ngày 15/12.",
      actions: ["Xem Tồn Đá", "Ký Duyệt Bổ Sung"],
    },
    {
      id: "access",
      type: "access",
      label: "PHÊ DUYỆT PHÂN QUYỀN RBAC",
      time: "35 phút trước",
      title: "Yêu cầu cấp quyền 'Storage Supervisor' từ Milan Hub",
      description:
        "Nhân sự cấp cao Marco V. (ID: #USR-8419) đề xuất quyền xuất kho các tác phẩm nghệ thuật giá trị > €50,000. Cần sự đồng thuận từ Super Admin.",
      actions: ["Từ Chối", "Phê Duyệt Ngay"],
    },
    {
      id: "dispatch",
      type: "dispatch",
      label: "HOÀN TẤT ĐÓNG KIỆN BESPOKE",
      time: "1 giờ trước",
      title:
        "Đơn hàng độc bản #LM-8921 trị giá €24,850 đã niêm phong chân không",
      description:
        "Tác phẩm: Bộ bàn tiệc gỗ óc chó nguyên tấm phối chân đồng thau đúc. Lộ trình vận chuyển riêng biệt tới Penthouse The Marq (District 1).",
      actions: ["Mã QR Tracking", "Ký Lệnh Xuất Kho"],
    },
  ],
};

// Deterministic daily demo series; quarter totals match the summary fixtures.
export const dailyRevenueFixture = Array.from({ length: 4 }, (_, quarter) => {
  const first = Date.UTC(2025, quarter * 3, 1);
  const end = Date.UTC(2025, quarter * 3 + 3, 1);
  const count = (end - first) / 86400000;
  const weights = Array.from(
    { length: count },
    (_, i) => 0.7 + (i / count) * 0.6 + Math.sin(i * 0.35) * 0.18,
  );
  const total = [2650000, 2900000, 3150000, 3420500][quarter];
  const sum = weights.reduce((a, b) => a + b, 0);
  let assigned = 0;
  return weights.map((weight, i) => {
    const value =
      i === count - 1 ? total - assigned : Math.round((weight / sum) * total);
    assigned += value;
    return {
      date: new Date(first + i * 86400000).toISOString().slice(0, 10),
      value,
    };
  });
}).flat();
