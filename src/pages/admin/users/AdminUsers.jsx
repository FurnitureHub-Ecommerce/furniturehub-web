import { useEffect, useRef, useState } from "react";
import {
  Search,
  UserPlus,
  RefreshCw,
  User,
  X,
  Eye,
  EyeOff,
  CircleAlert,
  CircleCheck,
} from "lucide-react";
import {
  getUsers,
  createAdminUser,
} from "../../../services/admin/users.service.js";
import "./AdminUsers.css";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  role: "STAFF",
};
const roles = {
  ADMIN: "Admin",
  STAFF: "Staff",
  STORAGE_MANAGER: "Storage Manager",
  CUSTOMER: "Customer",
};
const PAGE_SIZE = 10;
const text = (value) =>
  typeof value === "string" && value.trim() ? value : "Chưa có dữ liệu";
const initials = (name) => {
  if (typeof name !== "string") return null;
  const words = name
    .trim()
    .split(/\s+/u)
    .filter((word) => /^[\p{L}\p{N}]/u.test(word));
  if (!words.length) return null;
  const first = Array.from(words[0])[0];
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : "";
  return `${first}${last}`.toLocaleUpperCase("vi");
};

// Hàm phân tích và bóc tách lỗi chi tiết từ API để báo chính xác cho Admin
function getFriendlyErrorMessage(error) {
  const rawMessage = error?.response?.data?.message || error?.message || String(error || "");
  const lowerMsg = rawMessage.toLowerCase();

  if (lowerMsg.includes("email already") || lowerMsg.includes("email exists") || lowerMsg.includes("đã tồn tại") || lowerMsg.includes("email")) {
    return { field: "email", message: "Email này đã được đăng ký trên hệ thống. Vui lòng chọn email khác." };
  }
  if (lowerMsg.includes("password") || lowerMsg.includes("mật khẩu")) {
    return { field: "password", message: "Mật khẩu không hợp lệ (yêu cầu tối thiểu 8 ký tự)." };
  }
  if (lowerMsg.includes("phone") || lowerMsg.includes("số điện thoại")) {
    return { field: "phone", message: "Số điện thoại không hợp lệ hoặc đã tồn tại." };
  }
  if (lowerMsg.includes("name") || lowerMsg.includes("tên")) {
    return { field: "fullName", message: "Họ và tên không hợp lệ." };
  }

  return { field: "general", message: rawMessage || "Đã xảy ra lỗi trong quá trình tạo tài khoản. Vui lòng thử lại." };
}

function CreateUserDialog({ onClose, onCreated }) {
  const dialog = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [errorObj, setErrorObj] = useState({ field: "", message: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element.showModal();
    return () => {
      element.close();
      previous?.focus();
    };
  }, []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    if (errorObj.field === field) {
      setErrorObj({ field: "", message: "" });
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setErrorObj({ field: "", message: "" });

    try {
      const user = await createAdminUser({
        ...form,
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      });
      onCreated(user?.fullName ?? user?.name ?? form.fullName);
    } catch (failure) {
      const errDetail = getFriendlyErrorMessage(failure);
      setErrorObj(errDetail);
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="lu-create-dialog"
      aria-labelledby="lu-create-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
    >
      <header>
        <h2 id="lu-create-title">Tạo Tài Khoản</h2>
        <button
          type="button"
          disabled={saving}
          onClick={onClose}
          aria-label="Đóng"
        >
          <X size={18} />
        </button>
      </header>
      <form onSubmit={submit}>
        <div className="lu-create-body">
          <label>
            Họ và tên *
            <input
              autoFocus
              required
              autoComplete="name"
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              disabled={saving}
              style={{ borderColor: errorObj.field === "fullName" ? "#dc2626" : undefined }}
            />
          </label>
          <label>
            Email *
            <input
              required
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              disabled={saving}
              style={{ borderColor: errorObj.field === "email" ? "#dc2626" : undefined }}
            />
            {errorObj.field === "email" && (
              <span style={{ color: "#dc2626", fontSize: "11px", fontWeight: "600", marginTop: "2px", display: "block" }}>
                {errorObj.message}
              </span>
            )}
          </label>
          <label>
            Mật khẩu *
            <span className="lu-password-field">
              <input
                required
                minLength={8}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                disabled={saving}
                style={{ borderColor: errorObj.field === "password" ? "#dc2626" : undefined }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </label>
          <label>
            Số điện thoại
            <input
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              disabled={saving}
              style={{ borderColor: errorObj.field === "phone" ? "#dc2626" : undefined }}
            />
          </label>
          <label>
            Vai trò
            <select
              value={form.role}
              onChange={(e) => updateField("role", e.target.value)}
              disabled={saving}
            >
              {["STAFF", "STORAGE_MANAGER"].map((role) => (
                <option key={role} value={role}>
                  {roles[role]}
                </option>
              ))}
            </select>
          </label>

          {/* Hiển thị lỗi tổng quát nếu có */}
          {errorObj.field === "general" && (
            <p className="lu-create-error" role="alert" style={{ gridColumn: "span 2" }}>
              <CircleAlert size={16} aria-hidden="true" />
              {errorObj.message}
            </p>
          )}
        </div>
        <footer>
          <button
            type="button"
            className="lu-button"
            disabled={saving}
            onClick={onClose}
          >
            Hủy Bỏ
          </button>
          <button
            type="submit"
            className="lu-button lu-button-dark"
            disabled={saving}
          >
            {saving ? "Đang tạo…" : "Tạo Tài Khoản"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}

export default function AdminUsers() {
  const [state, setState] = useState({ rows: [], loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [notice, setNotice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    getUsers()
      .then((rows) => {
        if (!cancelled) setState({ rows, loading: false, error: "" });
      })
      .catch((error) => {
        if (!cancelled)
          setState({
            rows: [],
            loading: false,
            error: getFriendlyErrorMessage(error).message,
          });
      });
    return () => {
      cancelled = true;
    };
  }, [revision]);

  function reload() {
    setPage(1);
    setState((current) => ({ ...current, loading: true, error: "" }));
    setRevision((value) => value + 1);
  }

  function created(name) {
    setShowModal(false);
    setNotice(`Đã tạo tài khoản cho ${name}.`);
    reload();
  }

  const keyword = searchTerm.toLowerCase();
  const filteredUsers = state.rows.filter((user) => {
    const values = [user.fullName || user.name, user.email, user.phone];
    return (
      (!keyword ||
        values.some(
          (value) =>
            typeof value === "string" && value.toLowerCase().includes(keyword),
        )) &&
      (roleFilter === "ALL" || user.role === roleFilter)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const firstIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleUsers = filteredUsers.slice(firstIndex, firstIndex + PAGE_SIZE);

  const metrics = [
    ["Tổng tài khoản", state.rows.length],
    ...["ADMIN", "STAFF", "STORAGE_MANAGER"].map((role) => [
      roles[role],
      state.rows.filter((user) => user.role === role).length,
    ]),
  ];

  return (
    <div className="lu-page">
      <div className="lu-intro">
        <p className="lu-context">
          <span>QUẢN LÝ TÀI KHOẢN</span>
        </p>
        <header className="lu-heading">
          <div>
            <h1>Quản Lý Người Dùng</h1>
            <p>Theo dõi tài khoản và quản lý nhân sự trên hệ thống.</p>
          </div>
          <div className="lu-heading-actions">
            <button
              className="lu-button"
              onClick={reload}
              disabled={state.loading}
            >
              <RefreshCw size={15} aria-hidden="true" />
              Tải lại
            </button>
            <button
              className="lu-button lu-button-dark"
              onClick={() => setShowModal(true)}
            >
              <UserPlus size={15} aria-hidden="true" />
              Tạo Tài Khoản
            </button>
          </div>
        </header>
      </div>

      {notice && (
        <p className="lu-api-notice" role="status">
          <CircleCheck size={16} aria-hidden="true" />
          {notice}
        </p>
      )}

      {!state.loading && !state.error && (
        <section className="lu-kpis" aria-label="Thống kê">
          {metrics.map(([label, value]) => (
            <article className="lu-card lu-kpi" key={label}>
              <h2>{label}</h2>
              <strong>{value}</strong>
            </article>
          ))}
        </section>
      )}

      <section className="lu-filters" aria-label="Bộ lọc">
        <label className="lu-search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Tìm kiếm tên, email, số điện thoại..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <div className="lu-selects">
          <div className="lu-role-filter">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">Tất cả vai trò</option>
              {Object.entries(roles).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="lu-card lu-user-list" aria-labelledby="lu-list-title">
        <div className="lu-list-header">
          <h2 id="lu-list-title">Danh Sách Người Dùng</h2>
          {!state.loading && !state.error && (
            <span className="lu-list-count">
              {filteredUsers.length} tài khoản
            </span>
          )}
        </div>

        {state.loading ? (
          <div className="lu-api-state" role="status">
            <RefreshCw size={22} aria-hidden="true" />
            <div>
              <strong>Đang tải tài khoản</strong>
              <p>Vui lòng đợi trong giây lát…</p>
            </div>
          </div>
        ) : state.error ? (
          <div className="lu-api-state lu-api-error" role="alert">
            <CircleAlert size={22} aria-hidden="true" />
            <div>
              <strong>Không thể tải</strong>
              <p>{state.error}</p>
            </div>
            <button className="lu-button" onClick={reload}>
              Thử lại
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="lu-api-state">
            <Search size={22} aria-hidden="true" />
            <div>
              <strong>Không có kết quả</strong>
              <p>Không tìm thấy người dùng phù hợp.</p>
            </div>
          </div>
        ) : (
          <div className="lu-table-scroll">
            <table className="lu-table lu-api-table">
              <thead>
                <tr>
                  <th scope="col">NGƯỜI DÙNG</th>
                  <th scope="col">EMAIL</th>
                  <th scope="col">VAI TRÒ</th>
                  <th scope="col">ĐIỆN THOẠI</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user, index) => (
                  <tr key={user._id || user.id || index}>
                    <td>
                      <div className="lu-user-identity">
                        <span className="lu-avatar" aria-hidden="true">
                          {initials(user.fullName || user.name) ?? (
                            <User size={16} />
                          )}
                        </span>
                        <strong>{text(user.fullName || user.name)}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="lu-email" title={text(user.email)}>
                        {text(user.email)}
                      </span>
                    </td>
                    <td>
                      <span className="lu-api-role" data-role={user.role}>
                        {roles[user.role] || text(user.role)}
                      </span>
                    </td>
                    <td>{text(user.phone)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!state.loading && !state.error && (
          <footer className="lu-pagination">
            <span>
              Hiển thị {filteredUsers.length ? firstIndex + 1 : 0}–
              {firstIndex + visibleUsers.length} / {filteredUsers.length}
            </span>
            {filteredUsers.length > PAGE_SIZE && (
              <nav aria-label="Phân trang">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
                <span>
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Tiếp
                </button>
              </nav>
            )}
          </footer>
        )}
      </section>

      {showModal && (
        <CreateUserDialog
          onClose={() => setShowModal(false)}
          onCreated={created}
        />
      )}
    </div>
  );
}