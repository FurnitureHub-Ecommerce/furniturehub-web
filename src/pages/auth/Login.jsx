import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

import {
  authAPI,
  parseLoginResponse,
  getApiErrorMessage,
} from "../../services/api";

import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const payload = {
      email: formData.email.trim(),
      password: formData.password,
    };

    try {
      const response = await authAPI.login(payload);

      const { token, user } = parseLoginResponse(response.data);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Role trong response chưa được xác minh.
      // Tạm chuyển về route Storage đang tồn tại.
      navigate("/storage");
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Đăng nhập thất bại. Vui lòng thử lại!"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-main-card">
        <div className="auth-banner">
          <div className="banner-brand">LUMORA</div>

          <div className="banner-quote">
            <h3>
              Kiến tạo không gian,
              <br />
              Nâng tầm sống hiện đại.
            </h3>

            <p>Hệ thống quản lý kho & phân phối nội thất cao cấp.</p>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-card" style={{ position: "relative" }}>
            <Link to="/" className="btn-back-home" title="Về trang chủ">
              <ArrowLeft size={20} />
            </Link>

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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Mật Khẩu</label>

                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
                    }
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

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Đang xử lý..." : "Đăng Nhập"}
              </button>
            </form>

            <div className="auth-footer">
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
