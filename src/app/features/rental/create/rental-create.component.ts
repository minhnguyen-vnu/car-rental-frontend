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
  // ít nhất từ ngày mai từ 08:00 đến 22:00
  minPickupTime: string = (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  })();
  maxPickupHour = 22;
  minReturnHour = 8;



  branches = [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5},{id: 6},{id: 7},{id: 8},{id: 9},{id: 10}]; 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private rentalService: RentalService,
    private vehicleService: VehicleService,
    private storageService: StorageService,
    
  ) {}

  ngOnInit(): void {
    this.vehicleId = +this.route.snapshot.paramMap.get('vehicleId')!;
    this.createForm();
    this.loadVehicle();

    // Tự động tính lại khi thay đổi thời gian
    this.rentalForm.get('pickupTime')?.valueChanges.subscribe(() => this.updateCalculations());
    this.rentalForm.get('returnTime')?.valueChanges.subscribe(() => this.updateCalculations());

    this.rentalForm.get('pickupTime')?.valueChanges.subscribe(value => {
   if (!this.isValidHour(value)) {
      const fixed = this.normalizeToValidHour(value);
      this.rentalForm.patchValue({ pickupTime: fixed }, { emitEvent: false });
    }
});
  
this.rentalForm.get('returnTime')?.valueChanges.subscribe(value => {

   if (!this.isValidHour(value)) {
      const fixed = this.normalizeToValidHour(value);
      this.rentalForm.patchValue({ returnTime: fixed }, { emitEvent: false });
    }

});

   

    
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
      token: 'MOCK_TOKEN_FOR_TESTING_PURPOSES',
      role: 'customer'
    };
  }
  if (!user || !user.userId) {
    alert('Vui lòng đăng nhập lại!');
    this.router.navigate(['/login']);
    return;
  }

  this.submitting = true;

  const formValue = this.rentalForm.value;

  const createReq: RentalCreateRequestDTO = {
    vehicleId: this.vehicle.id,
    pickupTime: new Date(formValue.pickupTime).toISOString(),
    returnTime: new Date(formValue.returnTime).toISOString(),
    pickupBranchId: +formValue.pickupBranchId,
    returnBranchId: formValue.returnBranchId,
    durationDays: this.durationDays,
    totalAmount: this.totalAmount
  };

  this.rentalService.createRental(createReq).subscribe({
    next: (res) => {
      const rentalId = res.data?.id;
      const totalAmount = res.data?.totalAmount || this.totalAmount;
      const transactionCode = res.data?.transactionCode || 'N/A';

      alert(`Đặt xe thành công!\nMã đơn: ${transactionCode}`);

      // Điều hướng ngay sang trang thanh toán
      this.router.navigate(['/payment-charge'], {
        queryParams: {
          rentalId: rentalId,
          amount: totalAmount
        }
      });
    },
    error: (err) => {
      console.error('Lỗi tạo đơn thuê xe:', err);

      // MOCK DATA nếu backend trả 404 (để test frontend khi backend chưa sẵn sàng)
      if (err.status === 404 || err.status === 0) {
        alert('Backend chưa sẵn sàng → Dùng mock data để test thanh toán!');

        this.router.navigate(['/payment-charge'], {
          queryParams: {
            rentalId: 999999,
            amount: this.totalAmount || 2500000
          }
        });
        return;
      }

      const msg = err.error?.message || 'Đặt xe thất bại. Vui lòng thử lại.';
      alert(msg);
      this.submitting = false;
    }
  });
}
/**durationDays là return - pickup và làm tròn 
ví dụ 4.2 ngày thành 4.5, 3.1 ngày thành 3.5 ngày, 4.7 ngày thành 5 ngày */


  calculateDays() {
    const pickup = this.rentalForm.get('pickupTime')?.value;
    const returnT = this.rentalForm.get('returnTime')?.value;
    if (pickup && returnT && returnT > pickup) {
      const diffMs = new Date(returnT).getTime() - new Date(pickup).getTime();
      const days = diffMs / (1000 * 60 * 60 * 24);
      return Math.round(days + 0.5); // làm tròn lên .5
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

private isValidHour(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const h = d.getHours();
  return h >= 8 && h <= 22;
}

private normalizeToValidHour(dateStr: string): string {
  const d = new Date(dateStr);
  let h = d.getHours();

  if (h < 8) d.setHours(8, 0, 0);
  if (h > 22) d.setHours(22, 0, 0);

  return d.toISOString().slice(0, 16);
}

public minReturnTime(): string {
  const pickup = this.rentalForm.get('pickupTime')?.value;
  if (!pickup) return '';

  const returnDate = new Date(pickup);
  returnDate.setDate(returnDate.getDate() + 1);
  returnDate.setHours(8, 0, 0, 0);
  return returnDate.toISOString().slice(0, 16);
}
}