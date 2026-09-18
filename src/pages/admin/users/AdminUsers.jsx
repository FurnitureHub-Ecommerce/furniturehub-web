import { useEffect, useRef, useState } from "react";
import {
  Search,
  ShieldCheck,
  UserPlus,
  FileText,
  SlidersHorizontal,
  Users,
  KeyRound,
  LockKeyhole,
  Gavel,
} from "lucide-react";
import { getUsers } from "../../../services/admin/users.service.js";
import "./AdminUsers.css";

function PendingButton({ children, reason, dark = false }) {
  return (
    <span className="lu-pending" tabIndex={0} aria-label={reason}>
      <button
        type="button"
        disabled
        className={`lu-button ${dark ? "lu-button-dark" : ""}`}
      >
        {children}
      </button>
      <span className="lu-pending-tip" role="tooltip">
        {reason}
      </span>
    </span>
  );
}

function UnknownPermission({ label }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = true;
  }, []);
  return (
    <input
      ref={ref}
      type="checkbox"
      disabled
      aria-label={`${label}: chưa có dữ liệu quyền, chỉ xem`}
    />
  );
}

function UserAvatar({ name }) {
  return (
    <span className="lu-avatar" aria-hidden="true">
      {name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")}
    </span>
  );
}

function AccessPanel({ user, data }) {
  const role = data.roles.find((item) => item.value === user?.role);
  return (
    <aside
      className="lu-details"
      aria-label="Thông tin và quyền của người dùng"
    >
      <section className="lu-card lu-access">
        <header>
          <SlidersHorizontal size={20} />
          <div>
            <h2>Chi Tiết Quyền Hạn RBAC</h2>
            <p>{user ? `ÁP DỤNG: ${role.label}` : "CHƯA CHỌN NGƯỜI DÙNG"}</p>
          </div>
          <span className="lu-small-tag">Chỉ xem</span>
        </header>
        {user ? (
          <>
            <div className="lu-selected-user">
              <UserAvatar name={user.name} />
              <div>
                <h3>{user.name}</h3>
                <p>
                  {role.label} • {user.hub}
                </p>
                <small>{user.displayCode}</small>
              </div>
            </div>
            <div className="lu-matrix-title">
              <h3>MA TRẬN THẨM QUYỀN THEO MODULE</h3>
              <span>Chưa tích hợp</span>
            </div>
            <p className="lu-access-note">
              Chưa có nguồn quyền thực tế. Ô gạch ngang là chưa xác định, không
              phải quyền được cấp hoặc bị từ chối.
            </p>
            <div
              className="lu-matrix-scroll"
              tabIndex={0}
              aria-label="Ma trận quyền chỉ đọc"
            >
              <table className="lu-matrix">
                <thead>
                  <tr>
                    <th scope="col">
                      Phân Hệ
                      <br />
                      (Module)
                    </th>
                    {data.access.actions.map((action) => (
                      <th scope="col" key={action}>
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.access.modules.map((module) => (
                    <tr key={module.name}>
                      <th scope="row">{module.name}</th>
                      {module.permissions.map((_, index) => (
                        <td key={data.access.actions[index]}>
                          <UnknownPermission
                            label={`${module.name}, ${data.access.actions[index]}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="lu-policy-title">CHÍNH SÁCH PHIÊN LÀM VIỆC</h3>
            <dl className="lu-policies">
              {data.access.policies.map((policy) => (
                <div key={policy}>
                  <dt>{policy}</dt>
                  <dd>Chưa tích hợp</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="lu-empty-panel">
            Chọn một người dùng trong danh sách để xem thông tin. Không có người
            dùng phù hợp thì panel không hiển thị quyền.
          </p>
        )}
        <div className="lu-panel-actions">
          <PendingButton dark reason="Panel chỉ xem; chưa triển khai lưu quyền">
            Lưu Phân Bổ RBAC
          </PendingButton>
          <PendingButton reason="Không có bản nháp quyền để đặt lại">
            Đặt lại
          </PendingButton>
        </div>
      </section>
      <section className="lu-card lu-hierarchy">
        <div>
          <h2>Cấu Trúc Vai Trò</h2>
          <span>{data.roles.length} nhóm</span>
        </div>
        <p className="lu-access-note">
          Số lượng từ mock; nhãn trình diễn không thay đổi role nghiệp vụ.
        </p>
        {data.roles.map((item) => (
          <div className="lu-role-count" key={item.value}>
            <span>
              <i
                className={`lu-dot lu-role-${item.value.replaceAll(" ", "-").toLowerCase()}`}
              />
              {item.label}
              <small>{item.description}</small>
            </span>
            <b>{item.count} Users</b>
          </div>
        ))}
      </section>
    </aside>
  );
}

export default function AdminUsers() {
  const [query, setQuery] = useState({
    search: "",
    tab: "",
    role: "",
    status: "",
    hub: "",
    page: 1,
  });
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [retry, setRetry] = useState(0);
  const listRef = useRef(null);
  const scrollAfterPageChange = useRef(false);
  useEffect(() => {
    let cancelled = false;
    getUsers(query)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: "" });
      })
      .catch((error) => {
        if (!cancelled)
          setState({ data: null, loading: false, error: error.message });
      });
    return () => {
      cancelled = true;
    };
  }, [query, retry]);
  function updateFilters(values) {
    setState((previous) => ({ ...previous, loading: true, error: "" }));
    setQuery((previous) => ({ ...previous, ...values, page: 1 }));
    setSelectedId(null);
  }
  // Chỉ cuộn lên đầu danh sách sau khi dữ liệu của trang mới tải xong.
  useEffect(() => {
    if (state.loading || !state.data || !scrollAfterPageChange.current) return;

    scrollAfterPageChange.current = false;
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [state.loading, state.data]);

  function changePage(page) {
    if (page === query.page) return;
    scrollAfterPageChange.current = true;
    setState((previous) => ({ ...previous, loading: true, error: "" }));
    setQuery((previous) => ({ ...previous, page }));
    setSelectedId(null);
  }
  const data = state.data;
  // Chỉ chọn trong trang hiện tại để panel không giữ người dùng đã bị bộ lọc loại bỏ.
  const selected =
    !state.loading && data
      ? data.rows.find((user) => user.id === selectedId) || data.rows[0]
      : null;
  return (
    <div className="lu-page">
      <p className="lu-eyebrow lu-context">
        <ShieldCheck size={14} /> BẢO MẬT & QUẢN TRỊ TRUY CẬP{" "}
        <span>• DỮ LIỆU NGƯỜI DÙNG DEMO</span>
      </p>
      <section className="lu-heading">
        <div>
          <h1>Quản Lý Người Dùng & Phân Quyền Vai Trò</h1>
          <p>
            Quản lý danh sách người dùng và xem thông tin phân quyền trong không
            gian LUMORA Atelier.
          </p>
        </div>
        <div className="lu-heading-actions">
          <PendingButton reason="Chính sách xác thực chưa được tích hợp">
            <ShieldCheck size={16} /> Chính sách 2FA
          </PendingButton>
          <PendingButton reason="Chưa có nguồn Audit Log để xuất">
            <FileText size={16} /> Xuất Audit Log
          </PendingButton>
          <PendingButton
            dark
            reason="Chưa có thiết kế form và quy trình tạo tài khoản được duyệt"
          >
            <UserPlus size={16} /> Tạo tài khoản người dùng mới
          </PendingButton>
        </div>
      </section>
      <section className="lu-kpis" aria-label="Trạng thái tích hợp bảo mật">
        {[
          ["ACTIVE SESSIONS", "Chưa có nguồn dữ liệu phiên đăng nhập.", Users],
          [
            "2FA ENFORCEMENT",
            "Chưa kết nối trạng thái FIDO2 hoặc Authenticator.",
            ShieldCheck,
          ],
          [
            "ROLE GUARD INCIDENTS",
            "Chưa có dữ liệu giám sát vi phạm quyền.",
            LockKeyhole,
          ],
          [
            "YÊU CẦU NÂNG QUYỀN",
            "Chưa tích hợp yêu cầu và quy trình thẩm định.",
            KeyRound,
          ],
        ].map(([title, description, Icon]) => (
          <article className="lu-card lu-kpi" key={title}>
            <div>
              <h2>{title}</h2>
              <Icon size={18} />
            </div>
            <strong>Chưa tích hợp</strong>
            <p>{description}</p>
          </article>
        ))}
      </section>
      {state.error ? (
        <div className="lu-state" role="alert">
          <h2>Không thể tải người dùng</h2>
          <p>{state.error}</p>
          <button
            className="lu-button"
            onClick={() => {
              setState({ data: null, loading: true, error: "" });
              setRetry((value) => value + 1);
            }}
          >
            Thử lại
          </button>
        </div>
      ) : !data ? (
        <div className="lu-state" role="status">
          Đang tải người dùng demo…
          <div className="lu-skeleton" />
        </div>
      ) : (
        <>
          <div className="lu-tab-row">
            <div className="lu-tabs" role="group" aria-label="Nhóm người dùng">
              <button
                aria-pressed={!query.tab}
                className={!query.tab ? "lu-tab-active" : ""}
                onClick={() => updateFilters({ tab: "" })}
              >
                Tất cả người dùng <span>({data.totalUsers})</span>
              </button>
              {data.roles.map((role) => (
                <button
                  key={role.value}
                  aria-pressed={query.tab === role.value}
                  className={query.tab === role.value ? "lu-tab-active" : ""}
                  onClick={() => updateFilters({ tab: role.value })}
                >
                  {role.label} <span>({role.count})</span>
                </button>
              ))}
            </div>
            <span className="lu-sync">
              LDAP / Okta
              <br />
              Chưa tích hợp
            </span>
          </div>
          <section className="lu-filters" aria-label="Lọc người dùng">
            <label className="lu-search">
              <Search size={18} />
              <span className="sr-only">
                Tìm theo tên, email, mã người dùng hoặc role
              </span>
              <input
                value={query.search}
                onChange={(event) =>
                  updateFilters({ search: event.target.value })
                }
                placeholder="Tìm theo tên, email, mã người dùng hoặc role…"
              />
            </label>
            <div className="lu-selects">
              <label>
                VAI TRÒ:
                <select
                  value={query.role}
                  onChange={(event) =>
                    updateFilters({ role: event.target.value })
                  }
                >
                  <option value="">Tất cả vai trò</option>
                  {data.roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                TRẠNG THÁI:
                <select
                  value={query.status}
                  onChange={(event) =>
                    updateFilters({ status: event.target.value })
                  }
                >
                  <option value="">Tất cả trạng thái</option>
                  {data.statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                HUB / ATELIER:
                <select
                  value={query.hub}
                  onChange={(event) =>
                    updateFilters({ hub: event.target.value })
                  }
                >
                  <option value="">Tất cả Hubs</option>
                  {data.hubs.map((hub) => (
                    <option key={hub} value={hub}>
                      {hub}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>
          <div className="lu-body" aria-busy={state.loading}>
            <div className="lu-list-column">
              <section
                ref={listRef}
                className="lu-card lu-user-list"
                style={{ scrollMarginTop: "90px" }}
              >
                {state.loading ? (
                  <div className="lu-state" role="status">
                    Đang tải kết quả…
                    <div className="lu-skeleton" />
                  </div>
                ) : data.rows.length ? (
                  <div
                    className="lu-table-scroll"
                    tabIndex={0}
                    aria-label="Bảng người dùng, cuộn ngang khi cần"
                  >
                    <table className="lu-table">
                      <thead>
                        <tr>
                          <th scope="col">NGƯỜI DÙNG & DANH TÍNH</th>
                          <th scope="col">VAI TRÒ PHÂN QUYỀN</th>
                          <th scope="col">PHẠM VI / HUB ATELIER</th>
                          <th scope="col">XÁC THỰC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.rows.map((user) => {
                          const role = data.roles.find(
                            (item) => item.value === user.role,
                          );
                          return (
                            <tr
                              key={user.id}
                              className={
                                selected?.id === user.id
                                  ? "lu-user-selected"
                                  : ""
                              }
                              onClick={() => setSelectedId(user.id)}
                            >
                              <td>
                                <div className="lu-user-identity">
                                  <UserAvatar name={user.name} />
                                  <div>
                                    <button
                                      className="lu-user-name"
                                      aria-pressed={selected?.id === user.id}
                                      aria-label={`Xem thông tin ${user.name}`}
                                      onClick={() => setSelectedId(user.id)}
                                    >
                                      {user.name}
                                    </button>
                                    <div className="lu-user-meta">
                                      <span>{user.displayCode}</span>
                                      <span>{user.email}</span>
                                    </div>
                                    <small
                                      className={`lu-status lu-status-${user.status}`}
                                    >
                                      {
                                        data.statuses.find(
                                          (item) => item.value === user.status,
                                        ).label
                                      }
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span
                                  className={`lu-role-badge lu-role-${user.role.replaceAll(" ", "-").toLowerCase()}`}
                                >
                                  {role.label}
                                </span>
                              </td>
                              <td>
                                {user.hub}
                                <small className="lu-cell-note">
                                  Phạm vi trình diễn
                                </small>
                              </td>
                              <td>
                                <span className="lu-auth">
                                  <KeyRound size={14} />
                                  Chưa tích hợp
                                </span>
                                <small className="lu-cell-note">
                                  Chưa có dữ liệu xác thực
                                </small>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="lu-state" role="status">
                    <Users size={30} />
                    <h2>Không có người dùng phù hợp</h2>
                    <p>Thử đổi từ khóa, tab hoặc điều kiện lọc.</p>
                    <button
                      className="lu-button"
                      onClick={() =>
                        updateFilters({
                          search: "",
                          tab: "",
                          role: "",
                          status: "",
                          hub: "",
                        })
                      }
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                )}
                <div className="lu-pagination">
                  <span aria-live="polite">
                    {state.loading
                      ? "Đang tải…"
                      : `Hiển thị ${data.total ? (data.page - 1) * data.pageSize + 1 : 0} - ${Math.min(data.page * data.pageSize, data.total)} trong ${data.total} người dùng`}
                  </span>
                  <nav aria-label="Phân trang người dùng">
                    <span>
                      Trang {data.page}/{data.totalPages}
                    </span>
                    <button
                      disabled={state.loading || data.page <= 1}
                      onClick={() => changePage(data.page - 1)}
                    >
                      Trước
                    </button>
                    {Array.from(
                      { length: data.totalPages },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <button
                        key={page}
                        disabled={state.loading}
                        aria-current={page === data.page ? "page" : undefined}
                        className={page === data.page ? "lu-current-page" : ""}
                        onClick={() => changePage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      disabled={state.loading || data.page >= data.totalPages}
                      onClick={() => changePage(data.page + 1)}
                    >
                      Sau
                    </button>
                  </nav>
                </div>
              </section>
              <section className="lu-compliance">
                <Gavel size={25} />
                <div>
                  <h2>
                    Chính Sách Kiểm Soát Thẩm Quyền Nguyên Tắc Phân Quyền Tối
                    Thiểu (PoLP)
                  </h2>
                  <p>
                    Chưa tích hợp tài liệu tuân thủ hoặc cơ chế ghi Audit Log.
                  </p>
                </div>
                <PendingButton reason="Chưa có tài liệu tuân thủ được cung cấp">
                  Xem Tài Liệu Tuân Thủ
                </PendingButton>
              </section>
            </div>
            <AccessPanel user={selected} data={data} />
          </div>
        </>
      )}
    </div>
  );
}
