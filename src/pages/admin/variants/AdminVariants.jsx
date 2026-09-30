import { useEffect, useState } from "react";
import { getVariants } from "../../../services/admin/variants.service.js";
import api from "../../../services/api.js";
import { Plus, Pencil, Trash2, X, RefreshCw } from "lucide-react";
import "./AdminVariants.css";

const money = (value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "EUR" }).format(value);

// Modal Thêm/Sửa Variant
function VariantModal({ variant, onClose, onSaved }) {
  const [form, setForm] = useState({
    sku: variant?.sku ?? "",
    size: variant?.size ?? "",
    material: variant?.material ?? "",
    color: variant?.color ?? "",
    price: variant?.price ?? 0,
    isActive: variant?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const variantId = variant?._id || variant?.id;
      if (variant && variantId) {
        await api.patch(`/api/variants/${variantId}`, form);
      } else {
        alert("Chức năng tạo variant mới đang liên kết với form sản phẩm chính.");
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Không thể lưu biến thể.");
      setSaving(false);
    }
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0, 0, 0, 0.45)",
      backdropFilter: "blur(3px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "16px",
    }}>
      <div style={{ 
        padding: "32px", 
        borderRadius: "16px", 
        border: "1px solid #e7e2dc", 
        width: "500px", 
        maxWidth: "100%",
        background: "#fff", 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid #f2efeb", paddingBottom: "14px" }}>
          <div>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#8c8278", letterSpacing: "0.05em" }}>LUMORA SYSTEM</span>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 600, margin: "2px 0 0 0", fontFamily: "Bodoni Moda", color: "#1a1a1a" }}>
              {variant ? "Chỉnh Sửa Biến Thể SKU" : "Thêm Biến Thể Mới"}
            </h2>
          </div>
          <button type="button" onClick={onClose} style={{ background: "#f5f2ed", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#555" }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#78716c", letterSpacing: "0.05em", display: "flex", flexDirection: "column", gap: "6px" }}>
            MÃ SKU *
            <input required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #dcd6cd", fontSize: "13px", outline: "none", background: "#faf8f5" }} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#78716c", letterSpacing: "0.05em", display: "flex", flexDirection: "column", gap: "6px" }}>
              KÍCH THƯỚC
              <input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #dcd6cd", fontSize: "13px", outline: "none", background: "#faf8f5" }} />
            </label>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#78716c", letterSpacing: "0.05em", display: "flex", flexDirection: "column", gap: "6px" }}>
              MÀU SẮC
              <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #dcd6cd", fontSize: "13px", outline: "none", background: "#faf8f5" }} />
            </label>
          </div>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#78716c", letterSpacing: "0.05em", display: "flex", flexDirection: "column", gap: "6px" }}>
            CHẤT LIỆU
            <input value={form.material} onChange={e => setForm({ ...form, material: e.target.value })} style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #dcd6cd", fontSize: "13px", outline: "none", background: "#faf8f5" }} />
          </label>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#78716c", letterSpacing: "0.05em", display: "flex", flexDirection: "column", gap: "6px" }}>
            GIÁ BÁN (EUR) *
            <input type="number" required value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid #dcd6cd", fontSize: "13px", outline: "none", background: "#faf8f5" }} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: 500, color: "#333", marginTop: "4px", cursor: "pointer", background: "#faf8f5", padding: "10px 14px", borderRadius: "8px", border: "1px solid #eae6df" }}>
            <input 
              type="checkbox" 
              checked={form.isActive} 
              onChange={e => setForm({ ...form, isActive: e.target.checked })}
              style={{ width: "16px", height: "16px", accentColor: "#1c1c1c" }} 
            />
            Đang hoạt động (Kinh doanh sản phẩm này)
          </label>
          
          {error && <p style={{ color: "#dc2626", fontSize: "12px", margin: 0, fontWeight: 500 }}>{error}</p>}
          
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px", borderTop: "1px solid #f2efeb", paddingTop: "18px" }}>
            <button type="button" onClick={onClose} style={{ padding: "11px 20px", borderRadius: "8px", border: "1px solid #dcd6cd", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#555" }}>Hủy</button>
            <button type="submit" disabled={saving} style={{ padding: "11px 20px", borderRadius: "8px", border: "none", background: "#1c1c1c", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}>
              {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminVariants() {
  const [query, setQuery] = useState({ search: "", material: "", status: "", page: 1, pageSize: 10 });
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  const [modalMode, setModalMode] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getVariants(query)
      .then((data) => { if (!cancelled) setState({ loading: false, data, error: "" }); })
      .catch((error) => { if (!cancelled) setState({ loading: false, data: null, error: error.message }); });
    return () => { cancelled = true; };
  }, [query, refreshKey]);

  function update(changes) {
    setQuery((current) => ({ ...current, ...changes }));
  }

  async function handleDelete(variant) {
    const variantId = variant?._id || variant?.id;
    if (!variantId) return;
    if (!window.confirm("Bạn có chắc chắn muốn vô hiệu hóa/xóa biến thể này không?")) return;
    try {
      await api.delete(`/api/variants/${variantId}`);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      alert("Không thể xóa biến thể: " + (err.message || "Lỗi hệ thống"));
    }
  }

  const data = state.data;

  return (
    <div style={{ padding: "0 28px 48px 28px", fontFamily: "'Inter', sans-serif", maxWidth: "1500px", margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", borderBottom: "1px solid #eae6df", paddingBottom: "20px" }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#78716c", letterSpacing: "0.05em" }}>
            QUẢN TRỊ DANH MỤC / BIẾN THỂ & SKU
          </span>
          <h1 style={{ fontFamily: "Bodoni Moda", fontSize: "2.6rem", fontWeight: 600, color: "#1a1a1a", margin: "4px 0 6px 0" }}>
            Quản Lý Biến Thể & Danh Mục SKU
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>
            Quản lý kích thước, chất liệu, màu sắc và giá niêm yết của từng biến thể sản phẩm LUMORA.
          </p>
        </div>
        <button 
          onClick={() => setModalMode("add")}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "#1c1c1c", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", transition: "all 0.2s" }}
        >
          <Plus size={16} /> Thêm Biến Thể Mới
        </button>
      </header>
      
      {/* THANH LỌC DỮ LIỆU */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 240px 200px auto", gap: "16px", marginBottom: "24px", background: "#fff", padding: "20px", borderRadius: "14px", border: "1px solid #eae6df", alignItems: "flex-end", boxShadow: "0 2px 6px rgba(0,0,0,0.01)" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", fontWeight: 700, color: "#78716c", letterSpacing: "0.03em" }}>
          TÌM KIẾM SKU / SẢN PHẨM
          <input
            type="search"
            placeholder="Nhập mã SKU hoặc tên sản phẩm..."
            value={query.search}
            onChange={(e) => update({ search: e.target.value })}
            style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #dcd6cd", fontSize: "13px", background: "#faf8f5", outline: "none", width: "100%" }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", fontWeight: 700, color: "#78716c", letterSpacing: "0.03em" }}>
          CHẤT LIỆU
          <select 
            value={query.material} 
            onChange={(e) => update({ material: e.target.value })}
            style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #dcd6cd", fontSize: "13px", background: "#faf8f5", outline: "none", width: "100%" }}
          >
            <option value="">Tất cả chất liệu</option>
            {data?.materials?.map((m) => <option key={m}>{m}</option>)}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", fontWeight: 700, color: "#78716c", letterSpacing: "0.03em" }}>
          TRẠNG THÁI
          <select 
            value={query.status} 
            onChange={(e) => update({ status: e.target.value })}
            style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #dcd6cd", fontSize: "13px", background: "#faf8f5", outline: "none", width: "100%" }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </label>
        <button 
          type="button"
          onClick={() => setRefreshKey(prev => prev + 1)}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "8px", border: "1px solid #dcd6cd", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600, height: "41px", color: "#444" }}
        >
          <RefreshCw size={14} /> Làm mới
        </button>
      </section>

      {/* BẢNG HIỂN THỊ */}
      <section style={{ background: "#fff", border: "1px solid #eae6df", borderRadius: "14px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
        {state.loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#666", fontSize: "13px" }}>Đang tải danh sách SKU từ hệ thống...</div>
        ) : state.error ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#dc2626", fontSize: "13px" }}>{state.error}</div>
        ) : !data?.rows?.length ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#666", fontSize: "13px" }}>Không tìm thấy SKU phù hợp.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px", whiteSpace: "nowrap" }}>
              <thead>
                <tr style={{ background: "#faf8f5", borderBottom: "1px solid #eae6df", color: "#78716c", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em" }}>
                  <th style={{ padding: "16px 20px" }}>MÃ SKU</th>
                  <th style={{ padding: "16px 20px" }}>SẢN PHẨM GỐC</th>
                  <th style={{ padding: "16px 20px" }}>KÍCH THƯỚC</th>
                  <th style={{ padding: "16px 20px" }}>CHẤT LIỆU</th>
                  <th style={{ padding: "16px 20px" }}>MÀU SẮC</th>
                  <th style={{ padding: "16px 20px" }}>GIÁ BÁN</th>
                  <th style={{ padding: "16px 20px" }}>TRẠNG THÁI</th>
                  <th style={{ padding: "16px 20px", textAlign: "right" }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((variant, idx) => {
                  const isActive = variant.isActive !== false;
                  return (
                    <tr key={variant._id || variant.id || idx} style={{ borderBottom: "1px solid #f2efeb", background: idx % 2 === 0 ? "#fff" : "#fcfbfa" }}>
                      <td style={{ padding: "16px 20px", fontWeight: 600, color: "#1c1c1c" }}>
                        <span style={{ background: "#f0ece6", color: "#2c2825", padding: "5px 10px", borderRadius: "6px", fontSize: "12px", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.03em" }}>{variant.sku}</span>
                      </td>
                      <td style={{ padding: "16px 20px", color: "#1c1c1c", fontWeight: 600, maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis" }}>{variant.product?.name || "Sản phẩm gốc"}</td>
                      <td style={{ padding: "16px 20px", color: "#666" }}>{variant.size || "Standard"}</td>
                      <td style={{ padding: "16px 20px", color: "#666", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis" }} title={variant.material}>{variant.material || "N/A"}</td>
                      <td style={{ padding: "16px 20px", color: "#666" }}>{variant.color || "N/A"}</td>
                      <td style={{ padding: "16px 20px", fontWeight: 700, color: "#15803d" }}>{money(variant.price)}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ 
                          display: "inline-block",
                          background: isActive ? "#f0fdf4" : "#fef2f2", 
                          color: isActive ? "#15803d" : "#dc2626", 
                          padding: "5px 10px", 
                          borderRadius: "20px", 
                          fontSize: "11px", 
                          fontWeight: 700,
                          textAlign: "center"
                        }}>
                          {isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button 
                            type="button"
                            title="Chỉnh sửa SKU"
                            onClick={() => setModalMode(variant)}
                            style={{ padding: "8px", borderRadius: "8px", border: "1px solid #dcd6cd", background: "#fff", cursor: "pointer", color: "#444", transition: "all 0.2s" }}
                          >
                            <Pencil size={15} />
                          </button>
                          <button 
                            type="button"
                            title="Vô hiệu hóa / Xóa"
                            onClick={() => handleDelete(variant)}
                            style={{ padding: "8px", borderRadius: "8px", border: "1px solid #fecaca", background: "#fef2f2", cursor: "pointer", color: "#dc2626", transition: "all 0.2s" }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalMode && (
        <VariantModal 
          variant={modalMode === "add" ? null : modalMode} 
          onClose={() => setModalMode(null)} 
          onSaved={() => { setModalMode(null); setRefreshKey(prev => prev + 1); }} 
        />
      )}
    </div>
  );
}