import React, { useState, useEffect } from 'react';
import { productAPI } from '../../services/api'; // Điều chỉnh đường dẫn tương ứng đến file api.js của bạn
import { Search, Filter, Plus, Edit, Trash2 } from 'lucide-react';

const SkuManagement = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealInventory = async () => {
      try {
        setLoading(true);
        // Gọi API lấy danh sách sản phẩm
        const productsRes = await productAPI.getProducts();
        const products = productsRes.data || productsRes;

        let allVariants = [];
        // Duyệt qua từng sản phẩm để lấy các biến thể (SKU) của nó
        for (const prod of products) {
          const prodId = prod._id || prod.id;
          try {
            const variantsRes = await productAPI.getProductVariants(prodId);
            const variants = variantsRes.data || variantsRes;

            const mapped = variants.map((v) => ({
              id: v.sku || v._id || v.id,
              name: prod.name,
              specs: `${v.color || ''} - ${v.size || ''} - ${v.material || ''}`.trim(),
              location: v.location || 'Kho A - Mặc định', // Nếu API chưa có location, dùng giá trị mặc định
              stock: v.stock ?? 10, // Nếu API chưa có stock, mặc định hiển thị để test
              price: v.price
            }));
            allVariants = [...allVariants, ...mapped];
          } catch (err) {
            console.error(`Lỗi lấy biến thể của sản phẩm ${prod.name}:`, err);
          }
        }
        setSkuProducts(allVariants);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu kho:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealInventory();
  }, []);

  const danhSachLoc = skuProducts.filter(
    (item) =>
      item.name.toLowerCase().includes(tuKhoaTimKiem.toLowerCase()) ||
      item.id.toLowerCase().includes(tuKhoaTimKiem.toLowerCase())
  );

  if (loading) {
    return <div className="dashboard-main" style={{ padding: '20px' }}>Đang đồng bộ dữ liệu SKU từ hệ thống...</div>;
  }

  return (
    <div className="dashboard-main">
      <header className="dash-header">
        <div>
          <span className="subtitle">QUẢN LÝ DANH MỤC SKU</span>
          <h2>Quản Lý Danh Mục SKU & Biến Thể</h2>
          <p>Quản lý toàn bộ thông tin định danh sản phẩm, thuộc tính biến thể và vị trí lưu trữ trong kho.</p>
        </div>
        <div className="actions">
          <button className="btn-secondary">
            <Filter size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Bộ Lọc
          </button>
          <button className="btn-primary">
            <Plus size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Thêm SKU Mới
          </button>
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
              <th>VỊ TRÍ LƯU TRỮ</th>
              <th>TỒN KHO</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {danhSachLoc.map((prod) => (
              <tr key={prod.id}>
                <td>
                  <strong>{prod.name}</strong>
                  <br />
                  <small style={{ color: '#888' }}>{prod.id}</small>
                </td>
                <td>{prod.specs}</td>
                <td><span className="badge">{prod.location}</span></td>
                <td><strong>{prod.stock}</strong> chiếc</td>
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
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default SkuManagement;