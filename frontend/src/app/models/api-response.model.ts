export interface ApiResponse<T> {
  data: T;
  message?: string;
  count?: number;
}
