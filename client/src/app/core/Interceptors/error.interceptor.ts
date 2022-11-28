import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, delay, Observable, throwError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!error) return throwError(() => error);

        if (error.status === 400) {
          if (!error.error.errors)
            this.toastr.error(error.error.message, error.error.statusCode);
          throw error.error;
        }
        if (error.status === 401) {
          this.toastr.error(error.error.message, error.error.statusCode);
        }
        if (error.status === 404) {
          this.router.navigateByUrl('/not-found');
        }
        if (error.status === 500) {
          const navigationExtra: NavigationExtras = {
            state: { error: error.error },
          };
          this.router.navigateByUrl('/server-error', navigationExtra);
        }

        return throwError(() => error);
      })
    );
  }
}
