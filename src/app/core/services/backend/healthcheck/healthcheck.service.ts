import { Injectable } from '@angular/core';
import { Observable, of, retry, throwError } from 'rxjs';
import { catchError, mergeMap, timeout } from 'rxjs/operators';
import { HttpService } from '@core/services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class HealthcheckService {
  constructor(private httpService: HttpService) {}

  public checkServerHealth(): Observable<boolean> {
    return this.httpService.getHttpResponse<string>('v1/healthcheck').pipe(
      timeout(5000),
      mergeMap(response =>
        response.status === 200 ? of(true) : throwError(() => new Error('Wrong status'))
      ),
      retry(2),
      catchError(() => of(false))
    );
  }
}
