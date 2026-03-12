import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { ApiResponse } from '../dto/api-response.dto.js';
import { PaginationMeta } from '../interfaces/paginated-result.interface.js';

interface ResponseWithPagination<T> {
  data: T;
  pagination: PaginationMeta;
}

function isPaginatedResponse<T>(
  value: unknown,
): value is ResponseWithPagination<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'pagination' in value
  );
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = `${request.method} ${request.route?.path ?? request.url}`;

    return next.handle().pipe(
      map((responseData) => {
        const meta = {
          requestId: uuidv4(),
          path,
        };

        if (isPaginatedResponse<T>(responseData)) {
          return {
            ok: true,
            data: responseData.data,
            meta: {
              ...meta,
              pagination: responseData.pagination,
            },
          };
        }

        return {
          ok: true,
          data: responseData,
          meta,
        };
      }),
    );
  }
}
