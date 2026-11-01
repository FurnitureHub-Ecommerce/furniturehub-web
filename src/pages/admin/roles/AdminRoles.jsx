import { useEffect, useState } from "react";
import {
  Users,
  ShieldCheck,
  RotateCcw,
  Save,
  KeyRound,
  Network,
  History,
  RefreshCw,
  CircleAlert,
} from "lucide-react";
import { getRoles } from "../../../services/admin/roles.service.js";
import "./AdminRoles.css";

const permissionColumns = [
  ["Xem", "READ"],
  ["Tạo", "CREATE"],
  ["Sửa", "UPDATE"],
  ["Xóa", "DELETE"],
];
const percent = (value) =>
  value === null
    ? "Chưa có dữ liệu"
    : `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value)}%`;

function Unavailable({ children, reason, primary = false }) {
  return (
    <span className="lr-unavailable" tabIndex={0} aria-label={reason}>
      <button type="button" disabled className={primary ? "lr-primary" : ""}>
        {children}
      </button>
      <span className="lr-reason" role="tooltip">
        {reason}
      </span>
    </span>
  );
}

export default function AdminRoles() {
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  const [selected, setSelected] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    getRoles()
      .then((data) => {
        if (!cancelled) {
          setState({ loading: false, data, error: "" });
          setSelected((current) =>
            data.roles.some((role) => role.id === current)
              ? current
              : (data.roles[0]?.id ?? ""),
          );
        }
      })
      .catch((error) => {
        if (!cancelled)
          setState({
            loading: false,
            data: null,
            error:
              error.message ||
              "Không thể tải dữ liệu vai trò. Vui lòng thử lại.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [revision]);
  const data = state.data;
  const role = data?.roles.find((item) => item.id === selected) ?? null;
  const emptyUsers = data && data.loadedUsers === 0;
  return (
    <div className="lr-page">
      <div className="lr-hero">
        <p className="lr-eyebrow">
          <ShieldCheck size={14} aria-hidden="true" />
          BẢO MẬT & QUẢN TRỊ TRUY CẬP / MA TRẬN PHÂN QUYỀN & VAI TRÒ
        </p>
        <div className="lr-intro">
          <div>
            <h1>Ma Trận Phân Quyền & Quản Lý Vai Trò</h1>
            <p>
              Cấu trúc trình bày RBAC cho các vai trò ứng dụng LUMORA.
              <br />
              Chỉ xem thông tin; chưa tích hợp dữ liệu phân quyền từ Backend.
            </p>
          </div>
          <div className="lr-actions">
            <Unavailable reason="Chưa có chính sách quyền mặc định; màn hình chỉ đọc.">
              <RotateCcw size={15} aria-hidden="true" />
              Đặt Lại Mặc Định
            </Unavailable>
            <Unavailable
              primary
              reason="Chưa tích hợp lưu cấu hình phân quyền; màn hình chỉ đọc."
            >
              <Save size={15} aria-hidden="true" />
              Lưu Cấu Hình Phân Quyền
            </Unavailable>
          </div>
        </div>
      </div>
      <p className="lr-demo">
        <strong>Nguồn dữ liệu: API người dùng</strong> · Số tài khoản chỉ tính
        trong danh sách đã tải. Permission Matrix chưa có contract Backend.
      </p>
      {state.loading ? (
        <div className="lr-state" role="status">
          <RefreshCw className="lr-spin" size={24} aria-hidden="true" />
          <h2>Đang tải vai trò</h2>
          <p>Đang tổng hợp vai trò và số tài khoản từ Backend.</p>
        </div>
      ) : state.error ? (
        <div className="lr-state lr-state-error" role="alert">
          <CircleAlert size={25} aria-hidden="true" />
          <h2>Không thể tải vai trò</h2>
          <p>{state.error}</p>
          <button
            onClick={() => {
              setState({ loading: true, data: null, error: "" });
              setRevision((value) => value + 1);
            }}
          >
            Thử lại
          </button>
        </div>
      ) : emptyUsers ? (
        <div className="lr-state" role="status">
          <Users size={25} aria-hidden="true" />
          <h2>Chưa có tài khoản trong danh sách đã tải</h2>
          <p>
            Không có dữ liệu vai trò để tổng hợp. Permission Matrix vẫn chưa
            tích hợp.
          </p>
        </div>
      ) : !role ? (
        <div className="lr-state" role="status">
          <ShieldCheck size={25} aria-hidden="true" />
          <h2>Chưa có dữ liệu vai trò</h2>
          <p>Không có vai trò phù hợp để hiển thị.</p>
        </div>
      ) : (
        <>
          <div className="lr-kpis">
            <article>
              <span>
                VAI TRÒ TRONG DANH SÁCH <small>APPLICATION</small>
              </span>
              <strong>
                {data.roles.length}
                <em> vai trò</em>
              </strong>
              <p>Nhãn ứng dụng, không phải Role Entity từ Backend</p>
            </article>
            <article>
              <span>
                THỰC THỂ MODULE 
              </span>
              <strong className="lr-pending-value">Chưa có dữ liệu</strong>
              <p>Permission Matrix chưa tích hợp</p>
            </article>
            <article>
              <span>CHÍNH SÁCH KIỂM SOÁT</span>
              <strong className="lr-pending-value">Chưa tích hợp</strong>
              <p>SoD và chính sách quyền chưa được xác nhận</p>
            </article>
            <article>
              <span>PHIÊN LÀM VIỆC</span>
              <strong className="lr-pending-value">Chưa tích hợp</strong>
              <p>{data.loadedUsers} tài khoản trong danh sách đã tải</p>
              <small>Không có dữ liệu phiên online</small>
            </article>
          </div>
          <div className="lr-content-grid">
            <aside
              className="lr-role-column"
              aria-label="Vai trò và phân bố tài khoản"
            >
              <section className="lr-card lr-role-directory">
                <div className="lr-section-kicker">HỆ THỐNG VAI TRÒ</div>
                <h2 className="lr-small-heading">
                  <Users size={19} aria-hidden="true" />
                  Danh Sách Vai Trò <span>{data.roles.length}</span>
                </h2>
                <div className="lr-role-list">
                  {data.roles.map((item, index) => (
                    <button
                      style={{ "--role-index": Math.min(index, 7) }}
                      key={item.id}
                      className={`lr-role ${role.id === item.id ? "lr-role-selected" : ""}`}
                      aria-pressed={role.id === item.id}
                      onClick={() => setSelected(item.id)}
                    >
                      <span className="lr-role-title">
                        <strong>
                          {item.name}
                          <br />({item.id})
                        </strong>
                        <b>
                          {item.count}
                          <small> tài khoản</small>
                        </b>
                      </span>
                      <span className="lr-role-description">
                        {item.description}
                      </span>
                      <small className="lr-role-caption">
                        {item.caption} · NHÃN ỨNG DỤNG
                      </small>
                    </button>
                  ))}
                </div>
              </section>
              <section className="lr-policy">
                <h3>
                  <ShieldCheck size={18} />
                  NGUYÊN TẮC ĐẶC QUYỀN TỐI THIỂU (PoLP)
                </h3>
                <p>
                  Chưa xác nhận chính sách. Nội dung mô tả vai trò không thay
                  thế quyết định cấp quyền.
                </p>
                <p>
                  Chứng nhận ISO/NIST và Audit Log bất biến:{" "}
                  <strong>Chưa tích hợp</strong>.
                </p>
                <p>
                  Chu kỳ tái chứng nhận: <strong>Chưa tích hợp</strong>.
                </p>
              </section>
              <section className="lr-card">
                <h3>TỔNG HỢP VAI TRÒ ĐÃ TẢI</h3>
                <p className="lr-muted">
                  Tính trên {data.loadedUsers} tài khoản trong response API hiện
                  tại; không coi là tổng toàn hệ thống.
                </p>
                {data.roles.map((item) => (
                  <div className="lr-distribution" key={item.id}>
                    <div>
                      <span>{item.id}</span>
                      <strong>{percent(item.percentage)}</strong>
                    </div>
                    <div className="lr-track" aria-hidden="true">
                      <span style={{ width: `${item.percentage ?? 0}%` }} />
                    </div>
                  </div>
                ))}
              </section>
            </aside>
            <div className="lr-matrix-column">
              <section className="lr-selection lr-card" aria-live="polite">
                <div className="lr-role-icon">
                  <ShieldCheck size={25} aria-hidden="true" />
                </div>
                <div>
                  <span className="lr-section-kicker">VAI TRÒ ĐANG CHỌN</span>
                  <h2>
                    {role.name} ({role.id})
                  </h2>
                </div>
                <div className="lr-actions">
                  <Unavailable reason="Chưa có dữ liệu quyền từ Backend; không thể chọn quyền.">
                    Chọn Hợp Lệ
                  </Unavailable>
                  <Unavailable reason="Chưa có dữ liệu quyền từ Backend; không thể thu hồi quyền.">
                    Hủy Tất Cả
                  </Unavailable>
                </div>
              </section>
              <section
                className="lr-matrix-box"
                aria-label={`Ma trận quyền của ${role.id}`}
              >
                <header className="lr-matrix-heading">
                  <div>
                    <span>PERMISSION MATRIX</span>
                    <strong>Phạm vi quyền nghiệp vụ</strong>
                  </div>
                </header>
                <div
                  className="lr-table-scroll"
                  tabIndex={0}
                  aria-label="Bảng quyền chỉ đọc, cuộn ngang để xem đủ cột"
                >
                  <table>
                    <caption>
                      Permission Matrix của {role.id}: chưa có dữ liệu phân
                      quyền từ Backend.
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">
                          PHÂN HỆ NGHIỆP VỤ
                          <br />
                          (MODULE)
                        </th>
                        {permissionColumns.map(([name, code]) => (
                          <th scope="col" key={code}>
                            {name}
                            <br />({code})
                          </th>
                        ))}
                        <th scope="col">GHI CHÚ GIỚI HẠN THẨM QUYỀN</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          colSpan={permissionColumns.length + 2}
                          className="lr-module-note"
                        >
                          Chưa có dữ liệu phân quyền từ Backend
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <footer className="lr-governance">
                  <ShieldCheck size={23} />
                  <p>
                    Quy trình cấp và thu hồi quyền:{" "}
                    <strong>Chưa tích hợp</strong>. Trang này không cấp quyền,
                    không thu hồi quyền và không thay đổi tài khoản.
                  </p>
                  <Unavailable reason="Audit Log chưa tích hợp; chưa có dữ liệu lịch sử thay đổi.">
                    <History size={15} />
                    Xem Lịch Sử Thay Đổi
                  </Unavailable>
                </footer>
              </section>
              <div className="lr-security-grid">
                <section className="lr-card">
                  <h2>
                    <Network size={21} />
                    Cơ Chế Phân Tách Trách Nhiệm (SoD)
                  </h2>
                  <p>Chưa có chính sách phân tách trách nhiệm từ Backend.</p>
                  <span className="lr-status">Chưa tích hợp</span>
                  <p className="lr-muted">
                    Không suy diễn chính sách từ tên vai trò.
                  </p>
                </section>
                <section className="lr-card">
                  <h2>
                    <KeyRound size={21} />
                    Xác Thực Hai Yếu Tố
                  </h2>
                  <p>
                    Chưa có nguồn dữ liệu 2FA hoặc FIDO2/WebAuthn theo vai trò.
                  </p>
                  <span className="lr-status">Chưa tích hợp</span>
                  <p className="lr-muted">
                    Không xác nhận tài khoản đã được bảo vệ.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
