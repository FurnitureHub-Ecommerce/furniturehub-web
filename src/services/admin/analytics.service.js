export const ANALYTICS_INTEGRATION_STATE = Object.freeze({
  code: "NOT_INTEGRATED",
  title: "Chưa tích hợp",
  message: "Chưa có nguồn dữ liệu Analytics từ Backend",
});

export function getAnalyticsAvailability() {
  // Trả về trạng thái tích hợp, không giả lập một response Analytics thành công.
  return ANALYTICS_INTEGRATION_STATE;
}
