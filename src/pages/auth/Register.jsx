import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, getApiErrorMessage } from '../../services/api';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không trùng khớp.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải từ 6 ký tự trở lên.');
      return;
    }

    setLoading(true);

    // Chuẩn bị payload chuẩn theo spec BE
    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password,
    };

    if (formData.phone && formData.phone.trim() !== '') {
      payload.phone = formData.phone.trim();
    }

    try {
      await authAPI.register(payload);
      navigate('/login');
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors && res.errors.length > 0) {
        const firstErr = res.errors[0];
        const fieldName = firstErr.path?.[0] ? `[${firstErr.path[0]}] ` : '';
        setError(`${fieldName}${firstErr.message}`);
      } else if (res?.message) {
        setError(res.message);
      } else {
        setError(getApiErrorMessage(err, 'Đăng ký thất bại. Vui lòng thử lại!'));
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
          <h3>Trải nghiệm giải pháp<br />quản lý kho thông minh.</h3>
          <p>Tạo tài khoản để bắt đầu quản lý danh mục nội thất của bạn.</p>
        </div>
      </div>

      <div className="auth-form-container">
        <div className="auth-card register-card">
          <div className="auth-header">
            <h2>Tạo Tài Khoản</h2>
            <p>Điền thông tin bên dưới để đăng ký thành viên.</p>
          </div>

          {error && <div className="error-badge">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Họ và Tên</label>
              <input
                type="text"
                name="fullName"
                className="form-input"
                placeholder="Đặng Hoàng Trúc Vy"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="danghoangtrucvy090105@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Số Điện Thoại (Tùy chọn)</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="0923098049"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Mật Khẩu</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Tối thiểu 6 ký tự"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Nhập Lại Mật Khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng Ký'}
            </button>
          </form>

          <div className="auth-footer">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
