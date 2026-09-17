import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      email: formData.email.trim(), // Xóa khoảng trắng thừa
      password: formData.password,
    };

    try {
      const response = await authAPI.login(payload);
      
      // Lưu token và thông tin user nhận từ API
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      navigate('/storage/dashboard');
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors && res.errors.length > 0) {
        // Lỗi validation (mảng errors)
        setError(res.errors[0].message);
      } else {
        // Lỗi nghiệp vụ (Invalid email/password hoặc Account inactive)
        setError(res?.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-banner">
        <div className="banner-brand">LUMORA</div>
        <div className="banner-quote">
          <h3>Kiến tạo không gian,<br />Nâng tầm sống hiện đại.</h3>
          <p>Hệ thống quản lý kho & phân phối nội thất cao cấp.</p>
        </div>
      </div>

      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Đăng Nhập</h2>
            <p>Chào mừng bạn trở lại, vui lòng nhập thông tin.</p>
          </div>

          {error && <div className="error-badge">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="customer@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Mật Khẩu</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </button>
          </form>

          <div className="auth-footer">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;