import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VehicleCardComponent } from '../vehicle-card.component';
import { 
  VehicleService, 
  VehicleRequestDTO, 
  VehicleResponseDTO, 
  VEHICLE_FEATURES_LIST,
  // IMPORT THÊM CÁC LIST CHUẨN
  VEHICLE_TYPES,
  TRANSMISSION_TYPES,
  FUEL_TYPES
} from '../../../core/services/vehicle.service';

type Role = 'ADMIN' | 'USER';

interface FeatureGroupUI {
  name: string;
  items: { 
    id: number; 
    name: string; 
    selected: boolean 
  }[];
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, VehicleCardComponent, CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  @Input() role: Role = 'USER';

  request: VehicleRequestDTO = {
    pickupTime: new Date().toISOString(),
    returnTime: new Date(new Date().getTime() + 1 * 60000).toISOString(),
    isMeaningful: true,
    page: 0,
  };
  
  vehicles: VehicleResponseDTO[] = [];
  loading = false;
  
  // Pagination State
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;

  // Advanced Search Logic
  showAdvanced = false;
  showFeatureModal = false;
  selectedFeatureCount = 0;
  
  featureGroups: FeatureGroupUI[] = [];

  // KHAI BÁO BIẾN DÙNG TRONG HTML (Lấy từ Service)
  readonly vehicleTypesList = VEHICLE_TYPES;
  readonly transmissionTypesList = TRANSMISSION_TYPES;
  readonly fuelTypesList = FUEL_TYPES;
  
  dateError: string = '';

  constructor(
    private vehicleService: VehicleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initFeatureGroups();
    this.search();
  }

  // ... (Giữ nguyên các hàm initFeatureGroups, toggleAdvanced, v.v...)

  private initFeatureGroups() {
    const groupsMapping: Record<string, string> = {
      'SAFETY': '🛡️ An toàn & An ninh',
      'INTERIOR': '🛋️ Nội thất & Tiện nghi',
      'TECH': '🎵 Công nghệ & Giải trí',
      'ASSIST': '🚙 Hỗ trợ lái xe'
    };
    const groupMap = new Map<string, FeatureGroupUI>();
    Object.keys(groupsMapping).forEach(key => {
      groupMap.set(key, { name: groupsMapping[key], items: [] });
    });
    VEHICLE_FEATURES_LIST.forEach(f => {
      const group = groupMap.get(f.group);
      if (group) {
        group.items.push({ id: f.id, name: f.name, selected: false });
      }
    });
    this.featureGroups = Array.from(groupMap.values());
  }

  toggleAdvanced() { this.showAdvanced = !this.showAdvanced; }
  toggleFeatureModal() { this.showFeatureModal = !this.showFeatureModal; }

  updateSelectedFeatures() {
    let count = 0;
    const selectedIds: number[] = [];
    this.featureGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.selected) {
          count++;
          selectedIds.push(item.id);
        }
      });
    });
    this.selectedFeatureCount = count;
    if (selectedIds.length > 0) {
      this.request.featureMask = this.vehicleService.encodeFeatures(selectedIds);
    } else {
      this.request.featureMask = undefined;
    }
  }
  
  clearFeatures() {
      this.featureGroups.forEach(g => g.items.forEach(i => i.selected = false));
      this.updateSelectedFeatures();
  }

  trackById(index: number, vehicle: VehicleResponseDTO): number {
    return vehicle.id;
  }

  onViewDetail(id: number) {
    const vehicle = this.vehicles.find(v => v.id === id);
    if (!vehicle) return;
    const url = this.role === 'ADMIN' ? `/admin/vehicle/${id}` : `/vehicle/${id}`;
    this.router.navigate([url], { state: { vehicle } });
  }

  onSearch(form: NgForm) {
    this.dateError = ''; 
    if (this.role === 'USER' && form.invalid) {
      Object.keys(form.controls).forEach(key => form.controls[key].markAsTouched());
      return; 
    }
    if (this.request.pickupTime && this.request.returnTime) {
      const start = new Date(this.request.pickupTime);
      const end = new Date(this.request.returnTime);
      if (start >= end) {
        this.dateError = 'Ngày trả xe phải lớn hơn ngày nhận xe!';
        return;
      }
    }
    
    this.request.page = 0;
    this.search();
  }

  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.request.page = newPage;
      this.search();
    }
  }

  private search() {
    this.loading = true;
    this.vehicleService.getVehicles(this.request).subscribe({
      next: (res) => {
        if (res.data) {
          this.vehicles = res.data.content || [];
          this.totalPages = res.data.totalPages;
          this.totalElements = res.data.totalElements;
          this.currentPage = res.data.number;
        } else {
          this.vehicles = [];
          this.totalPages = 0;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.vehicles = [];
        this.loading = false;
      }
    });
  }
  // search.component.ts

// Hàm này dùng để cập nhật giá trị cho request khi select thay đổi
onSelectChange(field: keyof VehicleRequestDTO, event: Event) {
  const selectElement = event.target as HTMLSelectElement;
  // Cập nhật giá trị vào object request
  // Sử dụng 'any' nếu TS báo lỗi type không khớp, hoặc ép kiểu cụ thể
  (this.request as any)[field] = selectElement.value === "" ? null : selectElement.value;
}
}