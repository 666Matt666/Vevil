import { z } from 'zod';

// ============================================
// ESQUEMAS DE VALIDACIÓN CON ZOD
// ============================================

// ============================================
// AUTENTICACIÓN
// ============================================

/**
 * Schema para login
 * - Email: formato válido, requerido
 * - Password: mínimo 6 caracteres
 */
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Ingresá un email válido'),
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

/**
 * Schema para registro
 * - Name: mínimo 2 caracteres
 * - Email: formato válido
 * - Password: mínimo 8 caracteres, al menos una mayúscula y un número
 */
export const registerSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Ingresá un email válido'),
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'La contraseña debe tener al menos un número'),
  confirmPassword: z.string()
    .min(1, 'Debes confirmar la contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

/**
 * Schema para solicitar recuperación de contraseña
 */
export const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Ingresá un email válido'),
});

/**
 * Schema para resetear contraseña
 */
export const resetPasswordSchema = z.object({
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'La contraseña debe tener al menos un número'),
  confirmPassword: z.string()
    .min(1, 'Debes confirmar la contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

/**
 * Schema para cambiar contraseña (desde settings)
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'La contraseña actual es requerida'),
  newPassword: z.string()
    .min(1, 'La nueva contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'La contraseña debe tener al menos un número'),
  confirmPassword: z.string()
    .min(1, 'Debes confirmar la nueva contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser diferente a la actual',
  path: ['newPassword'],
});

// ============================================
// PRODUCTOS
// ============================================

export const productSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.number()
    .positive('El precio debe ser mayor a 0'),
  cost: z.number()
    .positive('El costo debe ser mayor a 0')
    .optional(),
  stock: z.number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo'),
  minStock: z.number()
    .int('El stock mínimo debe ser un número entero')
    .min(0, 'El stock mínimo no puede ser negativo')
    .optional(),
  category: z.string().optional(),
  active: z.boolean().optional(),
});

// ============================================
// CLIENTES
// ============================================

export const customerSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string()
    .email('Ingresá un email válido')
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  zipCode: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean().optional(),
});

// ============================================
// FACTURAS
// ============================================

export const invoiceItemSchema = z.object({
  productId: z.string().min(1, 'El producto es requerido'),
  quantity: z.number()
    .positive('La cantidad debe ser mayor a 0'),
  unitPrice: z.number()
    .positive('El precio debe ser mayor a 0'),
});

export const invoiceSchema = z.object({
  customerId: z.string().min(1, 'El cliente es requerido'),
  date: z.string().min(1, 'La fecha es requerida'),
  dueDate: z.string().optional(),
  items: z.array(invoiceItemSchema)
    .min(1, 'Debe agregar al menos un producto'),
  notes: z.string().optional(),
});

// ============================================
// MOVIMIENTOS DE STOCK
// ============================================

export const stockMovementSchema = z.object({
  productId: z.string().min(1, 'El producto es requerido'),
  type: z.enum(['in', 'out', 'adjustment']),
  quantity: z.number()
    .positive('La cantidad debe ser mayor a 0'),
  reason: z.string().optional(),
  reference: z.string().optional(),
});

// ============================================
// TIPOS INFERIDOS
// ============================================

// Inferir tipos TypeScript de los schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type StockMovementInput = z.infer<typeof stockMovementSchema>;

// ============================================
// UTILIDADES
// ============================================

/**
 * Función helper para validar un formulario
 * Retorna el objeto validado o null si hay errores
 */
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true;
  data: T;
} | {
  success: false;
  errors: Record<string, string>;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Convertir errores de Zod a formato simple
  const errors: Record<string, string> = {};
  result.error.issues.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return { success: false, errors };
}

/**
 * Función para obtener mensajes de error de un campo específico
 */
export function getFieldError(errors: Record<string, string>, field: string): string | undefined {
  return errors[field];
}
