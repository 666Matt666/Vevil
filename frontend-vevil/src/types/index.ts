// ============================================
// TIPOS COMPARTIDOS DEL PROYECTO
// ============================================

// ============================================
// AUTENTICACIÓN
// ============================================

export interface UserProfile {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  isActive?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user?: UserProfile;
}

// ============================================
// REGISTROS PENDIENTES
// ============================================

export interface PendingRegistrationItem {
  id: string;
  email: string;
  name: string;
  lastName?: string;
  gender?: string;
  status: string;
  emailConfirmedAt?: string;
  createdAt: string;
}

export interface PendingRegistrationsCount {
  count: number;
}

// ============================================
// PRODUCTOS
// ============================================

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  category?: string;
  imageUrl?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  category?: string;
  imageUrl?: string;
  active?: boolean;
}

// ============================================
// CLIENTES
// ============================================

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  documentType?: string;
  documentNumber?: string;
  notes?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCustomerDto {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  documentType?: string;
  documentNumber?: string;
  notes?: string;
  active?: boolean;
}

// ============================================
// FACTURAS
// ============================================

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: Customer;
  date: string;
  dueDate?: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  items: InvoiceItem[];
  payments?: Payment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  product?: Product;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: string;
  reference?: string;
  notes?: string;
}

export interface CreateInvoiceDto {
  customerId: string;
  date: string;
  dueDate?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
  notes?: string;
}

// ============================================
// MOVIMIENTOS DE STOCK
// ============================================

export interface StockMovement {
  id: string;
  productId: string;
  product?: Product;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  reference?: string;
  date: string;
  createdBy?: string;
  createdAt?: string;
}

export interface CreateStockMovementDto {
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  reference?: string;
}

// ============================================
// MÉTRICAS / DASHBOARD
// ============================================

export interface DashboardMetrics {
  totalProducts: number;
  totalCustomers: number;
  totalInvoices: number;
  pendingInvoices: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  topProducts: {
    id: string;
    name: string;
    totalSold: number;
  }[];
  recentInvoices: Invoice[];
}

// ============================================
// AUDITORÍA
// ============================================

export interface AuditLogEntry {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// ============================================
// RESPUESTAS PAGINADAS
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// ERRORES
// ============================================

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// ============================================
// UTILIDADES
// ============================================

export type UserRole = 'admin' | 'user' | 'guest';

export interface SelectOption {
  value: string | number;
  label: string;
}
