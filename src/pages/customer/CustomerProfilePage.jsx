import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  MapPin,
  Mail,
  Phone,
  Shield,
  Calendar,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
} from "lucide-react";
import { getUserProfile, updateUserProfile, getApiErrorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AddressManagementPage from "./AddressManagementPage";
import "./CustomerProfile.css";

export default function CustomerProfilePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: authUser, updateUser } = useAuth();

  // Tab State: "profile" | "addresses"
  const initialTab = searchParams.get("tab") === "addresses" ? "addresses" : "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile Form States
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Status States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    let ignore = false;
    if (!token) {
      navigate("/login?redirect=/profile");
      return;
    }

    async function loadProfile() {
      try {
        const res = await getUserProfile();
        if (ignore) return;
        const userData = res.data?.user || res.data || {};
        setProfile(userData);
        setFullName(userData.fullName || userData.name || "");
        setPhone(userData.phone || "");
        setEmail(userData.email || "");

        if (updateUser) {
          updateUser(userData);
        }
      } catch (err) {
        if (ignore) return;
        if (authUser) {
          setProfile(authUser);
          setFullName(authUser.fullName || authUser.name || "");
          setPhone(authUser.phone || "");
          setEmail(authUser.email || "");
        } else {
          const msg = getApiErrorMessage(
            err,
            "Không thể tải thông tin hồ sơ. Vui lòng kiểm tra lại kết nối."
          );
          setErrorMessage(msg);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      ignore = true;
    };
  }, [token, authUser, updateUser, navigate]);

  // Handle Tab Switch
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "addresses" ? { tab: "addresses" } : {});
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Cancel edits
  const handleCancelEdit = () => {
    if (profile) {
      setFullName(profile.fullName || profile.name || "");
      setPhone(profile.phone || "");
    }
    setIsEditing(false);
    setErrorMessage(null);
  };

  // Submit profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage("Họ và tên cần có ít nhất 2 ký tự.");
      return;
    }

    if (trimmedPhone && (trimmedPhone.length < 9 || trimmedPhone.length > 15)) {
      setErrorMessage("Số điện thoại không hợp lệ (cần từ 9 đến 15 số).");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateUserProfile({
        fullName: trimmedName,
        phone: trimmedPhone,
      });

      const updatedData = res.data?.user || res.data || {
        ...profile,
        fullName: trimmedName,
        phone: trimmedPhone,
      };

      setProfile(updatedData);
      setFullName(updatedData.fullName || trimmedName);
      setPhone(updatedData.phone || trimmedPhone);

      if (updateUser) {
        updateUser(updatedData);
      }

      setIsEditing(false);
      setSuccessMessage("Hồ sơ cá nhân của quý khách đã được cập nhật thành công.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        "Không thể cập nhật hồ sơ vào lúc này. Vui lòng thử lại sau."
      );
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const initialLetter = (fullName || profile?.email || "L")[0].toUpperCase();
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
      })
    : "Khách hàng thân thiết";

  return (
    <div className="section container lumora-profile-page">
      {/* Page Header */}
      <div className="lumora-profile-header">
        <span className="lumora-profile-header__badge">
          <Sparkles size={13} className="inline mr-1 text-amber-700" />
          TÀI KHOẢN KHÁCH HÀNG LUMORA
        </span>
        <h1 className="lumora-profile-header__title">Tài Khoản & Hồ Sơ</h1>
        <p className="lumora-profile-header__subtitle">
          Quản lý thông tin định danh và sổ địa chỉ giao hàng White-Glove cao cấp
          dành riêng cho không gian sống của bạn.
        </p>
      </div>

      {/* Modern Luxury Tabs Navigation */}
      <div className="lumora-profile-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "profile"}
          className={`lumora-profile-tab ${
            activeTab === "profile" ? "lumora-profile-tab--active" : ""
          }`}
          onClick={() => handleTabChange("profile")}
        >
          <User size={17} />
          <span>Hồ Sơ Cá Nhân</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "addresses"}
          className={`lumora-profile-tab ${
            activeTab === "addresses" ? "lumora-profile-tab--active" : ""
          }`}
          onClick={() => handleTabChange("addresses")}
        >
          <MapPin size={17} />
          <span>Sổ Địa Chỉ Giao Hàng</span>
        </button>
      </div>

      {/* Tab 1: Hồ Sơ Cá Nhân */}
      {activeTab === "profile" && (
        <div className="lumora-profile-content">
          <div className="lumora-profile-card">
            {/* User Hero Banner */}
            <div className="lumora-profile-hero">
              <div className="lumora-profile-avatar-wrap">
                <div className="lumora-profile-avatar">
                  <span>{initialLetter}</span>
                </div>
              </div>

              <div className="lumora-profile-hero-info">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="lumora-profile-hero-name">
                    {fullName || "Quý Khách Hàng"}
                  </h2>
                  <span className="lumora-profile-role-badge">
                    <Shield size={12} />
                    {profile?.role === "ADMIN" ? "Quản Trị Viên" : "Khách Hàng LUMORA"}
                  </span>
                </div>
                <div className="lumora-profile-hero-meta">
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} /> {email || "Chưa cập nhật email"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} /> Thành viên từ: {memberSince}
                  </span>
                </div>
              </div>

              <div className="lumora-profile-hero-action">
                {!isEditing && (
                  <button
                    type="button"
                    className="lumora-profile-btn-edit"
                    onClick={() => setIsEditing(true)}
                  >
                    Chỉnh sửa hồ sơ
                  </button>
                )}
              </div>
            </div>

            {/* Notification Alerts */}
            {successMessage && (
              <div className="lumora-profile-alert lumora-profile-alert--success">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="lumora-profile-alert lumora-profile-alert--error">
                <AlertCircle size={18} className="shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Profile Form */}
            {isLoading ? (
              <div className="lumora-profile-loading">
                <div className="lumora-profile-spinner" />
                <span>Đang tải thông tin hồ sơ...</span>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="lumora-profile-form">
                <div className="lumora-profile-form-grid">
                  {/* Field: Full Name */}
                  <div className="lumora-profile-form-group">
                    <label
                      htmlFor="profile-fullName"
                      className="lumora-profile-form-label"
                    >
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="lumora-profile-input-wrap">
                      <div className="lumora-profile-input-icon">
                        <User size={18} />
                      </div>
                      <input
                        id="profile-fullName"
                        type="text"
                        disabled={!isEditing || isSaving}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nhập họ và tên đầy đủ"
                        className="lumora-profile-input"
                        required
                      />
                    </div>
                    <span className="lumora-profile-input-hint">
                      Tên hiển thị trên hóa đơn và dịch vụ bàn giao White-Glove
                    </span>
                  </div>

                  {/* Field: Phone */}
                  <div className="lumora-profile-form-group">
                    <label
                      htmlFor="profile-phone"
                      className="lumora-profile-form-label"
                    >
                      Số điện thoại liên hệ
                    </label>
                    <div className="lumora-profile-input-wrap">
                      <div className="lumora-profile-input-icon">
                        <Phone size={18} />
                      </div>
                      <input
                        id="profile-phone"
                        type="tel"
                        disabled={!isEditing || isSaving}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ví dụ: 0912345678"
                        className="lumora-profile-input"
                      />
                    </div>
                    <span className="lumora-profile-input-hint">
                      Dùng để nhân viên vận chuyển liên hệ trước khi bàn giao
                    </span>
                  </div>

                  {/* Field: Email (Read Only per backend contract) */}
                  <div className="lumora-profile-form-group lumora-profile-form-group--full">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="profile-email"
                        className="lumora-profile-form-label"
                      >
                        Địa chỉ Email đăng nhập
                      </label>
                      <span className="lumora-profile-readonly-tag">
                        <Lock size={11} /> Cố định theo tài khoản
                      </span>
                    </div>
                    <div className="lumora-profile-input-wrap">
                      <div className="lumora-profile-input-icon">
                        <Mail size={18} />
                      </div>
                      <input
                        id="profile-email"
                        type="email"
                        disabled
                        value={email}
                        className="lumora-profile-input lumora-profile-input--readonly"
                      />
                    </div>
                    <span className="lumora-profile-input-hint">
                      Email được dùng làm định danh đăng nhập an toàn, không thể thay đổi
                    </span>
                  </div>
                </div>

                {/* Form Actions (Only in Edit mode) */}
                {isEditing && (
                  <div className="lumora-profile-form-actions">
                    <button
                      type="button"
                      className="lumora-profile-btn-cancel"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      <RotateCcw size={15} /> Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="lumora-profile-btn-save"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <div className="lumora-profile-spinner lumora-profile-spinner--sm" />
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        <>
                          <Save size={15} />
                          <span>Lưu Thay Đổi</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Sổ Địa Chỉ (Nhúng AddressManagementPage đã chuẩn hóa) */}
      {activeTab === "addresses" && (
        <div className="lumora-profile-content">
          <div className="lumora-profile-card lumora-profile-card--addresses">
            <AddressManagementPage embedded={true} />
          </div>
        </div>
      )}
    </div>
  );
}
