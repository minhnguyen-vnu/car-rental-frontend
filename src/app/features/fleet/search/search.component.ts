import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VehicleCardComponent } from '../vehicle-card.component';
import { VehicleService, VehicleRequestDTO, VehicleResponseDTO } from '../../../core/services/vehicle.service';

type Role = 'ADMIN' | 'USER';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, VehicleCardComponent, CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  @Input() role: Role = 'USER';

  request: VehicleRequestDTO = {};
  vehicles: VehicleResponseDTO[] = [];
  loading = false;
  showAdvanced = false;
  dateError: string = '';

  vehicleCategories: string[] = ['SUV', 'SEDAN', 'HATCHBACK', 'TRUCK', 'MPV', 'COUPE'];
  vehicleTransmissionTypes: string[] = ['MANUAL', 'AUTOMATIC'];

  constructor(
    private vehicleService: VehicleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Nếu là ADMIN: Tự động tìm kiếm ngay khi vào trang (vì không bắt buộc nhập ngày)
    // Nếu là USER: Chờ người dùng nhập ngày rồi mới bấm tìm
    if (this.role === 'ADMIN') {
      this.search();
    }
  }

  trackById(index: number, vehicle: VehicleResponseDTO): number {
    return vehicle.id;
  }

  toggleAdvanced() {
    this.showAdvanced = !this.showAdvanced;
  }

  // Xử lý sự kiện khi bấm nút Tìm kiếm
  onSearch(form: NgForm) {
    this.dateError = ''; 

    // 1. Kiểm tra Validate HTML (Required) - CHỈ ÁP DỤNG VỚI USER
    // Nếu là Admin thì form.invalid do thiếu ngày sẽ bị bỏ qua
    if (this.role === 'USER' && form.invalid) {
      // Đánh dấu tất cả input là 'touched' để hiện lỗi đỏ
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return; // Dừng lại, không gọi API
    }

    // 2. Kiểm tra Logic Ngày (Ngày trả < Ngày nhận)
    // Chỉ kiểm tra khi CÓ nhập cả 2 trường (Admin nhập 1 trường thì kệ, User bắt buộc nhập đủ ở bước 1 rồi)
    if (this.request.pickupTime && this.request.returnTime) {
      const start = new Date(this.request.pickupTime);
      const end = new Date(this.request.returnTime);
      
      if (start >= end) {
        this.dateError = 'Ngày trả xe phải lớn hơn ngày nhận xe!';
        return;
      }
    }

    // 3. Gọi API
    this.search();
  }

  private search() {
    this.loading = true;
    this.vehicleService.getVehicles(this.request).subscribe({
      next: (res) => {
        this.vehicles = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.vehicles = [];
        this.loading = false;
      }
    });
  }

  onViewDetail(id: number) {
    const vehicle = this.vehicles.find(v => v.id === id);
    if (!vehicle) return;
    
    const url = this.role === 'ADMIN' 
      ? `/admin/vehicle/${id}` 
      : `/vehicle/${id}`;

    this.router.navigate([url], { state: { vehicle } });
  }
}