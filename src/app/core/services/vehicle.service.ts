// src/app/core/services/vehicle.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { GeneralResponse } from '../../shared/models/general-response.model';

export interface VehicleRequestDTO {
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
}

export interface VehicleResponseDTO extends VehicleRequestDTO {
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly baseUrl = '/vehicle';

  // Mock data đẹp để test
  private mockData: VehicleResponseDTO[] = [
    { id: 1, vehicleCode: 'V001', licensePlate: '51H-12345', brand: 'Toyota', model: 'Camry 2.5Q', vehicleType: 'Sedan', seats: 5, transmission: 'Tự động', fuelType: 'Xăng', color: 'Đen', year: 2024, basePrice: 1350000, status: 'AVAILABLE', branchId: 1, turnaroundMinutes: 30 },
    { id: 2, vehicleCode: 'V002', licensePlate: '51H-67890', brand: 'Honda', model: 'CR-V 1.5L', vehicleType: 'SUV', seats: 7, transmission: 'Tự động', fuelType: 'Xăng', color: 'Trắng', year: 2024, basePrice: 1550000, status: 'AVAILABLE', branchId: 1, turnaroundMinutes: 45 },
    { id: 3, vehicleCode: 'V003', licensePlate: '51H-99999', brand: 'VinFast', model: 'VF 8 Plus', vehicleType: 'SUV', seats: 5, transmission: 'Tự động', fuelType: 'Điện', color: 'Xanh', year: 2025, basePrice: 1800000, status: 'AVAILABLE', branchId: 2, turnaroundMinutes: 60 },
    { id: 4, vehicleCode: 'V004', licensePlate: '51H-88888', brand: 'Hyundai', model: 'Tucson 2.0', vehicleType: 'SUV', seats: 5, transmission: 'Tự động', fuelType: 'Dầu', color: 'Đỏ', year: 2023, basePrice: 1150000, status: 'MAINTENANCE', branchId: 1, turnaroundMinutes: 30 },
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

}