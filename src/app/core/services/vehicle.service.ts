
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { GeneralResponse } from '../../shared/models/general-response.model';
import { environment } from '../../../environments/environment';

// --- DEFINITIONS ---

export interface VehicleFeature {
  id: number;
  name: string;
  group: 'SAFETY' | 'INTERIOR' | 'TECH' | 'ASSIST';
}

/**
 * Danh sách Feature chuẩn (ID 0 - 52).
 * Tổng cộng 53 features, nằm trong giới hạn Safe Integer của JS (2^53 - 1).
 */
export const VEHICLE_FEATURES_LIST: VehicleFeature[] = [
  // --- SAFETY (An toàn) ---
  { id: 0, name: 'Hệ thống chống bó cứng phanh ABS', group: 'SAFETY' },
  { id: 1, name: 'Túi khí an toàn', group: 'SAFETY' },
  { id: 2, name: 'Cân bằng điện tử (ESC)', group: 'SAFETY' },
  { id: 3, name: 'Cảm biến áp suất lốp (TPMS)', group: 'SAFETY' },
  { id: 4, name: 'Camera lùi', group: 'SAFETY' },
  { id: 5, name: 'Camera 360 độ', group: 'SAFETY' },
  { id: 6, name: 'Cảnh báo điểm mù', group: 'SAFETY' },
  { id: 21, name: 'Cảnh báo va chạm phía trước', group: 'SAFETY' },
  { id: 22, name: 'Cảnh báo phương tiện cắt ngang sau', group: 'SAFETY' },
  { id: 25, name: 'Cảm biến lùi xe', group: 'SAFETY' },
  { id: 26, name: 'Khóa cửa an toàn trẻ em', group: 'SAFETY' },
  { id: 27, name: 'Điểm neo ghế trẻ em ISOFIX', group: 'SAFETY' },

  // --- INTERIOR (Nội thất & Tiện nghi) ---
  { id: 7, name: 'Điều hòa tự động', group: 'INTERIOR' },
  { id: 8, name: 'Ghế bọc da', group: 'INTERIOR' },
  { id: 9, name: 'Ghế chỉnh điện', group: 'INTERIOR' },
  { id: 10, name: 'Cửa sổ trời', group: 'INTERIOR' },
  { id: 28, name: 'Ghế sưởi ấm', group: 'INTERIOR' },
  { id: 29, name: 'Ghế thông gió', group: 'INTERIOR' },
  { id: 30, name: 'Ghế nhớ vị trí', group: 'INTERIOR' },
  { id: 31, name: 'Tựa lưng chỉnh điện', group: 'INTERIOR' },
  { id: 32, name: 'Điều hòa hàng ghế sau', group: 'INTERIOR' },
  { id: 33, name: 'Lọc không khí', group: 'INTERIOR' },
  { id: 34, name: 'Đèn viền nội thất', group: 'INTERIOR' },
  { id: 36, name: 'Hộc làm lạnh', group: 'INTERIOR' },
  { id: 37, name: 'Cốp điện tự động', group: 'INTERIOR' },
  { id: 48, name: 'Gương chiếu hậu chỉnh điện', group: 'INTERIOR' },
  { id: 49, name: 'Gương gập tự động', group: 'INTERIOR' },

  // --- TECH (Công nghệ & Giải trí) ---
  { id: 12, name: 'Kết nối Bluetooth', group: 'TECH' },
  { id: 13, name: 'Cổng USB / Type-C', group: 'TECH' },
  { id: 14, name: 'Màn hình cảm ứng', group: 'TECH' },
  { id: 15, name: 'Apple CarPlay', group: 'TECH' },
  { id: 16, name: 'Android Auto', group: 'TECH' },
  { id: 17, name: 'Khởi động nút bấm', group: 'TECH' },
  { id: 18, name: 'Chìa khóa thông minh', group: 'TECH' },
  { id: 35, name: 'Sạc không dây', group: 'TECH' },
  { id: 38, name: 'Hệ thống âm thanh cao cấp', group: 'TECH' },
  { id: 39, name: 'Loa siêu trầm (Subwoofer)', group: 'TECH' },
  { id: 40, name: 'Cổng HDMI', group: 'TECH' },
  { id: 41, name: 'Kết nối điện thoại không dây', group: 'TECH' },
  { id: 42, name: 'Màn hình giải trí ghế sau', group: 'TECH' },
  { id: 43, name: 'Đầu đĩa DVD', group: 'TECH' },
  { id: 44, name: 'Radio FM/AM', group: 'TECH' },
  { id: 45, name: 'Điều khiển giọng nói', group: 'TECH' },
  { id: 52, name: 'Màn hình hiển thị kính lái HUD', group: 'TECH' },

  // --- ASSIST (Hỗ trợ lái xe) ---
  { id: 11, name: 'Ga tự động (Cruise Control)', group: 'ASSIST' },
  { id: 19, name: 'Đèn pha tự động', group: 'ASSIST' },
  { id: 20, name: 'Hỗ trợ giữ làn đường', group: 'ASSIST' },
  { id: 23, name: 'Hỗ trợ khởi hành ngang dốc', group: 'ASSIST' },
  { id: 24, name: 'Hỗ trợ xuống dốc', group: 'ASSIST' },
  { id: 46, name: 'Ga tự động thích ứng (Adaptive Cruise)', group: 'ASSIST' },
  { id: 47, name: 'Đỗ xe tự động', group: 'ASSIST' },
  { id: 50, name: 'Cảm biến mưa', group: 'ASSIST' },
  { id: 51, name: 'Cảm biến ánh sáng', group: 'ASSIST' },
];

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
  featureMask?: number; 
  turnaroundMinutes?: number;
  freeText?: string;
  isMeaningful: boolean;
  
  // ADD: Thêm tham số phân trang vào Request DTO (size đã được bỏ)
  page?: number; 
}

export interface VehicleResponseDTO extends VehicleRequestDTO {
  id: number;
  imageUrl?: string; // Đảm bảo có field này khớp với JSON
}

// Interface khớp với JSON Backend trả về
export interface PagingResponse<T> {
  content: T[]; // Đây mới là mảng xe thực sự
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
  number: number; // Current Page Index
  numberOfElements: number;
  empty: boolean;
  sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly baseUrl = `${environment.apiUrl}/vehicle`;
  
  // Mock data update theo cấu trúc Paging mới (size mặc định 15)
  private mockPagingData: PagingResponse<VehicleResponseDTO> = {
      content: [
        { id: 1, vehicleCode: 'V002', brand: 'Toyota1', model: 'Camry', featureMask: 12345, imageUrl: 'Toyota-Camry-gray.png',basePrice: 11000, status: 'AVAILABLE',year: 2023, color: 'Gray',turnaroundMinutes: 60 } as VehicleResponseDTO,
        { id: 2, vehicleCode: 'V003', brand: 'Toyota2', model: 'Camry', featureMask: 12345, imageUrl: 'Toyota-Camry-gray.png',basePrice: 12000, status: 'AVAILABLE',year: 2023, color: 'Gray',turnaroundMinutes: 60 } as VehicleResponseDTO,
        { id: 3, vehicleCode: 'V004', brand: 'Toyota3', model: 'Camry', featureMask: 12345, imageUrl: 'Toyota-Camry-gray.png',basePrice: 10300, status: 'AVAILABLE',year: 2023, color: 'Gray',turnaroundMinutes: 60 } as VehicleResponseDTO
,
        { id: 4, vehicleCode: 'V005', brand: 'Toyota4', model: 'Camry', featureMask: 12345, imageUrl: 'Toyota-Camry-gray.png',basePrice: 10400, status: 'AVAILABLE',year: 2023, color: 'Gray',turnaroundMinutes: 60 } as VehicleResponseDTO
,
        { id: 5, vehicleCode: 'V006', brand: 'Toyota5', model: 'Camry', featureMask: 12345, imageUrl: 'Toyota-Camry-gray.png',basePrice: 10050, status: 'AVAILABLE',year: 2023, color: 'Gray',turnaroundMinutes: 60 } as VehicleResponseDTO

      ],
      pageable: { pageNumber: 0, pageSize: 15, offset: 0, paged: true, unpaged: false, sort: { sorted: false, unsorted: true, empty: true } },
      totalPages: 1,
      totalElements: 5,
      last: true,
      first: true,
      size: 15,
      number: 0,
      numberOfElements: 1,
      empty: false,
      sort: { sorted: false, unsorted: true, empty: true }
  };

  constructor(private http: HttpClient) {}

  // ... (Giữ nguyên encodeFeatures và decodeFeatures) ...
  encodeFeatures(ids: number[]): number {
    let mask = 0;
    const uniqueIds = Array.from(new Set(ids));
    uniqueIds.forEach(id => {
      if (id > 52) {
        console.warn(`Feature ID ${id} vượt quá giới hạn Safe Integer (52). Feature này sẽ bị bỏ qua.`);
        return;
      }
      mask += (2 ** id);
    });
    return mask;
  }

  decodeFeatures(mask: number | undefined): number[] {
    if (mask === undefined || mask === null || mask === 0) return [];
    
    const ids: number[] = [];
    let currentMask = mask;
    let currentId = 0;

    while (currentMask > 0) {
      if (currentMask % 2 !== 0) {
        if (VEHICLE_FEATURES_LIST.some(f => f.id === currentId)) {
            ids.push(currentId);
        }
      }
      currentMask = Math.floor(currentMask / 2);
      currentId++;
      if (currentId > 53) break;
    }
    
    return ids;
  }

  // UPDATE: getVehicles trả về PagingResponse, bỏ tham số size
  getVehicles(request: VehicleRequestDTO = {isMeaningful: true}): Observable<GeneralResponse<PagingResponse<VehicleResponseDTO>>> {
    // Set default page nếu thiếu
    if (request.page === undefined) request.page = 0;
    
    // Không cần gửi size vì backend mặc định 15

    return this.http.post<GeneralResponse<PagingResponse<VehicleResponseDTO>>>(`${this.baseUrl}/get`, request).pipe(
      catchError((error: HttpErrorResponse) => {
         if (error.status === 404 || error.status === 0) {
             return of({
                 status: 'SUCCESS' as any,
                 data: this.mockPagingData
             }).pipe(delay(500));
         }
         throw error;
      })
    );
  }

  // ... (Các hàm update, remove, add giữ nguyên) ...
  updateVehicle(request: VehicleRequestDTO): Observable<GeneralResponse<VehicleResponseDTO>> {
    return this.http.put<GeneralResponse<VehicleResponseDTO>>(`${this.baseUrl}/update`, request);
  }

  removeVehicle(id: number): Observable<GeneralResponse<null>> {
    return this.http.delete<GeneralResponse<null>>(`${this.baseUrl}/remove`, { body: { id } });
  }

  addVehicle(request: VehicleRequestDTO): Observable<GeneralResponse<VehicleResponseDTO>> {
    return this.http.post<GeneralResponse<VehicleResponseDTO>>(`${this.baseUrl}/add`, request);
  }
}