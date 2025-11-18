// src/app/features/fleet/layouts/vehicle-detail-layout/vehicle-detail-layout.component.ts

import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService, VehicleResponseDTO } from '../../../core/services/vehicle.service';
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
  @Input() mode: DetailMode = 'customer';  // admin hoặc customer

  vehicle?: VehicleResponseDTO;
  editMode = false;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      alert('Không tìm thấy xe');
      this.router.navigate(['/']);
      return;
    }

    this.loadVehicle(+id);
  }

  private loadVehicle(id: number): void {
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
    // Sau này gắn: this.router.navigate(['/rent', this.vehicle?.id]);
    alert('Chức năng thuê xe đang phát triển...');
  }

  // Hủy sửa
  onCancelEdit(): void {
    this.editMode = false;
  }
}