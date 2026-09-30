import React, { useState, useEffect } from 'react';
import { loadStorageVariants } from '../../services/storageData';
import { PackageCheck, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const StockAvailability = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [boLoc, setBoLoc] = useState('ALL');

  const [trangHienTai, setTrangHienTai] = useState(1);
  const soLuongMoiTrang = 8;

  useEffect(() => {
    const fetchStockAvailability = async () => {
      try {
        setLoading(true);
        const data = await loadStorageVariants();
        setSkuProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Lỗi tải dữ liệu tình trạng sẵn có:', error);
        setSkuProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStockAvailability();
  }, []);

  const danhSachLoc = Array.isArray(skuProducts) ? skuProducts.filter((item) => {
    if (boLoc === 'AVAILABLE') return item.stock !== null && item.stock > 0;
    if (boLoc === 'OUT') return item.stock !== null && item.stock === 0;
    return true;
  }) : [];

  const tongSoTrang = Math.ceil(danhSachLoc.length / soLuongMoiTrang) || 1;
  const chiSoBatDau = (trangHienTai - 1) * soLuongMoiTrang;
  const danhSachPhanTrang = danhSachLoc.slice(chiSoBatDau, chiSoBatDau + soLuongMoiTrang);

  const xuLyDoiBoLoc = (loai) => {
    setBoLoc(loai);
    setTrangHienTai(1);
  };

  return (
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="dash-header">
        <div>
          <span className="subtitle">TÌNH TRẠNG SẴN CÓ THỜI GIAN THỰC</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600 }}>
            Kiểm Tra Tình Trạng Sẵn Có Của Hàng Hóa
          </h2>
          <p>Theo dõi nhanh số lượng hàng có thể xuất bán hoặc phân bổ ngay tại các sản phẩm trong hệ thống.</p>
        </div>

        <div className="actions" style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn-secondary ${boLoc === 'ALL' ? 'active' : ''}`} onClick={() => xuLyDoiBoLoc('ALL')}>Tất Cả</button>
          <button className={`btn-secondary ${boLoc === 'AVAILABLE' ? 'active' : ''}`} onClick={() => xuLyDoiBoLoc('AVAILABLE')}>Còn Hàng Sẵn Sàng</button>
          <button className={`btn-secondary ${boLoc === 'OUT' ? 'active' : ''}`} onClick={() => xuLyDoiBoLoc('OUT')}>Hết Hàng</button>
        </div>
      </header>

      <section className="sku-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackageCheck size={20} color="#1c1c1c" />
            <h3 style={{ margin: 0 }}>Ma Trận Hàng Sẵn Sàng</h3>
          </div>
          {!loading && (
            <span style={{ fontSize: '13px', color: '#666' }}>
              Hiển thị {chiSoBatDau + 1} - {Math.min(chiSoBatDau + soLuongMoiTrang, danhSachLoc.length)} trong tổng số <strong>{danhSachLoc.length}</strong> SKU
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải dữ liệu kho hàng...</div>
        ) : (
          <div>
            <table className="storage-table" style={{ fontSize: '14px' }}>
              <thead>
                <tr>
                  <th>MÃ SKU & TÊN SẢN PHẨM</th>
                  <th>QUY CÁCH</th>
                  <th>SỐ LƯỢNG KHẢ DỤNG</th>
                  <th>TRẠNG THÁI GIAO DỊCH</th>
                </tr>
              </thead>
              <tbody>
                {danhSachPhanTrang.length > 0 ? (
                  danhSachPhanTrang.map((prod) => (
                    <tr key={prod.id || Math.random()}>
                      <td>
                        <strong>{prod.name}</strong>
                        <br />
                        <small style={{ color: '#888' }}>{prod.id}</small>
                      </td>
                      <td>{prod.specs}</td>
                      <td><strong>{prod.stock === null || prod.stock === undefined ? 'Chưa cập nhật' : prod.stock}</strong>{prod.stock !== null && prod.stock !== undefined && ' đơn vị'}</td>
                      <td>
                        {prod.stock > 0 ? (
                          <span style={{ color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={16} /> Sẵn Sàng Xuất Kho
                          </span>
                        ) : (
                          <span style={{ color: '#dc2626', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertCircle size={16} /> Hết Hàng / Chờ Nhập
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>Không tìm thấy sản phẩm phù hợp.</td></tr>
                )}
              </tbody>
            </table>

            {tongSoTrang > 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                <button onClick={() => setTrangHienTai(p => Math.max(p - 1, 1))} disabled={trangHienTai === 1} className="btn-secondary" style={{ padding: '6px 12px' }}>
                  <ChevronLeft size={14} /> Trước
                </button>
                <span>Trang <strong>{trangHienTai}</strong> / {tongSoTrang}</span>
                <button onClick={() => setTrangHienTai(p => Math.min(p + 1, tongSoTrang))} disabled={trangHienTai === tongSoTrang} className="btn-secondary" style={{ padding: '6px 12px' }}>
                  Sau <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default StockAvailability;