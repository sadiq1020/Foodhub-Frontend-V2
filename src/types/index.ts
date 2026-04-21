// ── Pagination ────────────────────────────────────

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// ── API Error Types ────────────────────────────────────
export type ApiErrorDetail = {
  field: string;
  message: string;
};

export type ApiError = {
  statusCode: number;
  message: string;
  errorDetails?: ApiErrorDetail[];
};

// ── Meal ──────────────────────────────────────────────
// Used in: MealCard, FeaturedMeals, MealsPage, MealDetail
export type Meal = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  dietary?: string | null;
  spiceLevel?: string | null;
  isAvailable?: boolean;
  averageRating?: number | null;
  totalReviews?: number | null;
  provider: {
    id: string;
    businessName: string;
    address?: string | null;
  };
  category: {
    id: string;
    name: string;
  };
  reviews?: Review[];
};

// ── Category ───────────────────────────────────────────
// Used in: CategoriesSection, CategoryCard, MealFilters
export type Category = {
  id: string;
  name: string;
  image?: string | null;
  _count?: {
    meals: number;
  };
};

// ── Review ─────────────────────────────────────────────
// Used in: MealDetail
export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  customer: {
    name: string;
  };
  createdAt: string;
};

// ── Cart ───────────────────────────────────────────────
// Used in: CartContext, AddToCart, CartPage
export type CartItem = {
  mealId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
};

// ── Orders ───────────────────────────────────────────────
export type Order = {
  id: string;
  orderNumber: string;
  status: "PLACED" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
  paymentStatus: "UNPAID" | "PAID" | "FAILED";
  total: number;
  subtotal: number;
  deliveryFee: number;
  deliveryAddress: string;
  phone: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orderItems: number;
  };
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  meal: {
    id: string;
    name: string;
    image?: string | null;
  };
};

// ── Users ───────────────────────────────────────────────
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
};
