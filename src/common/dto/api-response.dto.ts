import { PaginationMeta } from '../interfaces/paginated-result.interface.js';

export interface ApiResponseMeta {
  requestId: string;
  path: string;
  pagination?: PaginationMeta;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data: T;
  meta: ApiResponseMeta;
}
