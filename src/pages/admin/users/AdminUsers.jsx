import { useEffect, useState } from "react";
import { UserPlus, Users, Shield, Mail, Phone } from "lucide-react";
import { getUsers, createAdminUser } from "../../../services/admin/users.service.js";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  role: "STAFF",
};

export default function AdminUsers() {
  const [usersList, setUsersList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  
  const [form, setForm] = useState(initialForm);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [notice, setNotice] = useState(null);

  // Lấy danh sách tài khoản từ API khi tải trang
  const fetchUsers = async () => {
    try {
      setLoadingList(true);
      const data = await getUsers();
      // Xử lý linh hoạt cấu trúc trả về từ backend (array hoặc object chứa rows/users)
      const list = Array.isArray(data) ? data : data?.rows || data?.users || data?.data || [];
      setUsersList(list);
    } catch (error) {
      console.error("Lỗi tải danh sách người dùng:", error);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (loadingCreate) return;
    setLoadingCreate(true);
    setNotice(null);
    try {
      const newUser = await createAdminUser({
        ...form,
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      });
      setNotice({
        type: "success",
        text: `Đã tạo thành công tài khoản cho ${newUser?.fullName ?? newUser?.name ?? form.fullName}.`,
      });
      setForm(initialForm);
      fetchUsers(); // Tải lại danh sách sau khi tạo thành công
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Không thể tạo tài khoản." });
    } finally {
      setLoadingCreate(false);
    }
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div style={{ width: "100%", padding: "0 4px", fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER */}
      <header style={{ marginBottom: 24, borderBottom: "1px solid #eae6df", paddingBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#78716c", letterSpacing: "0.05em" }}>
          NGƯỜI DÙNG & PHÂN QUYỀN
        </span>
        <h1 style={{ fontFamily: "Bodoni Moda", fontSize: "2.2rem", fontWeight: 600, color: "#1a1a1a", margin: "4px 0 4px 0" }}>
          Quản Lý Người Dùng & Tạo Tài Khoản
        </h1>
        <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>
          Xem danh sách tất cả tài khoản trong hệ thống và cấp tài khoản mới cho Staff hoặc Storage Manager.
        </p>
      </header>

      {/* FORM TẠO TÀI KHOẢN VẬN HÀNH */}
      <section style={{ background: "#fff", border: "1px solid #eae6df", borderRadius: "12px", padding: "24px", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1c1c1c", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <UserPlus size={18} /> Cấp Tài Khoản Vận Hành Mới
        </h2>
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#555" }}>
            HỌ VÀ TÊN *
            <input
              required
              placeholder="Nhập họ tên..."
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              style={{ padding: "9px 12px", borderRadius: "6px", border: "1px solid #dcd6cd", fontSize: "13px" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#555" }}>
            EMAIL *
            <input
              required
              type="email"
              placeholder="email@lumora.com"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              style={{ padding: "9px 12px", borderRadius: "6px", border: "1px solid #dcd6cd", fontSize: "13px" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#555" }}>
            MẬT KHẨU TẠM THỜI *
            <input
              required
              type="password"
              minLength={8}
              placeholder="Tối thiểu 8 ký tự..."
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              style={{ padding: "9px 12px", borderRadius: "6px", border: "1px solid #dcd6cd", fontSize: "13px" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#555" }}>
            SỐ ĐIỆN THOẠI
            <input
              type="tel"
              placeholder="0912345678..."
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              style={{ padding: "9px 12px", borderRadius: "6px", border: "1px solid #dcd6cd", fontSize: "13px" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#555", gridColumn: "span 2" }}>
            VAI TRÒ TRONG HỆ THỐNG
            <select
              value={form.role}
              onChange={(event) => updateField("role", event.target.value)}
              style={{ padding: "9px 12px", borderRadius: "6px", border: "1px solid #dcd6cd", fontSize: "13px", background: "#fff" }}
            >
              <option value="STAFF">Staff (Nhân viên vận hành)</option>
              <option value="STORAGE_MANAGER">Storage Manager (Quản lý kho)</option>
            </select>
          </label>

          {notice && (
            <div style={{ gridColumn: "span 2", padding: "10px 14px", borderRadius: "6px", background: notice.type === "error" ? "#fef2f2" : "#f0fdf4", color: notice.type === "error" ? "#dc2626" : "#15803d", fontSize: "13px", fontWeight: 500 }}>
              {notice.text}
            </div>
          )}

          <div style={{ gridColumn: "span 2" }}>
            <button
              type="submit"
              disabled={loadingCreate}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#1c1c1c", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              <UserPlus size={16} /> {loadingCreate ? "Đang tạo tài khoản..." : "Tạo Tài Khoản"}
            </button>
          </div>
        </form>
      </section>

      {/* DANH SÁCH TẤT CẢ TÀI KHOẢN */}
      <section style={{ background: "#fff", border: "1px solid #eae6df", borderRadius: "12px", padding: "24px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1c1c1c", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={18} /> Danh Sách Toàn Bộ Tài Khoản Hệ Thống
        </h2>

        {loadingList ? (
          <div style={{ padding: "20px", color: "#666", fontSize: "13px" }}>Đang tải danh sách người dùng từ cơ sở dữ liệu...</div>
        ) : usersList.length === 0 ? (
          <div style={{ padding: "20px", color: "#666", fontSize: "13px" }}>Chưa có tài khoản nào trong hệ thống.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #eae6df", color: "#78716c", fontSize: "11px", fontWeight: 700 }}>
                  <th style={{ padding: "12px" }}>HỌ VÀ TÊN</th>
                  <th style={{ padding: "12px" }}>EMAIL</th>
                  <th style={{ padding: "12px" }}>SỐ ĐIỆN THOẠI</th>
                  <th style={{ padding: "12px" }}>VAI TRÒ</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u, idx) => (
                  <tr key={u._id || u.id || idx} style={{ borderBottom: "1px solid #f2efeb" }}>
                    <td style={{ padding: "12px", fontWeight: 600, color: "#1c1c1c" }}>
                      {u.fullName || u.name || "Chưa cập nhật"}
                    </td>
                    <td style={{ padding: "12px", color: "#666" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <Mail size={14} color="#888" /> {u.email}
                      </span>
                    </td>
                    <td style={{ padding: "12px", color: "#666" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <Phone size={14} color="#888" /> {u.phone || "Chưa có"}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ background: u.role === "ADMIN" ? "#1c1c1c" : "#ede8e1", color: u.role === "ADMIN" ? "#fff" : "#1c1c1c", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>
                        {u.role || "CUSTOMER"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}