import React, { useState, useEffect } from 'react';
import { loadStorageVariants } from '../../services/storageData';
import { Search, Filter, Edit, Trash2 } from 'lucide-react';

const SkuManagement = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');
  const [boLocTrangThai, setBoLocTrangThai] = useState('ALL'); // Trạng thái bộ lọc
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealInventory = async () => {
      try {
        setLoading(true);
        setSkuProducts(await loadStorageVariants());
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu kho:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealInventory();
  }, []);

  // Lọc theo từ khóa tìm kiếm và trạng thái tồn kho
  const danhSachLoc = skuProducts.filter((item) => {
    const matchKeyword =
      item.name.toLowerCase().includes(tuKhoaTimKiem.toLowerCase()) ||
      item.id.toLowerCase().includes(tuKhoaTimKiem.toLowerCase());

    if (boLocTrangThai === 'STABLE') return matchKeyword && item.stock !== null && item.stock > 15;
    if (boLocTrangThai === 'LOW') return matchKeyword && item.stock !== null && item.stock > 0 && item.stock <= 15;
    if (boLocTrangThai === 'OUT') return matchKeyword && item.stock === 0;

    return matchKeyword;
  });

  if (loading) {
    return <div className="dashboard-main" style={{ padding: '40px', textAlign: 'center' }}>Đang đồng bộ dữ liệu SKU từ hệ thống...</div>;
  }

  return (
    <div className="dashboard-main">
      <header className="dash-header">
        <div>
          <span className="subtitle">QUẢN LÝ DANH MỤC SKU</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600 }}>Quản Lý Danh Mục SKU & Biến Thể</h2>
          <p>Quản lý toàn bộ thông tin định danh sản phẩm và thuộc tính biến thể trong kho.</p>
        </div>
        
        <div className="actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={14} /> Lọc trạng thái:
          </span>
          <select 
            value={boLocTrangThai} 
            onChange={(e) => setBoLocTrangThai(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #dcd6cd', background: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="ALL">Tất Cả Trạng Thái</option>
            <option value="STABLE">Ổn Định (&gt; 15)</option>
            <option value="LOW">Sắp Hết (1 - 15)</option>
            <option value="OUT">Hết Hàng (0)</option>
          </select>
        </div>
      </header>

      {/* Thanh tìm kiếm */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', background: '#fff', padding: '16px', borderRadius: '6px', border: '1px solid #eaeaea' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '350px', background: '#f7f6f3', padding: '8px 12px', borderRadius: '4px', border: '1px solid #e2ded4' }}>
          <Search size={18} color="#8c857b" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mã SKU..."
            value={tuKhoaTimKiem}
            onChange={(e) => setTuKhoaTimKiem(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#666' }}>
          <span>Hiển thị <strong>{danhSachLoc.length}</strong> SKU</span>
        </div>
      </div>

      {/* Bảng danh sách SKU */}
      <section className="sku-section">
        <table className="storage-table">
          <thead>
            <tr>
              <th>MÃ SKU & TÊN SẢN PHẨM</th>
              <th>QUY CÁCH & THUỘC TÍNH</th>
              <th>TỒN KHO</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {danhSachLoc.length > 0 ? (
              danhSachLoc.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <strong>{prod.name}</strong>
                    <br />
                    <small style={{ color: '#888' }}>{prod.id}</small>
                  </td>
                  <td>{prod.specs}</td>
                  <td><strong>{prod.stock === null ? 'Chưa cập nhật' : prod.stock}</strong>{prod.stock !== null && ' chiếc'}</td>
                  <td>
                    <span style={{
                      background: prod.stock === null ? '#f5f5f4' : prod.stock === 0 ? '#fef2f2' : prod.stock <= 15 ? '#fffbeb' : '#f0fdf4',
                      color: prod.stock === null ? '#78716c' : prod.stock === 0 ? '#dc2626' : prod.stock <= 15 ? '#d97706' : '#16a34a',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      {prod.stock === null ? 'CHƯA CÓ DỮ LIỆU TỒN' : prod.stock === 0 ? 'HẾT HÀNG' : prod.stock <= 15 ? 'SẮP HẾT' : 'ỔN ĐỊNH'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button title="Sửa" style={{ background: 'transparent', border: '1px solid #ccc', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                        <Edit size={14} color="#333" />
                      </button>
                      <button title="Xóa" style={{ background: 'transparent', border: '1px solid #ffcccc', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                        <Trash2 size={14} color="#dc2626" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  Không tìm thấy SKU nào phù hợp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default SkuManagement;