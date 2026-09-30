import { useEffect, useState, useRef } from 'react';
import { Search, RefreshCw, Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '../../../services/api.js';

// Modal Thêm / Sửa Brand
function BrandModal({ brand, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: brand?.name ?? '',
    description: brand?.description ?? '',
    country: brand?.country ?? '',
    isActive: brand?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const brandId = brand?._id || brand?.id;
      if (brand && brandId) {
        // Cập nhật Brand theo Swagger PATCH /api/brands/{id}
        await api.patch(`/api/brands/${brandId}`, form);
      } else {
        // Tạo mới Brand theo Swagger POST /api/brands
        await api.post('/api/brands', form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể lưu thương hiệu.');
      setSaving(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px',
    }}>
      <div style={{ 
        padding: '32px', borderRadius: '16px', border: '1px solid #e7e2dc', 
        width: '480px', maxWidth: '100%', background: '#fff', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #f2efeb', paddingBottom: '14px' }}>
          <div>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#8c8278', letterSpacing: '0.05em' }}>LUMORA SYSTEM</span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600, margin: '2px 0 0 0', fontFamily: 'Bodoni Moda', color: '#1a1a1a' }}>
              {brand ? 'Chỉnh Sửa Thương Hiệu' : 'Thêm Thương Hiệu Mới'}
            </h2>
          </div>
          <button type="button" onClick={onClose} style={{ background: '#f5f2ed', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#78716c', letterSpacing: '0.05em', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            TÊN THƯƠNG HIỆU *
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #dcd6cd', fontSize: '13px', outline: 'none', background: '#faf8f5' }} />
          </label>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#78716c', letterSpacing: '0.05em', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            MÔ TẢ / QUỐC GIA
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #dcd6cd', fontSize: '13px', outline: 'none', background: '#faf8f5' }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 500, color: '#333', marginTop: '4px', cursor: 'pointer', background: '#faf8f5', padding: '10px 14px', borderRadius: '8px', border: '1px solid #eae6df' }}>
            <input 
              type="checkbox" 
              checked={form.isActive} 
              onChange={e => setForm({ ...form, isActive: e.target.checked })}
              style={{ width: '16px', height: '16px', accentColor: '#1c1c1c' }} 
            />
            Đang hoạt động (Kinh doanh)
          </label>
          
          {error && <p style={{ color: '#dc2626', fontSize: '12px', margin: 0, fontWeight: 500 }}>{error}</p>}
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid #f2efeb', paddingTop: '18px' }}>
            <button type="button" onClick={onClose} style={{ padding: '11px 20px', borderRadius: '8px', border: '1px solid #dcd6cd', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#555' }}>Hủy</button>
            <button type="submit" disabled={saving} style={{ padding: '11px 20px', borderRadius: '8px', border: 'none', background: '#1c1c1c', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
              {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBrands() {
  const [query, setQuery] = useState({ search: '', status: '' });
  const [state, setState] = useState({ data: [], loading: true, error: '' });
  const [modalMode, setModalMode] = useState(null); // null | 'add' | brandObject
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Gọi chuẩn endpoint GET /api/brands/admin để xem toàn bộ Brand
    api.get('/api/brands/admin', { params: query })
      .then(res => {
        if (!cancelled) {
          const raw = res?.data?.data ?? res?.data?.brands ?? res?.data ?? [];
          setState({ data: Array.isArray(raw) ? raw : [], loading: false, error: '' });
        }
      })
      .catch(err => {
        if (!cancelled) {
          // Fallback nếu api/brands/admin lỗi thì gọi GET /api/brands
          api.get('/api/brands', { params: query })
            .then(res2 => {
              const raw2 = res2?.data?.data ?? res2?.data ?? [];
              if (!cancelled) setState({ data: Array.isArray(raw2) ? raw2 : [], loading: false, error: '' });
            })
            .catch(err2 => {
              if (!cancelled) setState({ data: [], loading: false, error: err2.message || 'Không thể tải danh sách thương hiệu.' });
            });
        }
      });
    return () => { cancelled = true; };
  }, [query, refreshKey]);

  function update(changes) {
    setQuery(prev => ({ ...prev, ...changes }));
  }

  async function handleDelete(brand) {
    const brandId = brand?._id || brand?.id;
    if (!brandId) return;
    if (!window.confirm(`Bạn có chắc chắn muốn vô hiệu hóa thương hiệu "${brand.name}" không?`)) return;
    try {
      // Gọi chuẩn endpoint DELETE /api/brands/{id} theo Swagger
      await api.delete(`/api/brands/${brandId}`);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      alert('Không thể xóa thương hiệu: ' + (err.message || 'Lỗi hệ thống'));
    }
  }

  const filteredData = state.data.filter(brand => {
    const searchMatch = !query.search || brand.name?.toLowerCase().includes(query.search.toLowerCase());
    const statusMatch = query.status === '' || (query.status === 'active' ? brand.isActive !== false : brand.isActive === false);
    return searchMatch && statusMatch;
  });

  return (
    <div style={{ padding: "0 28px 48px 28px", fontFamily: "'Inter', sans-serif", maxWidth: "1500px", margin: "0 auto" }}>
      {/* HEADER ĐỒNG BỘ */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", borderBottom: "1px solid #eae6df", paddingBottom: "20px" }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#78716c", letterSpacing: "0.05em" }}>
            QUẢN TRỊ DANH MỤC / THƯƠNG HIỆU & XƯỞNG
          </span>
          <h1 style={{ fontFamily: "Bodoni Moda", fontSize: "2.6rem", fontWeight: 600, color: "#1a1a1a", margin: "4px 0 6px 0" }}>
            Quản Lý Thương Hiệu & Xưởng
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>
            Điều phối mạng lưới thương hiệu đối tác và xưởng sản xuất nội thất LUMORA.
          </p>
        </div>
        <button 
          onClick={() => setModalMode('add')}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "#1c1c1c", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
        >
          <Plus size={16} /> Thêm Thương Hiệu Mới
        </button>
      </header>

      {/* THANH LỌC DỮ LIỆU ĐỒNG BỘ */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 240px auto", gap: "16px", marginBottom: "24px", background: "#fff", padding: "20px", borderRadius: "14px", border: "1px solid #eae6df", alignItems: "flex-end", boxShadow: "0 2px 6px rgba(0,0,0,0.01)" }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#78716c', letterSpacing: '0.03em' }}>
          TÌM KIẾM THƯƠNG HIỆU
          <div style={{ display: 'flex', alignItems: 'center', background: '#faf8f5', border: '1px solid #dcd6cd', borderRadius: '8px', padding: '0 12px' }}>
            <Search size={16} color="#888" style={{ marginRight: 8, flexShrink: 0 }} />
            <input 
              type="search"
              placeholder="Nhập tên thương hiệu..." 
              value={query.search} 
              onChange={e => update({ search: e.target.value })} 
              style={{ border: 'none', outline: 'none', padding: '10px 0', fontSize: '13px', width: '100%', background: 'transparent' }} 
            />
          </div>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#78716c', letterSpacing: '0.03em' }}>
          TRẠNG THÁI
          <select 
            value={query.status} 
            onChange={e => update({ status: e.target.value })}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #dcd6cd', fontSize: '13px', background: '#faf8f5', outline: 'none', width: '100%' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </label>
        <button 
          type="button"
          onClick={() => setRefreshKey(prev => prev + 1)}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "8px", border: "1px solid #dcd6cd", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600, height: "41px", color: "#444", whiteSpace: "nowrap" }}
        >
          <RefreshCw size={14} /> Làm mới
        </button>
      </section>

      {/* BẢNG HIỂN THỊ CHUẨN FORM */}
      <section style={{ background: '#fff', border: '1px solid #eae6df', borderRadius: '14px', overflow: 'hidden', boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
        {state.loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666', fontSize: '13px' }}>Đang tải danh sách thương hiệu...</div>
        ) : state.error ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#dc2626', fontSize: '13px' }}>{state.error}</div>
        ) : !filteredData.length ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666', fontSize: '13px' }}>Không tìm thấy thương hiệu phù hợp.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#faf8f5', borderBottom: '1px solid #eae6df', color: '#78716c', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  <th style={{ padding: '16px 24px', width: '35%' }}>TÊN THƯƠNG HIỆU / XƯỞNG</th>
                  <th style={{ padding: '16px 20px', width: '35%' }}>MÔ TẢ / QUỐC GIA</th>
                  <th style={{ padding: '16px 20px', width: '20%' }}>TRẠNG THÁI</th>
                  <th style={{ padding: '16px 24px', width: '10%', textAlign: 'right' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((brand, idx) => {
                  const isActive = brand.isActive !== false;
                  return (
                    <tr key={brand._id || brand.id} style={{ borderBottom: '1px solid #f2efeb', background: idx % 2 === 0 ? '#fff' : '#fcfbfa' }}>
                      <td style={{ padding: '18px 24px', fontWeight: 600, color: '#1c1c1c' }}>
                        {brand.name}
                      </td>
                      <td style={{ padding: '18px 20px', color: '#666', fontSize: '12px' }}>
                        {brand.description || brand.country || 'N/A'}
                      </td>
                      <td style={{ padding: '18px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{ 
                          display: 'inline-block',
                          background: isActive ? '#f0fdf4' : '#fef2f2', 
                          color: isActive ? '#15803d' : '#dc2626', 
                          padding: '5px 12px', 
                          borderRadius: '20px', 
                          fontSize: '11px', 
                          fontWeight: 700,
                          textAlign: 'center'
                        }}>
                          {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                        </span>
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button 
                            type="button"
                            title="Chỉnh sửa"
                            onClick={() => setModalMode(brand)}
                            style={{ padding: "8px", borderRadius: "8px", border: "1px solid #dcd6cd", background: "#fff", cursor: "pointer", color: "#444" }}
                          >
                            <Pencil size={15} />
                          </button>
                          <button 
                            type="button"
                            title="Vô hiệu hóa"
                            onClick={() => handleDelete(brand)}
                            style={{ padding: "8px", borderRadius: "8px", border: "1px solid #fecaca", background: "#fef2f2", cursor: "pointer", color: "#dc2626" }}
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
        <BrandModal 
          brand={modalMode === 'add' ? null : modalMode} 
          onClose={() => setModalMode(null)} 
          onSaved={() => { setModalMode(null); setRefreshKey(prev => prev + 1); }} 
        />
      )}
    </div>
  );
}