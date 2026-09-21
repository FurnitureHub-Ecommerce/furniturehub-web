import React, { useState } from 'react';
import { skuProducts } from '../../data/storageData';
import { Sliders } from 'lucide-react';

const StockAdjustment = () => {
  const [skuChon, setSkuChon] = useState(skuProducts[0]?.id || '');
  const [soLuong, setSoLuong] = useState('');
  const [lyDo, setLyDo] = useState('');
  const [thongBao, setThongBao] = useState('');

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
    <div className="dashboard-main">
      <header className="dash-header">
        <div>
          <span className="subtitle">ĐỐI SOÁT & KIỂM KÊ KHO</span>
          <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600 }}>Điều Chỉnh Tồn Kho Thực Tế</h2>
          <p>Cập nhật lại số lượng hàng hóa khi có chênh lệch kiểm kê định kỳ hoặc phát sinh lỗi.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <section className="sku-section" style={{ margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sliders size={20} color="#1c1c1c" />
            <h3 style={{ margin: 0 }}>Tạo Phiếu Điều Chỉnh</h3>
          </div>

          {thongBao && (
            <div style={{ padding: '10px 14px', background: '#f0fdf4', color: '#16a34a', borderRadius: '4px', marginBottom: '16px', fontSize: '13px', fontWeight: '600' }}>
              {thongBao}
            </div>
          )}

          <form onSubmit={xuLyGui} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#8c857b', marginBottom: '6px' }}>CHỌN MÃ SKU</label>
              <select
                value={skuChon}
                onChange={(e) => setSkuChon(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #e2ded4', background: '#f7f6f3', fontSize: '13px', outline: 'none' }}
              >
                {skuProducts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id} - {item.name} (Tồn hiện tại: {item.stock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#8c857b', marginBottom: '6px' }}>SỐ LƯỢNG THAY ĐỔI</label>
              <input
                type="number"
                placeholder="Nhập số lượng..."
                value={soLuong}
                onChange={(e) => setSoLuong(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #e2ded4', background: '#f7f6f3', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#8c857b', marginBottom: '6px' }}>LÝ DO ĐIỀU CHỈNH</label>
              <textarea
                placeholder="Nhập chi tiết lý do điều chỉnh kho..."
                value={lyDo}
                onChange={(e) => setLyDo(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #e2ded4', background: '#f7f6f3', fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '12px', width: '100%' }}>
              Xác Nhận Điều Chỉnh Kho
            </button>
          </form>
        </section>

        <section className="sku-section" style={{ margin: 0, background: '#fcfbfa' }}>
          <h3 style={{ marginBottom: '12px' }}>Quy Định Kiểm Kê & Điều Chỉnh</h3>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#555', display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: '1.5' }}>
            <li>Mọi thay đổi số lượng tồn kho đều phải có biên bản kiểm kê kèm chữ ký xác nhận của thủ kho.</li>
            <li>Đối với hàng hóa hư hỏng do vận chuyển hoặc bảo quản, bắt buộc phải chụp ảnh đính kèm lý do giảm tồn.</li>
            <li>Hệ thống sẽ tự động ghi lại lịch sử thao tác của từng tài khoản để đối soát số liệu định kỳ vào cuối tháng.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default StockAdjustment;