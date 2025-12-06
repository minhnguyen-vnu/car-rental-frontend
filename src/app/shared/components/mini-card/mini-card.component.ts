import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VehicleResponseDTO } from '../../../core/services/vehicle.service';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-mini-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mini-card.component.html',
  styleUrls: ['./mini-card.component.css']
})
export class MiniCardComponent {
  @Input({ required: true }) vehicle!: VehicleResponseDTO;
  
  private router = inject(Router);
  private storageService = inject(StorageService);

  // Điều hướng sang trang chi tiết giống Search Component
  navigateToDetail() {
    // Mặc định chatbot phục vụ User nên trỏ về đường dẫn public
    // Nếu cần phân quyền Admin, bạn có thể truyền thêm Input role vào đây
    const role = this.storageService.getUser()?.role;
    const url = role === 'ADMIN' ? `/admin/vehicle/${this.vehicle.id}` : `/vehicle/${this.vehicle.id}`;
    this.router.navigate([url], { state: { vehicle: this.vehicle } });
    // this.router.navigate(['/vehicle', this.vehicle.id], {
    //   state: { vehicle: this.vehicle }
    // });
  }

  formatPrice(price?: number): string {
    return price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price) : 'Liên hệ';
  }
}