import { z } from "zod";

export const registerSchema = z.object({
  full_name: z.string().min(2, "Họ và tên tối thiểu 2 ký tự"),
  email: z
    .string()
    .regex(/^[A-Za-z0-9._%+-]+@gmail\.com$/i, "Email phải có định dạng @gmail.com"),
  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(/^[A-Z]/, "Chữ cái đầu tiên của mật khẩu phải viết hoa")
    .regex(/[A-Za-z]/, "Mật khẩu phải có chữ cái")
    .regex(/\d/, "Mật khẩu phải có chữ số"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
