import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Shield, BadgeCheck, Package } from "lucide-react";

const StorageProfile = () => {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "QUẢN LÝ KHO",
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const roleName = parsed.role === "STORAGE_MANAGER" || parsed.role === "STORAGE MANAGER" ? "QUẢN LÝ KHO" : (parsed.role || "STORAGE MANAGER");
        setProfile({
          fullName: parsed.fullName || parsed.name || "Chưa cập nhật",
          email: parsed.email || "Chưa cập nhật",
          phone: parsed.phone || "Chưa cập nhật",
          role: roleName,
        });
      }
    } catch (e) {
      console.error("Không thể đọc thông tin user từ storage:", e);
    }
  }, []);

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", fontFamily: "math" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: 0, fontFamily: "math" }}>Hồ Sơ Cá Nhân</h1>
        <p style={{ color: "#6B7280", fontSize: "14px", marginTop: "4px" }}>
          Thông tin chi tiết về tài khoản và phân quyền quản lý hệ thống kho hàng của bạn.
        </p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        
        {/* Avatar & Role Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid #F3F4F6" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "50%", background: "#1c1c1c", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 700,
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}>
            {profile.fullName && profile.fullName !== "Chưa cập nhật" ? profile.fullName.charAt(0).toUpperCase() : "S"}
          </div>
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: "0 0 6px 0", fontFamily: "math" }}>{profile.fullName}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, background: "#FEF3C7", color: "#92400E", padding: "3px 10px", borderRadius: "6px", textTransform: "uppercase" }}>
                {profile.role}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#059669", fontWeight: 600 }}>
                <BadgeCheck size={14} /> Hoạt động
              </span>
            </div>
          </div>
        </div>

        {/* Info List Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", background: "#F9FAFB", borderRadius: "10px", border: "1px solid #F3F4F6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "180px", color: "#6B7280", fontSize: "13px", fontWeight: 600 }}>
              <User size={18} /> Họ và tên:
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
              {profile.fullName}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", background: "#F9FAFB", borderRadius: "10px", border: "1px solid #F3F4F6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "180px", color: "#6B7280", fontSize: "13px", fontWeight: 600 }}>
              <Mail size={18} /> Địa chỉ Email:
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              {profile.email}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", background: "#F9FAFB", borderRadius: "10px", border: "1px solid #F3F4F6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "180px", color: "#6B7280", fontSize: "13px", fontWeight: 600 }}>
              <Phone size={18} /> Số điện thoại:
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              {profile.phone || "Chưa cập nhật"}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", background: "#F9FAFB", borderRadius: "10px", border: "1px solid #F3F4F6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "180px", color: "#6B7280", fontSize: "13px", fontWeight: 600 }}>
              <Shield size={18} /> Quyền hạn hệ thống:
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              Quản lý toàn bộ chuỗi cung ứng & vận hành kho hàng
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StorageProfile;