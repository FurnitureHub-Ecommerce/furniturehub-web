import { useEffect, useState } from "react";
import {
  UserPlus,
  Users,
  Mail,
  Phone,
  RefreshCw,
  Search,
  X,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getUsers,
  createAdminUser,
} from "../../../services/admin/users.service.js";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  role: "STAFF",
};

const ROLE_BADGES = {
  ADMIN: { bg: "#1c1c1c", color: "#fff" },
  STORAGE_MANAGER: { bg: "#5c4033", color: "#fff" },
  STAFF: { bg: "#e2d9d2", color: "#1c1c1c" },
  CUSTOMER: { bg: "#f2efeb", color: "#666" },
};

export default function AdminUsers() {
  const [usersList, setUsersList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const [form, setForm] = useState(initialForm);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [notice, setNotice] = useState(null);

  // States quản lý Modal tạo tài khoản và bộ lọc
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [showPassword, setShowPassword] = useState(false);
  const fetchUsers = async () => {
    try {
      setLoadingList(true);
      const data = await getUsers();
      const list = Array.isArray(data)
        ? data
        : data?.rows || data?.users || data?.data || [];
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
      fetchUsers();
      setTimeout(() => {
        setShowModal(false);
        setNotice(null);
      }, 1500);
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Không thể tạo tài khoản.",
      });
    } finally {
      setLoadingCreate(false);
    }
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  // Lọc danh sách theo từ khóa tìm kiếm và vai trò
  const filteredUsers = usersList.filter((u) => {
    const fullName = (u.fullName || u.name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const phone = (u.phone || "").toLowerCase();
    const keyword = searchTerm.toLowerCase();

    const matchesSearch =
      fullName.includes(keyword) ||
      email.includes(keyword) ||
      phone.includes(keyword);
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        width: "100%",
        padding: "0 28px 48px 28px",
        maxWidth: "1500px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "28px",
          borderBottom: "1px solid #eae6df",
          paddingBottom: "20px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#78716c",
              letterSpacing: "0.05em",
            }}
          >
            QUẢN TRỊ HỆ THỐNG & PHÂN QUYỀN
          </span>
          <h1
            style={{
              fontFamily: "Bodoni Moda",
              fontSize: "2.6rem",
              fontWeight: 600,
              color: "#1a1a1a",
              margin: "4px 0 0 0",
            }}
          >
            Quản Lý Người Dùng
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "13px" }}>
            Tra cứu danh sách tài khoản, lọc theo vai trò và cấp quyền vận hành
            mới cho hệ thống.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={fetchUsers}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #dcd6cd",
              background: "#fff",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              color: "#444",
            }}
          >
            <RefreshCw size={14} /> Làm mới
          </button>
          <button
            type="button"
            onClick={() => {
              setShowModal(true);
              setNotice(null);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              background: "#1c1c1c",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            <Plus size={16} /> Tạo tài khoản mới
          </button>
        </div>
      </header>

      {/* MODAL TẠO TÀI KHOẢN VẬN HÀNH (NỀN MỜ BACKDROP) */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #eae6df",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "600px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "#f2efeb",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#444",
              }}
            >
              <X size={18} />
            </button>

            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                fontFamily: "Bodoni Moda",
                color: "#1c1c1c",
                margin: "0 0 20px 0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <UserPlus size={20} /> Cấp Tài Khoản Vận Hành Mới
            </h2>

            <form
              onSubmit={submit}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#555",
                }}
              >
                HỌ VÀ TÊN *
                <input
                  required
                  placeholder="Nhập họ tên..."
                  value={form.fullName}
                  onChange={(event) =>
                    updateField("fullName", event.target.value)
                  }
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #dcd6cd",
                    fontSize: "13px",
                    background: "#faf8f5",
                  }}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#555",
                }}
              >
                EMAIL *
                <input
                  required
                  type="email"
                  placeholder="email@lumora.com"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #dcd6cd",
                    fontSize: "13px",
                    background: "#faf8f5",
                  }}
                />
              </label>

              {/* Ô MẬT KHẨU CÓ ICON CON MẮT */}
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#555",
                }}
              >
                MẬT KHẨU *
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    placeholder="Tối thiểu 8 ký tự..."
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "10px 40px 10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #dcd6cd",
                      fontSize: "13px",
                      background: "#faf8f5",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#666",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#555",
                }}
              >
                SỐ ĐIỆN THOẠI
                <input
                  type="tel"
                  placeholder="0912345678..."
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #dcd6cd",
                    fontSize: "13px",
                    background: "#faf8f5",
                  }}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#555",
                  gridColumn: "span 2",
                }}
              >
                VAI TRÒ TRONG HỆ THỐNG
                <select
                  value={form.role}
                  onChange={(event) => updateField("role", event.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #dcd6cd",
                    fontSize: "13px",
                    background: "#faf8f5",
                    cursor: "pointer",
                  }}
                >
                  <option value="STAFF">Staff (Nhân viên vận hành)</option>
                  <option value="STORAGE_MANAGER">
                    Storage Manager (Quản lý kho)
                  </option>
                  <option value="ADMIN">Admin (Quản trị viên cấp cao)</option>
                </select>
              </label>

              {notice && (
                <div
                  style={{
                    gridColumn: "span 2",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: notice.type === "error" ? "#fef2f2" : "#f0fdf4",
                    color: notice.type === "error" ? "#dc2626" : "#15803d",
                    fontSize: "13px",
                    fontWeight: 600,
                    border: `1px solid ${notice.type === "error" ? "#fecaca" : "#bbf7d0"}`,
                  }}
                >
                  {notice.text}
                </div>
              )}

              <div
                style={{
                  gridColumn: "span 2",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "#f2efeb",
                    color: "#444",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loadingCreate}
                  style={{
                    background: "#1c1c1c",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {loadingCreate ? "Đang tạo..." : "Xác Nhận Tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DANH SÁCH TÀI KHOẢN & BỘ LỌC */}
      <section
        style={{
          background: "#fff",
          border: "1px solid #eae6df",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
        }}
      >
        {/* Toolbar: Tìm kiếm và Lọc theo vai trò */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #eae6df",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={18} color="#1c1c1c" />
            <h2
              style={{
                fontFamily: "Bodoni Moda",
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#1c1c1c",
                margin: 0,
              }}
            >
              Danh Sách Toàn Bộ Tài Khoản Hệ Thống
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Ô tìm kiếm */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Search
                size={15}
                color="#888"
                style={{ position: "absolute", left: "12px" }}
              />
              <input
                type="text"
                placeholder="Tìm tên, email, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "8px 12px 8px 36px",
                  borderRadius: "8px",
                  border: "1px solid #dcd6cd",
                  fontSize: "13px",
                  width: "220px",
                  background: "#faf8f5",
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    position: "absolute",
                    right: "10px",
                    color: "#888",
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Bộ lọc Role */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #dcd6cd",
                fontSize: "13px",
                background: "#faf8f5",
                cursor: "pointer",
                fontWeight: 600,
                color: "#444",
              }}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="ADMIN">Admin</option>
              <option value="STORAGE_MANAGER">Storage Manager</option>
              <option value="STAFF">Staff</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>
        </div>

        {loadingList ? (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              color: "#666",
              fontSize: "13px",
            }}
          >
            Đang tải danh sách người dùng từ cơ sở dữ liệu…
          </div>
        ) : filteredUsers.length === 0 ? (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              color: "#666",
              fontSize: "13px",
            }}
          >
            Không tìm thấy tài khoản phù hợp với điều kiện lọc.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#5c4033",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  <th style={{ padding: "16px 24px" }}>HỌ VÀ TÊN</th>
                  <th style={{ padding: "16px 20px" }}>EMAIL</th>
                  <th style={{ padding: "16px 20px" }}>SỐ ĐIỆN THOẠI</th>
                  <th style={{ padding: "16px 24px" }}>VAI TRÒ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => {
                  const roleBadge = ROLE_BADGES[u.role] || ROLE_BADGES.CUSTOMER;
                  return (
                    <tr
                      key={u._id || u.id || idx}
                      style={{
                        borderBottom: "1px solid #f2efeb",
                        background: idx % 2 === 0 ? "#fff" : "#fcfbfa",
                      }}
                    >
                      <td
                        style={{
                          padding: "16px 24px",
                          fontWeight: 600,
                          color: "#1c1c1c",
                        }}
                      >
                        {u.fullName || u.name || "Chưa cập nhật"}
                      </td>
                      <td style={{ padding: "16px 20px", color: "#444" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Mail size={14} color="#888" /> {u.email}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px", color: "#444" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Phone size={14} color="#888" />{" "}
                          {u.phone || "Chưa có"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            background: roleBadge.bg,
                            color: roleBadge.color,
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          {u.role || "CUSTOMER"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer thống kê nhỏ */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid #f2efeb",
            background: "#fcfbfa",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#666",
          }}
        >
          <span>
            Hiển thị <strong>{filteredUsers.length}</strong> /{" "}
            {usersList.length} tài khoản
          </span>
          {searchTerm && <span>Đang lọc theo từ khóa: "{searchTerm}"</span>}
        </div>
      </section>
    </div>
  );
}
