import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { ArrowLeft, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import bgImage from "../../assets/background.jpg"; 
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [notification, setNotification] = useState({ type: "", message: "" });
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
    setNotification({ type: "", message: "" });

    if (formData.password !== formData.confirmPassword) {
      setNotification({ type: "error", message: "Mật khẩu nhập lại không trùng khớp." });
      return;
    }

    if (formData.password.length < 6) {
      setNotification({ type: "error", message: "Mật khẩu phải từ 6 ký tự trở lên." });
      return;
    }

    setLoading(true);

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password,
    };

    if (formData.phone && formData.phone.trim() !== "") {
      payload.phone = formData.phone.trim();
    }

    try {
      // API đăng ký chỉ cấp tài khoản Customer theo đúng thiết kế hệ thống
      await authAPI.register(payload);
      
      setNotification({
        type: "success",
        message: "Đăng ký tài khoản Customer thành công! Đang chuyển hướng...",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const res = err.response?.data;
      let errorMsg = "Đăng ký thất bại. Vui lòng thử lại!";
      if (res?.errors && res.errors.length > 0) {
        errorMsg = res.errors[0].message;
      } else if (res?.message) {
        errorMsg = res.message;
      }
      setNotification({ type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="auth-wrapper"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="auth-main-card">
        <div className="auth-banner">
          <div className="banner-brand">LUMORA</div>
          <div className="banner-quote">
            <h3>
              Trải nghiệm giải pháp
              <br />
              quản lý kho thông minh.
            </h3>
            <p>Tạo tài khoản khách hàng để bắt đầu mua sắm và quản lý đơn hàng.</p>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-card register-card">
            <Link to="/" className="btn-back-home" title="Về trang chủ">
              <ArrowLeft size={20} />
            </Link>
            <div className="auth-header">
              <h2 style={{ fontFamily: "Bodoni Moda", fontSize: 'clamp(2rem, 2.5vw, 2.7rem)', color: '#1a1a1a', letterSpacing: '-0.02em', fontWeight: 600 }}>
                Đăng Ký Tài Khoản
              </h2>
              <p>Chỉ dành cho Khách hàng (Customer). Tài khoản quản trị/nhân viên do Admin cung cấp.</p>
            </div>

            {/* Thông báo trạng thái */}
            {notification.message && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  backgroundColor: notification.type === "success" ? "#f0fdf4" : "#fef2f2",
                  color: notification.type === "success" ? "#16a34a" : "#dc2626",
                  border: `1px solid ${notification.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                }}
              >
                {notification.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{notification.message}</span>
              </div>
            )}

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

              <div className="form-group">
                <label>Mật Khẩu</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-input"
                    placeholder="Tối thiểu 6 ký tự"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#666",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Nhập Lại Mật Khẩu</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{ paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#666",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Đang xử lý..." : "Đăng Ký Tài Khoản"}
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