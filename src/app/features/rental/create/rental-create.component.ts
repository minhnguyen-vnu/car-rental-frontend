// src/app/features/rental/create/rental-create.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RentalService, RentalCreateRequestDTO } from '../../../core/services/rental.service';
import { VehicleService, VehicleResponseDTO } from '../../../core/services/vehicle.service';
import { StorageService } from '../../../core/services/storage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rental-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rental-create.component.html',
  styleUrls: ['./rental-create.component.css']
})
export class RentalCreateComponent implements OnInit {
  rentalForm!: FormGroup;
  vehicle?: VehicleResponseDTO;
  vehicleId!: number;
  loading = false;
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private rentalService: RentalService,
    private vehicleService: VehicleService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.vehicleId = +this.route.snapshot.paramMap.get('vehicleId')!;
    this.createForm();
    this.loadVehicle();

    // Tự động tính lại khi thay đổi thời gian
    this.rentalForm.get('pickupTime')?.valueChanges.subscribe(() => this.updateCalculations());
    this.rentalForm.get('returnTime')?.valueChanges.subscribe(() => this.updateCalculations());
  }



  private createForm(): void {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 16);

  this.rentalForm = this.fb.group({
    pickupTime: [tomorrowStr, Validators.required],
    returnTime: ['', Validators.required],
    pickupBranchId: [1, Validators.required],
    returnBranchId: [1, Validators.required],
    durationDays: [0],        // thêm
    totalAmount: [0]          // thêm
  });
}

  private loadVehicle(): void {
    this.loading = true;
  this.vehicleService.getVehicles({ id: this.vehicleId }).subscribe({
    next: (res) => {
      this.vehicle = res.data?.[0];
      this.loading = false;
      if (this.vehicle) {
        this.updateCalculations(); // Tính tiền ngay khi có xe + pickupTime mặc định
      }
    },
      error: () => {
        this.loading = false;
        alert('Lỗi tải thông tin xe');
      }
    });
  }

  // Tính số ngày + tổng tiền
 private updateCalculations(): void {
  if (!this.vehicle?.basePrice) return; // bạn đang dùng basePrice thay vì dailyRate

  const pickup = this.rentalForm.get('pickupTime')?.value;
  const returnT = this.rentalForm.get('returnTime')?.value;

  if (pickup && returnT && returnT > pickup) {
    const diffMs = new Date(returnT).getTime() - new Date(pickup).getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const total = days * this.vehicle.basePrice;

    // Cập nhật vào form → tự động hiển thị + gửi đi
    this.rentalForm.patchValue({
      durationDays: days,
      totalAmount: total
    }, { emitEvent: false });
  } else {
    this.rentalForm.patchValue({
      durationDays: 0,
      totalAmount: 0
    }, { emitEvent: false });
  }
}

  onSubmit(): void {
    if (this.rentalForm.invalid || this.submitting || !this.vehicle) return;

    let user = this.storageService.getUser();
    if (!user) {
        user = {
            userId: 66771508,
            role: 'customer'
        }
    }
    if (!user?.userId) {
      alert('Vui lòng đăng nhập lại!');
      this.router.navigate(['/login']);
      return;
    }

    this.submitting = true;

    const formValue = this.rentalForm.value;

    // Tạo đúng theo RentalCreateRequestDTO của backend
    const createReq: RentalCreateRequestDTO = {
      vehicleId: this.vehicle.id,
      pickupTime: new Date(formValue.pickupTime).toISOString(),
      returnTime: new Date(formValue.returnTime).toISOString(),
      pickupBranchId: +formValue.pickupBranchId,
      returnBranchId: +formValue.returnBranchId,
      durationDays: this.durationDays,        // bắt buộc
      totalAmount: this.totalAmount           // bắt buộc
    };

    this.rentalService.createRental(createReq).subscribe({
      next: (res) => {
        const transactionCode = res.data?.transactionCode || 'N/A';
        alert(`Đặt xe thành công!\nMã đơn: ${transactionCode}`);
        this.router.navigate(['/user/rental', res.data?.id]);
      },
      error: (err) => {
        console.error('Lỗi tạo đơn:', err);
        const msg = err.error?.message || 'Đặt xe thất bại. Vui lòng thử lại.';
        alert(msg);
        this.submitting = false;
      }
    });
  }

  caculateHours() {
    const pickup = this.rentalForm.get('pickupTime')?.value;
    const returnT = this.rentalForm.get('returnTime')?.value;
    if (pickup && returnT && returnT > pickup) {
      const diffMs = new Date(returnT).getTime() - new Date(pickup).getTime();
      const hours = Math.ceil(diffMs / (1000 * 60 * 60));
      return hours;
    }
    return 0;
  }

  calculateDays() {
    // if day less than 1, return hours difference as string
    const pickup = this.rentalForm.get('pickupTime')?.value;
    const returnT = this.rentalForm.get('returnTime')?.value;
    if (pickup && returnT && returnT > pickup) {
      const diffMs = new Date(returnT).getTime() - new Date(pickup).getTime();
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return days;
    }
    return 0;
  }
  goBack(): void {
    this.router.navigate(['/search']);
  }
  get durationDays(): number {
  return this.rentalForm.get('durationDays')?.value || 0;
}

get totalAmount(): number {
  return this.rentalForm.get('totalAmount')?.value || 0;
}
}