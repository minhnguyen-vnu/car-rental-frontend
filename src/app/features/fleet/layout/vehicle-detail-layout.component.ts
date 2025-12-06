import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleResponseDTO, VehicleService } from '../../../core/services/vehicle.service';
import { InfoFormComponent } from '../info-form.component'; // Điều chỉnh path import nếu cần
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
  loading = false;

   constructor(
    private vehicleService: VehicleService,
    private route: ActivatedRoute, // ActivatedRoute là service quan trọng ở đây
    public router: Router
  ) {}

  ngOnInit(): void {
    // 1. Lấy mode (admin/customer)
    this.route.data.subscribe(data => {
      this.mode = (data['mode'] as DetailMode) || 'customer';
    });

    // 2. THEO DÕI SỰ THAY ĐỔI CỦA URL (QUAN TRỌNG)
    // Thay vì dùng snapshot, ta dùng subscribe
    this.route.paramMap.subscribe(params => {
      const idString = params.get('id');
      
      if (idString) {
        const id = +idString;
        
        // Reset lại dữ liệu cũ để tránh hiển thị thông tin xe cũ trong lúc chờ tải xe mới
        this.vehicle = undefined; 
        this.loading = true;

        // Kiểm tra State (nếu truyền từ trang danh sách sang)
        // Cần kiểm tra thêm: state.vehicle.id phải khớp với id trên URL
        const state = history.state;
        if (state?.vehicle && state.vehicle.id === id) {
          this.vehicle = state.vehicle;
          this.loading = false;
        } else {
          // Nếu không có state hoặc ID không khớp, gọi API tải mới
          this.loadVehicleFromApi(id);
        }
      }
    });
  }

  private loadVehicleFromApi(id: number): void {
    
    this.vehicleService.getVehicles({ id, isMeaningful: true }).subscribe({
      next: (res) => {
        // CẬP NHẬT: Truy cập vào mảng 'content' bên trong object phân trang
        this.vehicle = res.data?.content?.[0];
        
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

  // Người dùng: thuê xe
  onRent(): void {
    if (!this.vehicle?.id) return;

    // Điều hướng đến trang tạo đơn thuê, truyền vehicleId qua param
    this.router.navigate(['/rental/create', this.vehicle.id]);
  }

  // Hủy sửa
 onCancelEdit(): void {
    this.editMode = false;
    
    // Gọi lại API load xe. Việc này sẽ set loading=true -> false
    // Hành động này sẽ hủy và tạo lại InfoFormComponent (do *ngIf="!loading" ở template cha)
    // Đảm bảo form quay về trạng thái View sạch sẽ nhất.
    if (this.vehicle?.id) {
      this.loadVehicleFromApi(this.vehicle.id);
    }
  }

 
}