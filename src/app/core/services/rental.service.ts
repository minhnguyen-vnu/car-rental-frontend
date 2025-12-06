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
    page?: number;
}

export interface PagingResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
    sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
    };
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
  sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
  };
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

   private mockPagingData: PagingResponse<RentalResponseDTO> = {
    content: MOCK_RENTALS,
    pageable: { pageNumber: 0, pageSize: 15, offset: 0, paged: true, unpaged: false, sort: { sorted: false, unsorted: true, empty: true } },
    totalPages: 1,
    totalElements: MOCK_RENTALS.length,
    last: true,
    first: true,
    size: 15,
    number: 0,
    numberOfElements: MOCK_RENTALS.length,
    empty: false,
    sort: { sorted: false, unsorted: true, empty: true }
  };

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

  /** Lấy danh sách / tìm kiếm đơn thuê xe (body filter) - Có phân trang */
  getRentals(filter: RentalRequestDTO = {}): Observable<GeneralResponse<PagingResponse<RentalResponseDTO>>> {
    // Default page 0 if undefined
    if (filter.page === undefined) filter.page = 0;

    return this.http.post<GeneralResponse<PagingResponse<RentalResponseDTO>>>(`${this.baseUrl}/get`, filter).pipe(
      catchError((error) => {
        console.warn('API Rental lỗi → dùng mock data', error);

        // Giả lập delay 500ms để giống thật
        const mockResponse: GeneralResponse<PagingResponse<RentalResponseDTO>> = {
          status: 'SUCCESS' as any,
          data: this.mockPagingData
        };

        return of(mockResponse).pipe(delay(500));
      })
    );
  }

  /** Lấy chi tiết 1 rental theo id (nếu backend hỗ trợ thêm sau này) */
  getRentalById(id: number): Observable<GeneralResponse<RentalResponseDTO>> {
    return this.http.post<GeneralResponse<RentalResponseDTO>>(`${this.baseUrl}/get`, { id });
  }
}