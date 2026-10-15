// ชื่อ cookie ที่เก็บ JWT (httpOnly -> JavaScript ฝั่ง browser อ่านไม่ได้ ปลอดภัยกว่า localStorage)
export const TOKEN_COOKIE = "token";
// อายุ cookie = 1 ชั่วโมง ให้ตรงกับ expiresIn: '1h' ของ auth-service
export const TOKEN_MAX_AGE = 60 * 60;
