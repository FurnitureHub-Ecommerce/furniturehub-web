import { useEffect, useRef, useState } from "react";
import { Search, UserPlus, RefreshCw, User, X, Eye, EyeOff } from "lucide-react";
import { getUsers, createAdminUser } from "../../../services/admin/users.service.js";
import "./AdminUsers.css";

const initialForm = { fullName: "", email: "", password: "", phone: "", role: "STAFF" };
const roles = { ADMIN: "Admin", STAFF: "Staff", STORAGE_MANAGER: "Storage Manager", CUSTOMER: "Customer" };
const text = value => typeof value === "string" && value.trim() ? value : "Chưa có dữ liệu";

function CreateUserDialog({ onClose, onCreated }) {
  const dialog = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element.showModal();
    return () => { element.close(); previous?.focus(); };
  }, []);
  function updateField(field, value) { setForm(current => ({ ...current, [field]: value })); }
  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError("");
    try {
      // Giữ payload POST hiện tại; chỉ thông báo thành công sau khi API hoàn tất.
      const user = await createAdminUser({ ...form, ...(form.phone.trim() ? { phone: form.phone.trim() } : {}) });
      onCreated(user?.fullName ?? user?.name ?? form.fullName);
    } catch (failure) {
      setError(failure.message || "Không thể tạo tài khoản.");
      setSaving(false);
    }
  }
  return <dialog ref={dialog} className="lu-create-dialog" aria-labelledby="lu-create-title" onCancel={event => { event.preventDefault(); if (!saving) onClose(); }}>
    <header><div><span className="lu-eyebrow">QUẢN LÝ TÀI KHOẢN</span><h2 id="lu-create-title">Tạo Tài Khoản Người Dùng</h2></div><button type="button" disabled={saving} onClick={onClose} aria-label="Đóng form tạo tài khoản"><X size={20} /></button></header>
    <form onSubmit={submit}>
      <div className="lu-create-body">
        <label>Họ và tên *<input autoFocus required autoComplete="name" value={form.fullName} onChange={e => updateField("fullName", e.target.value)} disabled={saving} /></label>
        <label>Email *<input required type="email" autoComplete="email" value={form.email} onChange={e => updateField("email", e.target.value)} disabled={saving} /></label>
        <label>Mật khẩu *<span className="lu-password-field"><input required minLength={8} type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={e => updateField("password", e.target.value)} disabled={saving} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
        <label>Số điện thoại<input type="tel" autoComplete="tel" value={form.phone} onChange={e => updateField("phone", e.target.value)} disabled={saving} /></label>
        <label>Vai trò<select value={form.role} onChange={e => updateField("role", e.target.value)} disabled={saving}>{["STAFF", "STORAGE_MANAGER", "ADMIN"].map(role => <option key={role} value={role}>{roles[role]}</option>)}</select></label>
        {error && <p className="lu-create-error" role="alert">{error}</p>}
      </div>
      <footer><button type="button" className="lu-button" disabled={saving} onClick={onClose}>Hủy Bỏ</button><button type="submit" className="lu-button lu-button-dark" disabled={saving}>{saving ? "Đang tạo…" : "Tạo Tài Khoản"}</button></footer>
    </form>
  </dialog>;
}

export default function AdminUsers() {
  const [state, setState] = useState({ rows: [], loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [notice, setNotice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  useEffect(() => {
    let cancelled = false;
    getUsers().then(rows => { if (!cancelled) setState({ rows, loading: false, error: "" }); })
      .catch(error => { if (!cancelled) setState({ rows: [], loading: false, error: error.message || "Không thể tải tài khoản." }); });
    return () => { cancelled = true; };
  }, [revision]);
  function reload() {
    setState(current => ({ ...current, loading: true, error: "" }));
    setRevision(value => value + 1);
  }
  function created(name) {
    setShowModal(false);
    setNotice(`Đã tạo tài khoản cho ${name}.`);
    reload();
  }
  const keyword = searchTerm.toLowerCase();
  const filteredUsers = state.rows.filter(user => {
    const values = [user.fullName || user.name, user.email, user.phone];
    return (!keyword || values.some(value => typeof value === "string" && value.toLowerCase().includes(keyword)))
      && (roleFilter === "ALL" || user.role === roleFilter);
  });
  // Các số đếm chỉ mô tả tập API đã tải, không khẳng định tổng tài khoản toàn hệ thống.
  const metrics = [
    ["TÀI KHOẢN ĐÃ TẢI", state.rows.length],
    ...["ADMIN", "STAFF", "STORAGE_MANAGER"].map(role => [roles[role], state.rows.filter(user => user.role === role).length]),
  ];
  return <div className="lu-page">
    <p className="lu-context"><span>NGƯỜI DÙNG & PHÂN QUYỀN</span></p>
    <header className="lu-heading"><div><h1>Quản Lý Người Dùng</h1><p>Tra cứu tài khoản và tạo người dùng qua hệ thống quản trị LUMORA.</p></div><div className="lu-heading-actions"><button className="lu-button" onClick={reload} disabled={state.loading}><RefreshCw size={16} />Tải lại</button><button className="lu-button lu-button-dark" onClick={() => setShowModal(true)}><UserPlus size={16} />Tạo Tài Khoản</button></div></header>
    {notice && <p className="lu-api-notice" role="status">{notice}</p>}
    {!state.loading && !state.error && <><section className="lu-kpis" aria-label="Số tài khoản trong danh sách đã tải">{metrics.map(([label, value]) => <article className="lu-card lu-kpi" key={label}><h2>{label}</h2><strong>{value}</strong><p>Trong danh sách đã tải</p></article>)}</section><p className="lu-api-note">Tìm kiếm và bộ lọc áp dụng trên danh sách đã tải từ Backend.</p></>}
    <section className="lu-filters" aria-label="Lọc tài khoản"><label className="lu-search"><Search size={18} /><input type="search" aria-label="Tìm theo tên, email hoặc số điện thoại" placeholder="Tìm tên, email, số điện thoại…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></label><div className="lu-selects"><label>VAI TRÒ<select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}><option value="ALL">Tất cả vai trò</option>{Object.entries(roles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div></section>
    <section className="lu-card lu-user-list">
      {state.loading ? <p className="lu-api-state" role="status">Đang tải tài khoản…</p> : state.error ? <div className="lu-api-state" role="alert"><p>{state.error}</p><button className="lu-button" onClick={reload}>Thử lại</button></div> : filteredUsers.length === 0 ? <p className="lu-api-state">Không có người dùng phù hợp.</p> : <div className="lu-table-scroll" tabIndex={0} aria-label="Danh sách người dùng, cuộn ngang để xem các cột"><table className="lu-table lu-api-table"><thead><tr><th scope="col">NGƯỜI DÙNG</th><th scope="col">EMAIL</th><th scope="col">VAI TRÒ</th><th scope="col">ĐIỆN THOẠI</th></tr></thead><tbody>{filteredUsers.map((user, index) => <tr key={user._id || user.id || index}><td><div className="lu-user-identity"><span className="lu-avatar" aria-hidden="true"><User size={18} /></span><strong>{text(user.fullName || user.name)}</strong></div></td><td>{text(user.email)}</td><td><span className="lu-api-role">{roles[user.role] || text(user.role)}</span></td><td>{text(user.phone)}</td></tr>)}</tbody></table></div>}
      {!state.loading && !state.error && <p className="lu-api-note lu-api-result">Hiển thị {filteredUsers.length} / {state.rows.length} tài khoản đã tải</p>}
    </section>
    {showModal && <CreateUserDialog onClose={() => setShowModal(false)} onCreated={created} />}
  </div>;
}
