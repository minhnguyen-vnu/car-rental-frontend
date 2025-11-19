// src/app/core/services/rental.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { GeneralResponse } from '../../shared/models/general-response.model';
import { environment } from '../../../environments/environment';
import { MOCK_RENTALS } from './mock-rental-data';

// DTO interfaces đúng theo backend
export interface RentalCreateRequestDTO {
  vehicleId: number;
  pickupTime: string;        // ISO string: "2025-11-20T10:00:00"
  returnTime: string;
  pickupBranchId: number;
  returnBranchId: number;
  durationDays?: number;
  totalAmount?: number;
}

export interface RentalRequestDTO {
  id?: number;
  transactionCode?: string;
  userId?: number;
  vehicleId?: number;
  paymentId?: number;
  pickupTime?: string;
  returnTime?: string;
  pickupBranchId?: number;
  returnBranchId?: number;
  durationDays?: number;
  totalAmount?: number;
  currency?: string;
  status?: string;
}

export interface RentalResponseDTO {
  id: number;
  transactionCode: string;
  userId: number;
  vehicleId: number;
  paymentId?: number;
  pickupTime: string;
  returnTime: string;
  pickupBranchId: number;
  returnBranchId: number;
  durationDays?: number;
  totalAmount?: number;
  currency: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class RentalService {

  private readonly baseUrl = `${environment.apiUrl}/rental`;

  constructor(private http: HttpClient) { }

  /** Tạo mới đơn thuê xe */
  createRental(request: RentalCreateRequestDTO): Observable<GeneralResponse<RentalResponseDTO>> {
    return this.http.post<GeneralResponse<RentalResponseDTO>>(`${this.baseUrl}/create`, request);
  }

  /** Cập nhật đơn thuê xe */
  updateRental(request: RentalRequestDTO): Observable<GeneralResponse<RentalResponseDTO>> {
    return this.http.put<GeneralResponse<RentalResponseDTO>>(`${this.baseUrl}/update`, request);
  }

  /** Lấy danh sách / tìm kiếm đơn thuê xe (body filter) */
  getRentals(filter: RentalRequestDTO = {}): Observable<GeneralResponse<RentalResponseDTO[]>> {
    return this.http.post<GeneralResponse<RentalResponseDTO[]>>(`${this.baseUrl}/get`, filter).pipe(
      catchError((error) => {
        console.warn('API Rental lỗi → dùng mock data', error);

        // Giả lập delay 500ms để giống thật
        const mockResponse: GeneralResponse<RentalResponseDTO[]> = {
          status: 200 as any,
          data: MOCK_RENTALS
        };

        return of(mockResponse).pipe(delay(500));
      })
    );
  }

  /** Lấy tất cả (không filter) – tiện dùng */
  getAllRentals(): Observable<GeneralResponse<RentalResponseDTO[]>> {
    return this.getRentals();
  }

  /** Lấy chi tiết 1 rental theo id (nếu backend hỗ trợ thêm sau này) */
  getRentalById(id: number): Observable<GeneralResponse<RentalResponseDTO>> {
    return this.http.post<GeneralResponse<RentalResponseDTO>>(`${this.baseUrl}/get`, { id });
  }
}