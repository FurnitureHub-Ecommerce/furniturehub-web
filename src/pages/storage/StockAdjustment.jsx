import React, { useEffect, useState } from 'react';
import { loadStorageVariants } from '../../services/storageData';
import { Sliders, CheckCircle2, ShieldAlert, CheckCircle } from 'lucide-react';

const StockAdjustment = () => {
  const [skuProducts, setSkuProducts] = useState([]);
  const [skuChon, setSkuChon] = useState('');
  const [soLuong, setSoLuong] = useState('');
  const [lyDo, setLyDo] = useState('');
  const [thongBao, setThongBao] = useState('');

  useEffect(() => {
    loadStorageVariants().then((variants) => {
      setSkuProducts(variants);
      setSkuChon(variants[0]?.id || '');
    }).catch(() => setThongBao('Không thể tải danh sách SKU từ hệ thống.'));
  }, []);

  const xuLyGui = (e) => {
    e.preventDefault();
    if (!soLuong || !lyDo) {
      setThongBao('Vui lòng nhập đầy đủ số lượng và lý do điều chỉnh!');
      return;
    }
    setThongBao(`Đã tạo phiếu điều chỉnh thành công cho SKU: ${skuChon}!`);
    setSoLuong('');
    setLyDo('');
  };

  return (
    <div className="dashboard-main" style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '60px' }}>
      <header className="dash-header" style={{ marginBottom: '24px' }}>
        <div>
          <span className="subtitle" style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.05em' }}>ĐỐI SOÁT & KIỂM KÊ KHO</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600, margin: '4px 0 8px 0' }}>
            Điều Chỉnh Tồn Kho Thực Tế
          </h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Cập nhật lại số lượng hàng hóa khi có chênh lệch kiểm kê định kỳ hoặc phát sinh lỗi.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Form Tạo Phiếu Điều Chỉnh */}
        <section className="sku-section" style={{ margin: 0, background: '#fff', padding: '28px', borderRadius: '12px', border: '1px solid #eae6df', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #eae6df', paddingBottom: '14px' }}>
            <Sliders size={20} color="#1c1c1c" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1c1c1c' }}>Tạo Phiếu Điều Chỉnh</h3>
          </div>

          {thongBao && (
            <div style={{ padding: '12px 16px', background: thongBao.includes('thành công') ? '#f0fdf4' : '#fef2f2', color: thongBao.includes('thành công') ? '#16a34a' : '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', border: `1px solid ${thongBao.includes('thành công') ? '#bbf7d0' : '#fecaca'}` }}>
              <CheckCircle2 size={16} /> {thongBao}
            </div>
          )}

          <form onSubmit={xuLyGui} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#78716c', marginBottom: '6px', letterSpacing: '0.05em' }}>CHỌN MÃ SKU *</label>
              <select
                value={skuChon}
                onChange={(e) => setSkuChon(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #dcd6cd', background: '#faf8f5', fontSize: '13px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
              >
                {skuProducts.map((item) => {
                  const skuCode = item.sku || item.id;
                  const stockVal = item.stock !== null && item.stock !== undefined ? item.stock : 0;
                  return (
                    <option key={item.id} value={item.id}>
                      [{skuCode}] {item.name} — Tồn kho: {stockVal}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#78716c', marginBottom: '6px', letterSpacing: '0.05em' }}>SỐ LƯỢNG THAY ĐỔI *</label>
              <input
                type="number"
                placeholder="Nhập số lượng..."
                value={soLuong}
                onChange={(e) => setSoLuong(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #dcd6cd', background: '#faf8f5', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#78716c', marginBottom: '6px', letterSpacing: '0.05em' }}>LÝ DO ĐIỀU CHỈNH *</label>
              <textarea
                placeholder="Nhập chi tiết lý do điều chỉnh kho..."
                value={lyDo}
                onChange={(e) => setLyDo(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #dcd6cd', background: '#faf8f5', fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '12px', width: '100%', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              Xác Nhận Điều Chỉnh Kho
            </button>
          </form>
        </section>

        {/* Khối Quy Định Kiểm Kê */}
        <section className="sku-section" style={{ margin: 0, background: '#faf8f5', padding: '28px', borderRadius: '12px', border: '1px solid #eae6df', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #eae6df', paddingBottom: '14px' }}>
            <ShieldAlert size={20} color="#d97706" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1c1c1c' }}>Quy Định Kiểm Kê & Điều Chỉnh</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ background: '#fef3c7', padding: '4px', borderRadius: '50%', display: 'flex', marginTop: '2px' }}>
                <CheckCircle size={14} color="#d97706" />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#57534e', lineHeight: '1.5' }}>
                Mọi thay đổi số lượng tồn kho đều phải có biên bản kiểm kê kèm chữ ký xác nhận của thủ kho.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ background: '#fef3c7', padding: '4px', borderRadius: '50%', display: 'flex', marginTop: '2px' }}>
                <CheckCircle size={14} color="#d97706" />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#57534e', lineHeight: '1.5' }}>
                Đối với hàng hóa hư hỏng do vận chuyển hoặc bảo quản, bắt buộc phải chụp ảnh đính kèm lý do giảm tồn.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ background: '#fef3c7', padding: '4px', borderRadius: '50%', display: 'flex', marginTop: '2px' }}>
                <CheckCircle size={14} color="#d97706" />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#57534e', lineHeight: '1.5' }}>
                Hệ thống sẽ tự động ghi lại lịch sử thao tác của từng tài khoản để đối soát số liệu định kỳ vào cuối tháng.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StockAdjustment;