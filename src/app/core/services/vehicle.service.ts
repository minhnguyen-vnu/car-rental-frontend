// src/app/core/services/vehicle.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { GeneralResponse } from '../../shared/models/general-response.model';
import { environment } from '../../../environments/environment';

export interface VehicleRequestDTO {
  returnTime?: string;
  pickupTime?: string;
  id?: number;
  vehicleCode?: string;
  licensePlate?: string;
  brand?: string;
  model?: string;
  vehicleType?: string;
  seats?: number;
  transmission?: string;
  fuelType?: string;
  color?: string;
  year?: number;
  basePrice?: number;
  status?: string;
  branchId?: number;
  turnaroundMinutes?: number;
  imageUrl?: string;
  isMeaningFull?: boolean;
  freeText?: string;
}

export interface VehicleResponseDTO extends VehicleRequestDTO {
  id: number;
}

export interface VehiclePagingRequestDTO {
  page?: number;          // trang hiện tại, mặc định 1
  size?: number;          // số bản ghi mỗi trang, mặc định 10
  search?: string;        // tìm kiếm theo biển số, mã xe...
  status?: string;        // lọc theo trạng thái
  branchId?: number;      // lọc theo chi nhánh
  // Có thể thêm các filter khác ở đây
}

// Interface response phân trang
export interface PagingResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    sort: any;
  };
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly baseUrl = `${environment.apiUrl}/vehicle`;

  // Mock data đẹp để test
  private mockData: VehicleResponseDTO[] = [
    {imageUrl: 'VinFast-VF8-white.png', id: 1, vehicleCode: 'V001', licensePlate: '51H-12345', brand: 'Toyota', model: 'Camry 2.5Q', vehicleType: 'Sedan', seats: 5, transmission: 'Tự động', fuelType: 'Xăng', color: 'Đen', year: 2024, basePrice: 1350000, status: 'AVAILABLE', branchId: 1, turnaroundMinutes: 30 },
    { imageUrl: 'VinFast-VF8-white.png',id: 2, vehicleCode: 'V002', licensePlate: '51H-67890', brand: 'Honda', model: 'CR-V 1.5L', vehicleType: 'SUV', seats: 7, transmission: 'Tự động', fuelType: 'Xăng', color: 'Trắng', year: 2024, basePrice: 1550000, status: 'AVAILABLE', branchId: 1, turnaroundMinutes: 45 },
    { imageUrl: 'VinFast-VF8-white.png',id: 3, vehicleCode: 'V003', licensePlate: '51H-99999', brand: 'VinFast', model: 'VF 8 Plus', vehicleType: 'SUV', seats: 5, transmission: 'Tự động', fuelType: 'Điện', color: 'Xanh', year: 2025, basePrice: 1800000, status: 'AVAILABLE', branchId: 2, turnaroundMinutes: 60 },
    { imageUrl: 'VinFast-VF8-white.png',id: 4, vehicleCode: 'V004', licensePlate: '51H-88888', brand: 'Hyundai', model: 'Tucson 2.0', vehicleType: 'SUV', seats: 5, transmission: 'Tự động', fuelType: 'Dầu', color: 'Đỏ', year: 2023, basePrice: 1150000, status: 'MAINTENANCE', branchId: 1, turnaroundMinutes: 30 },
  ];

  constructor(private http: HttpClient) {}

  getVehicles(request: VehicleRequestDTO = {}): Observable<GeneralResponse<VehicleResponseDTO[]>> {
    return this.http.post<GeneralResponse<VehicleResponseDTO[]>>(`${this.baseUrl}/get`, request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Chỉ fallback khi 404 (backend chưa tồn tại) hoặc lỗi mạng
        if (error.status === 404 || error.status === 0) {
          console.warn('Backend chưa sẵn sàng (404), trả về mock data...');
          const mockResponse: GeneralResponse<VehicleResponseDTO[]> = {
            status: 'SUCCESS' as any,
            data: this.mockData
          };
          return of(mockResponse).pipe(delay(500)); // giả lập độ trễ mạng
        }
        // Các lỗi khác (500, 401...) thì vẫn throw để component xử lý
        throw error;
      })
    );
  }
  updateVehicle(request: VehicleRequestDTO): Observable<GeneralResponse<VehicleResponseDTO>> {
    return this.http.put<GeneralResponse<VehicleResponseDTO>>(`${this.baseUrl}/update`, request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404 || err.status === 0) {
          console.warn('Mock: Cập nhật xe ID', request.id);
          const updated = { ...request, id: request.id! } as VehicleResponseDTO;
          const idx = this.mockData.findIndex(v => v.id === request.id);
          if (idx !== -1) this.mockData[idx] = updated;
          return of({
            status: 'SUCCESS' as any,
            data: updated,
            message: 'Cập nhật thành công (mock)'
          }).pipe(delay(600));
        }
        throw err;
      })
    );
  }

  removeVehicle(id: number): Observable<GeneralResponse<null>> {
    return this.http.delete<GeneralResponse<null>>(`${this.baseUrl}/remove`, { body: { id } }).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404 || err.status === 0) {
          console.warn('Mock: Xóa xe ID', id);
          this.mockData = this.mockData.filter(v => v.id !== id);
          return of({
            status: 'SUCCESS' as any,
            data: null,
            message: 'Xóa thành công (mock)'
          }).pipe(delay(400));
        }
        throw err;
      })
    );
  }

  addVehicle(request: VehicleRequestDTO): Observable<GeneralResponse<VehicleResponseDTO>> {
    return this.http.post<GeneralResponse<VehicleResponseDTO>>(`${this.baseUrl}/add`, request);
  }

    /**
   * Lấy danh sách xe theo phân trang
   * @param req Đối tượng phân trang + filter
   * @returns Observable<GeneralResponse<PagingResponse<VehicleResponseDTO>>>
   */
  getVehiclesPaging(
    req: VehiclePagingRequestDTO = { page: 1, size: 10 }
  ): Observable<GeneralResponse<PagingResponse<VehicleResponseDTO>>> {

    // Đảm bảo page bắt đầu từ 1
    const request = { ...req, page: req.page ?? 1, size: req.size ?? 10 };

    return this.http.post<GeneralResponse<PagingResponse<VehicleResponseDTO>>>(
      `${this.baseUrl}/paging`, request
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        // Khi backend chưa có API /paging → fallback mock phân trang
        if (error.status === 404 || error.status === 0) {
          console.warn('Backend chưa có API paging, trả về mock phân trang...');

          // Lọc dữ liệu mock theo các điều kiện (nếu có)
          let filtered = [...this.mockData];

          if (request.search) {
            const term = request.search.toLowerCase();
            filtered = filtered.filter(v =>
              (v.licensePlate?.toLowerCase().includes(term)) ||
              (v.vehicleCode?.toLowerCase().includes(term)) ||
              (v.brand?.toLowerCase().includes(term)) ||
              (v.model?.toLowerCase().includes(term))
            );
          }

          if (request.status) {
            filtered = filtered.filter(v => v.status === request.status);
          }

          if (request.branchId) {
            filtered = filtered.filter(v => v.branchId === request.branchId);
          }

          // Tính toán phân trang
          const page = request.page! - 1; // chuyển về 0-based
          const size = request.size!;
          const start = page * size;
          const end = start + size;
          const content = filtered.slice(start, end);

          const mockPagingResponse: PagingResponse<VehicleResponseDTO> = {
            content,
            pageable: {
              pageNumber: page,
              pageSize: size,
              offset: start,
              sort: { sorted: false, unsorted: true, empty: true }
            },
            totalElements: filtered.length,
            totalPages: Math.ceil(filtered.length / size),
            number: page,
            size,
            first: page === 0,
            last: end >= filtered.length,
            numberOfElements: content.length
          };

          const response: GeneralResponse<PagingResponse<VehicleResponseDTO>> = {
            status: 'SUCCESS' as any,
            data: mockPagingResponse,
          };

          return of(response).pipe(delay(600));
        }

        // Các lỗi khác thì vẫn ném ra ngoài để component bắt
        throw error;
      })
    );
  }

}