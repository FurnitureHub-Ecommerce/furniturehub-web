import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        setError('Đăng ký thất bại. Vui lòng kiểm tra lại kết quả ở Console!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Khung card lớn chứa cả 2 bên (ảnh banner và form) */}
      <div className="auth-main-card">
        
        {/* Banner bên trái (Ảnh nội thất sáng sủa, sang trọng) */}
        <div className="auth-banner">
          <div className="banner-brand">LUMORA</div>
          <div className="banner-quote">
            <h3>Trải nghiệm giải pháp<br />quản lý kho thông minh.</h3>
            <p>Tạo tài khoản để bắt đầu quản lý danh mục nội thất của bạn.</p>
          </div>
        </div>

        {/* Khung form bên phải */}
        <div className="auth-form-container">
          <div className="auth-card register-card">
             {/* Nút Back về trang chủ dạng mũi tên ở góc trên */}
            <Link to="/" className="btn-back-home" title="Về trang chủ">
              <ArrowLeft size={20} />
            </Link>
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
                  placeholder="Nguyễn Văn A"
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
                  placeholder="customer@example.com"
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
                  placeholder="09xxxxxxxx"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Ô Mật Khẩu */}
              <div className="form-group">
                <label>Mật Khẩu</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-input"
                    placeholder="Tối thiểu 6 ký tự"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Ô Nhập Lại Mật Khẩu */}
              <div className="form-group">
                <label>Nhập Lại Mật Khẩu</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
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
    </div>
  );
};

export default Register;