import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { toCamelCaseKeys } from '../utils/case.util';

/** Serialize every successful JSON body to camelCase for frontend / @kamusi/core. */
@Injectable()
export class CamelCaseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => toCamelCaseKeys(data)));
  }
}
