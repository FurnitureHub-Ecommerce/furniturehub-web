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
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif", paddingBottom: "60px" }}>
      <style>{`
        .filter-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.25s ease;
          border: 1px solid #e2ded8;
          background: #fff;
          color: #666;
        }
        .filter-btn:hover {
          background: #f7f5f0;
          color: #111;
          border-color: #d1cbc1;
        }
        .filter-btn.active {
          background: #1c1c1c;
          color: #fff;
          border-color: #1c1c1c;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .custom-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #eae6df;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }
        .custom-table th {
          background: #faf8f5;
          color: #78716c;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.05em;
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #eae6df;
          white-space: nowrap;
        }
        .custom-table td {
          padding: 16px;
          font-size: 13px;
          color: #292524;
          border-bottom: 1px solid #f2efeb;
          vertical-align: middle;
        }
        .custom-table tbody tr:last-child td {
          border-bottom: none;
        }
        .custom-table tbody tr:hover {
          background: #fcfbfa;
        }
      `}</style>

      {/* Header trang sạch sẽ, không bị nút bấm lấn chiếm */}
      <header className="dash-header" style={{ marginBottom: '24px' }}>
        <div>
          <span className="subtitle" style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.05em' }}>TÌNH TRẠNG SẴN CÓ THỜI GIAN THỰC</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600, margin: '4px 0 8px 0' }}>
            Kiểm Tra Tình Trạng Sẵn Có Của Hàng Hóa
          </h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Theo dõi nhanh số lượng hàng có thể xuất bán hoặc phân bổ ngay tại các sản phẩm trong hệ thống.</p>
        </div>
      </header>

      {/* Phần bảng và các nút lọc được bố trí gọn gàng phía dưới */}
      <section className="sku-section" style={{ background: 'transparent', padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackageCheck size={24} color="#1c1c1c" />
            <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 600, color: '#1c1c1c' }}>Ma Trận Hàng Sẵn Sàng</h3>
          </div>

          {/* Bộ lọc trạng thái chuyển xuống đây cho gọn và chuyên nghiệp */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={`filter-btn ${boLoc === 'ALL' ? 'active' : ''}`} onClick={() => xuLyDoiBoLoc('ALL')}>Tất Cả</button>
            <button className={`filter-btn ${boLoc === 'AVAILABLE' ? 'active' : ''}`} onClick={() => xuLyDoiBoLoc('AVAILABLE')}>Còn Hàng Sẵn Sàng</button>
            <button className={`filter-btn ${boLoc === 'OUT' ? 'active' : ''}`} onClick={() => xuLyDoiBoLoc('OUT')}>Hết Hàng</button>
          </div>
        </div>

        {!loading && (
          <div style={{ fontSize: '13px', color: '#78716c', marginBottom: '12px', textAlign: 'right' }}>
            Hiển thị {chiSoBatDau + 1} - {Math.min(chiSoBatDau + soLuongMoiTrang, danhSachLoc.length)} trong tổng số <strong>{danhSachLoc.length}</strong> SKU
          </div>
        )}

        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center', color: '#888', background: '#fff', borderRadius: '12px', border: '1px solid #eae6df' }}>
            Đang tải dữ liệu kho hàng, vui lòng đợi trong giây lát...
          </div>
        ) : (
          <div>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '35%' }}>MÃ SKU & TÊN SẢN PHẨM</th>
                  <th style={{ width: '30%' }}>QUY CÁCH</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>SỐ LƯỢNG KHẢ DỤNG</th>
                  <th style={{ width: '20%', textAlign: 'center' }}>TRẠNG THÁI GIAO DỊCH</th>
                </tr>
              </thead>
              <tbody>
                {danhSachPhanTrang.length > 0 ? (
                  danhSachPhanTrang.map((prod) => (
                    <tr key={prod.id || Math.random()}>
                      <td>
                        <strong style={{ color: '#1c1c1c', fontWeight: 600, fontSize: '13px' }}>{prod.name}</strong>
                        <br />
                        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                          {prod.sku || prod.id}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#57534e', fontSize: '13px' }}>{prod.specs || 'Chưa cập nhật'}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: prod.stock > 0 ? '#16a34a' : '#dc2626' }}>
                          {prod.stock === null || prod.stock === undefined ? 'Chưa cập nhật' : prod.stock.toLocaleString()}
                        </span>
                        {prod.stock !== null && prod.stock !== undefined && <span style={{ fontSize: '12px', color: '#78716c', marginLeft: '4px' }}>đơn vị</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {prod.stock > 0 ? (
                          <span style={{ color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                            <CheckCircle2 size={13} /> Sẵn Sàng Xuất Kho
                          </span>
                        ) : (
                          <span style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                            <AlertCircle size={13} /> Hết Hàng / Chờ Nhập
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#8c857b' }}>Không tìm thấy sản phẩm phù hợp.</td></tr>
                )}
              </tbody>
            </table>

            {tongSoTrang > 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                <button 
                  onClick={() => setTrangHienTai(p => Math.max(p - 1, 1))} 
                  disabled={trangHienTai === 1} 
                  className="filter-btn" 
                  style={{ padding: '6px 12px', opacity: trangHienTai === 1 ? 0.5 : 1, cursor: trangHienTai === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronLeft size={14} style={{ verticalAlign: 'middle' }} /> Trước
                </button>
                <span style={{ fontSize: '13px', color: '#57534e' }}>Trang <strong>{trangHienTai}</strong> / {tongSoTrang}</span>
                <button 
                  onClick={() => setTrangHienTai(p => Math.min(p + 1, tongSoTrang))} 
                  disabled={trangHienTai === tongSoTrang} 
                  className="filter-btn" 
                  style={{ padding: '6px 12px', opacity: trangHienTai === tongSoTrang ? 0.5 : 1, cursor: trangHienTai === tongSoTrang ? 'not-allowed' : 'pointer' }}
                >
                  Sau <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
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