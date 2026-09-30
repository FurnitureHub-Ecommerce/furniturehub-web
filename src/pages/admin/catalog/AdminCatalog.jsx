import { useEffect, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { getCatalog } from '../../../services/admin/catalog.service.js';
import './AdminCatalog.css';

const money = value => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

export default function AdminCatalog() {
  const [query, setQuery] = useState({ search: '', categoryId: '', brandId: '', material: '', status: '', page: 1, pageSize: 10 });
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getCatalog(query).then(data => { 
      if (!cancelled) setState({ data, loading: false, error: '' }); 
    }).catch(error => { 
      if (!cancelled) setState({ data: null, loading: false, error: error.message }); 
    });
    return () => { cancelled = true; };
  }, [query, retry]);

  function update(values) {
    setState(previous => ({ ...previous, loading: true, error: '' }));
    setQuery(previous => ({ ...previous, ...values, page: 1 }));
  }

  const data = state.data;

  return (
    <div style={{ padding: "0 28px 48px 28px", fontFamily: "'Inter', sans-serif", maxWidth: "1500px", margin: "0 auto" }}>
      {/* HEADER */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", borderBottom: "1px solid #eae6df", paddingBottom: "20px" }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#78716c", letterSpacing: "0.05em" }}>
            QUẢN TRỊ DANH MỤC / QUẢN LÝ SẢN PHẨM
          </span>
          <h1 style={{ fontFamily: "Bodoni Moda", fontSize: "2.6rem", fontWeight: 600, color: "#1a1a1a", margin: "4px 0 6px 0" }}>
            Quản Trị Sản Phẩm, Biến Thể & Danh Mục
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>
            Hệ thống điều phối danh mục nội thất, chất liệu và mạng lưới thương hiệu LUMORA.
          </p>
        </div>
      </header>

      {/* THANH LỌC DỮ LIỆU */}
      <section style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr auto", gap: "16px", marginBottom: "24px", background: "#fff", padding: "20px", borderRadius: "14px", border: "1px solid #eae6df", alignItems: "flex-end", boxShadow: "0 2px 6px rgba(0,0,0,0.01)" }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#78716c', letterSpacing: '0.03em' }}>
          TÌM KIẾM SẢN PHẨM
          <div style={{ display: 'flex', alignItems: 'center', background: '#faf8f5', border: '1px solid #dcd6cd', borderRadius: '8px', padding: '0 12px' }}>
            <Search size={16} color="#888" style={{ marginRight: 8, flexShrink: 0 }} />
            <input style={{ border: 'none', outline: 'none', padding: '10px 0', fontSize: '13px', width: '100%', background: 'transparent' }} value={query.search} onChange={e => update({ search: e.target.value })} placeholder="Tìm sản phẩm, SKU..." />
          </div>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#78716c', letterSpacing: '0.03em' }}>
          DANH MỤC
          <select style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #dcd6cd', fontSize: '13px', background: '#faf8f5', outline: 'none', width: '100%' }} value={query.categoryId} onChange={e => update({ categoryId: e.target.value })}>
            <option value="">Tất cả không gian</option>
            {data?.categories?.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#78716c', letterSpacing: '0.03em' }}>
          THƯƠNG HIỆU
          <select style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #dcd6cd', fontSize: '13px', background: '#faf8f5', outline: 'none', width: '100%' }} value={query.brandId} onChange={e => update({ brandId: e.target.value })}>
            <option value="">Tất cả thương hiệu</option>
            {data?.brands?.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#78716c', letterSpacing: '0.03em' }}>
          TRẠNG THÁI
          <select style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #dcd6cd', fontSize: '13px', background: '#faf8f5', outline: 'none', width: '100%' }} value={query.status} onChange={e => update({ status: e.target.value })}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </label>
        <button 
          type="button"
          onClick={() => setRetry(value => value + 1)}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "8px", border: "1px solid #dcd6cd", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600, height: "41px", color: "#444", whiteSpace: "nowrap" }}
        >
          <RefreshCw size={14} /> Làm mới
        </button>
      </section>

      {/* BẢNG HIỂN THỊ CHUẨN FORM */}
      <section style={{ background: '#fff', border: '1px solid #eae6df', borderRadius: '14px', overflow: 'hidden', boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
        {!data && !state.error ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666', fontSize: '13px' }}>Đang tải Catalog sản phẩm…</div>
        ) : state.error ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#dc2626', fontSize: '13px' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Không thể tải Catalog</h2>
            <p>{state.error}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#faf8f5', borderBottom: '1px solid #eae6df', color: '#78716c', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  <th style={{ padding: '16px 24px', width: '32%' }}>SẢN PHẨM</th>
                  <th style={{ padding: '16px 20px', width: '18%' }}>DANH MỤC</th>
                  <th style={{ padding: '16px 20px', width: '16%' }}>THƯƠNG HIỆU</th>
                  <th style={{ padding: '16px 20px', width: '14%' }}>GIÁ BÁN</th>
                  <th style={{ padding: '16px 20px', width: '10%' }}>BIẾN THỂ SKU</th>
                  <th style={{ padding: '16px 24px', width: '10%' }}>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((product, idx) => {
                  const isActive = product.isActive !== false;
                  return (
                    <tr key={product._id} style={{ borderBottom: '1px solid #f2efeb', background: idx % 2 === 0 ? '#fff' : '#fcfbfa' }}>
                      <td style={{ padding: '18px 24px' }}>
                        <strong style={{ color: '#1c1c1c', display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '14px' }}>{product.name}</strong>
                        <span style={{ color: '#666', fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>{product.description}</span>
                      </td>
                      <td style={{ padding: '18px 20px', color: '#444', fontWeight: 500 }}>{product.category?.name || "N/A"}</td>
                      <td style={{ padding: '18px 20px', color: '#444', fontWeight: 500 }}>{product.brand?.name || "N/A"}</td>
                      <td style={{ padding: '18px 20px', fontWeight: 700, color: '#15803d', whiteSpace: 'nowrap' }}>
                        {product.priceRange ? money(product.priceRange.min) : 'Chưa có giá'}
                      </td>
                      <td style={{ padding: '18px 20px', whiteSpace: 'nowrap' }}>
                        <span style={{ background: '#f0ece6', color: '#2c2825', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}>
                          {product.variants?.length || 0} Biến thể
                        </span>
                      </td>
                      <td style={{ padding: '18px 24px', whiteSpace: 'nowrap' }}>
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}