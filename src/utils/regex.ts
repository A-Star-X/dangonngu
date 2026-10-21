// @spec AU-03
/** Email dạng đơn giản: phần trước @, tên miền có dấu chấm, không có khoảng trắng. */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
