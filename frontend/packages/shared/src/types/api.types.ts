export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ApiError {
  code: string;                // e.g. "VALIDATION_ERROR", "FORBIDDEN", "SOD_VIOLATION"
  message: string;
  field?: string;              // For validation errors — which field
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
}