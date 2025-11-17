import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { GeneralResponse } from '../../shared/models/general-response.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // GET request
  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<GeneralResponse<T>>(`${this.apiUrl}${endpoint}`, { params: httpParams })
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  // POST request
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<GeneralResponse<T>>(`${this.apiUrl}${endpoint}`, body)
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  // PUT request
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<GeneralResponse<T>>(`${this.apiUrl}${endpoint}`, body)
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  // DELETE request
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<GeneralResponse<T>>(`${this.apiUrl}${endpoint}`)
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  // Xử lý response từ backend
  private handleResponse<T>(response: GeneralResponse<T>): T {
    if (response.status.code === 200) {
      return response.data as T;
    }
    // Nếu không phải 200, throw error
    throw {
      code: response.status.code,
      message: response.status.displayMessage
    };
  }

  // Xử lý error
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Unexpected error';
    let errorCode = 9000;

    if (error.error?.status) {
      // Lỗi từ backend (GeneralResponse format)
      errorCode = error.error.status.code;
      errorMessage = error.error.status.displayMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => ({
      code: errorCode,
      message: errorMessage
    }));
  }
}
