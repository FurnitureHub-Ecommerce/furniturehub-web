import React, { useState, useEffect } from 'react';
import { storageAPI } from '../../services/api.js';
import { Search, Filter, Eye, X, Info, CheckCircle, XCircle, Calendar } from 'lucide-react';

const SkuManagement = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');
  const [boLocTrangThai, setBoLocTrangThai] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedSku, setSelectedSku] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  useEffect(() => {
    const fetchRealInventory = async () => {
      try {
        setLoading(true);
        const res = await storageAPI.getInventory();
        const data = res?.data?.inventories || res?.data?.data?.inventories || res?.data || [];
        
        const formatted = (Array.isArray(data) ? data : []).map(item => {
          const variant = item.variantId || item.variant || {};
          const product = variant.productId || item.product || {};
          return {
            ...item,
            id: variant.sku || variant._id || item._id,
            name: product.name || item.name || 'Sản phẩm nội thất',
            specs: [variant.color, variant.size, variant.material].filter(Boolean).join(' — ') || 'Tiêu chuẩn',
            stock: item.quantity ?? variant.availableStock ?? 0
          };
        });
        setSkuProducts(formatted);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu SKU từ API:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRealInventory();
  }, []);

  const danhSachLoc = skuProducts.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(tuKhoaTimKiem.toLowerCase());
    const skuMatch = item.id.toLowerCase().includes(tuKhoaTimKiem.toLowerCase());
    const matchKeyword = nameMatch || skuMatch;

    if (boLocTrangThai === 'STABLE') return matchKeyword && item.stock > 15;
    if (boLocTrangThai === 'LOW') return matchKeyword && item.stock > 0 && item.stock <= 15;
    if (boLocTrangThai === 'OUT') return matchKeyword && item.stock === 0;

    return matchKeyword;
  });

  if (loading) {
    return <div className="dashboard-main" style={{ padding: '50px', textAlign: 'center', color: '#888' }}>Đang đồng bộ dữ liệu SKU từ API Backend...</div>;
  }

  return (
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '60px' }}>
      <header className="dash-header" style={{ marginBottom: '24px' }}>
        <div>
          <span className="subtitle" style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.05em' }}>QUẢN LÝ DANH MỤC SKU</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600, margin: '4px 0 8px 0' }}>
            Quản Lý Danh Mục SKU & Biến Thể
          </h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Quản lý toàn bộ thông tin định danh sản phẩm và thuộc tính biến thể từ hệ thống.</p>
        </div>
        <div className="actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '80px' }}>
          <span style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <Filter size={14} /> Lọc trạng thái:
          </span>
          <select 
            value={boLocTrangThai} 
            onChange={(e) => setBoLocTrangThai(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #dcd6cd', background: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            <option value="ALL">Tất Cả Trạng Thái</option>
            <option value="STABLE">Ổn Định (&gt; 15)</option>
            <option value="LOW">Sắp Hết (1 - 15)</option>
            <option value="OUT">Hết Hàng (0)</option>
          </select>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #eae6df', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '380px', background: '#faf8f5', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2ded4' }}>
          <Search size={18} color="#8c857b" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mã SKU..."
            value={tuKhoaTimKiem}
            onChange={(e) => setTuKhoaTimKiem(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px' }}
          />
        </div>
        <span style={{ fontSize: '13px', color: '#78716c' }}>Hiển thị tổng số <strong>{danhSachLoc.length}</strong> SKU</span>
      </div>

      <section className="sku-section" style={{ background: 'transparent', padding: 0 }}>
        <table className="storage-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eae6df' }}>
          <thead>
            <tr style={{ background: '#faf8f5', color: '#78716c', fontSize: '11px', fontWeight: 700, textAlign: 'left' }}>
              <th style={{ padding: '14px 16px' }}>TÊN SẢN PHẨM & MÃ SKU</th>
              <th style={{ padding: '14px 16px' }}>QUY CÁCH & THUỘC TÍNH</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>TỒN KHO</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>TRẠNG THÁI</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {danhSachLoc.length > 0 ? (
              danhSachLoc.map((prod) => (
                <tr key={prod._id || prod.id} style={{ borderBottom: '1px solid #f2efeb' }}>
                  <td style={{ padding: '16px' }}>
                    <strong style={{ color: '#1c1c1c', fontWeight: 600, fontSize: '13px' }}>{prod.name}</strong>
                    <br />
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                      {prod.id}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>{prod.specs}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <strong style={{ fontSize: '14px', color: prod.stock > 0 ? '#111827' : '#dc2626' }}>{prod.stock.toLocaleString()}</strong> chiếc
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{
                      background: prod.stock === 0 ? '#fef2f2' : prod.stock <= 15 ? '#fffbeb' : '#f0fdf4',
                      color: prod.stock === 0 ? '#dc2626' : prod.stock <= 15 ? '#d97706' : '#16a34a',
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700'
                    }}>
                      {prod.stock === 0 ? 'HẾT HÀNG' : prod.stock <= 15 ? 'SẮP HẾT' : 'ỔN ĐỊNH'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button 
                      onClick={() => { setSelectedSku(prod); setIsOpenModal(true); }}
                      style={{ background: '#fff', border: '1px solid #dcd6cd', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >
                      <Eye size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Xem
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#8c857b' }}>Không tìm thấy SKU nào phù hợp.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {isOpenModal && selectedSku && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '520px', borderRadius: '16px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eae6df', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Chi Tiết Thông Tin SKU</h3>
              <button onClick={() => setIsOpenModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#78716c' }}>TÊN SẢN PHẨM</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: 600, fontSize: '15px' }}>{selectedSku.name}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#78716c' }}>MÃ SKU</span>
                  <p style={{ margin: '4px 0 0 0', fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>{selectedSku.id}</p>
                </div>
                <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#78716c' }}>TỒN KHO</span>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 700, color: '#16a34a' }}>{selectedSku.stock} chiếc</p>
                </div>
              </div>
              <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#78716c' }}>QUY CÁCH</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>{selectedSku.specs}</p>
              </div>
            </div>
            <div style={{ marginTop: '24px', textAlign: 'right', borderTop: '1px solid #eae6df', paddingTop: '16px' }}>
              <button onClick={() => setIsOpenModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', background: '#1c1c1c', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkuManagement;