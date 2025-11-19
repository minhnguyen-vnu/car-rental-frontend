// src/app/features/fleet/layouts/vehicle-detail-layout/vehicle-detail-layout.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleResponseDTO, VehicleService } from '../../../core/services/vehicle.service';
import { InfoFormComponent } from '../info-form.component';
import { NgIf } from '@angular/common';

type DetailMode = 'admin' | 'customer';

@Component({
  selector: 'app-vehicle-detail-layout',
  standalone: true,
  imports: [NgIf, InfoFormComponent],
  templateUrl: './vehicle-detail-layout.component.html',
  styleUrl: './vehicle-detail-layout.component.css'
})
export class VehicleDetailLayoutComponent implements OnInit {
  mode: DetailMode = 'customer';
  vehicle?: VehicleResponseDTO;
  editMode = false;
  loading = false; // ← Không cần loading nữa!

  constructor(
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
  // 1. Lấy mode từ route data
  this.route.data.subscribe(data => {
    this.mode = (data['mode'] as DetailMode) || 'customer';
  });

  // 2. ĐỌC TRỰC TIẾP TỪ history.state – CHẠY MƯỢT DÙ F5 HAY BACK/FORWARD
  const state = history.state;
  if (state?.vehicle) {
    this.vehicle = state.vehicle;
    this.loading = false;
    return;
  }

  // 3. Fallback: nếu không có state (vào trực tiếp URL) → lấy ID từ param và gọi API
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.loadVehicleFromApi(+id);
  }
}

  private loadVehicleFromApi(id: number): void {
    this.vehicleService.getVehicles({ id }).subscribe({
      next: (res) => {
        this.vehicle = res.data?.[0];
        this.loading = false;
        if (!this.vehicle) {
          alert('Xe không tồn tại');
          this.router.navigate(['/']);
        }
      },
      error: () => {
        this.loading = false;
        alert('Lỗi tải thông tin xe');
      }
    });
  }

  // Quản trị viên: bật chế độ sửa
  startEdit(): void {
    this.editMode = true;
  }

  // Sau khi lưu thành công từ info-form
  onSaved(updatedVehicle: VehicleResponseDTO): void {
    this.vehicle = updatedVehicle;
    this.editMode = false;
  }

  // Quản trị viên: xóa xe
  confirmDelete(): void {
    if (!this.vehicle) return;
    if (confirm(`Xóa xe biển số "${this.vehicle.licensePlate}"?\nHành động này không thể hoàn tác!`)) {
      this.vehicleService.removeVehicle(this.vehicle.id).subscribe({
        next: () => {
          alert('Xóa xe thành công!');
          this.router.navigate(['/admin']);
        },
        error: () => alert('Xóa thất bại')
      });
    }
  }

  // Người dùng: thuê xe (tạm để trống)
  onRent(): void {
  if (!this.vehicle?.id) return;

  // Điều hướng đến trang tạo đơn thuê, truyền vehicleId qua param
  this.router.navigate(['/rental/create', this.vehicle.id]);
}

  // Hủy sửa
  onCancelEdit(): void {
    this.editMode = false;
  }
}