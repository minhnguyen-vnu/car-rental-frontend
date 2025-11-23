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
  minPickupDate = '';
  timeSlots: string[] = [];

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
    this.timeSlots = this.buildTimeSlots();
    this.vehicleId = +this.route.snapshot.paramMap.get('vehicleId')!;
    this.createForm();
    this.setupValueSync();
    this.loadVehicle();

    // Tự động tính lại khi thay đổi thời gian
    this.rentalForm.get('pickupTime')?.valueChanges.subscribe(() => this.updateCalculations());
    this.rentalForm.get('returnTime')?.valueChanges.subscribe(() => this.updateCalculations());
  }



  private createForm(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const pickupDate = this.toDateInputValue(tomorrow);
    const returnDate = this.toDateInputValue(this.addDays(tomorrow, 1));
    const defaultPickupSlot = '09:00';
    const defaultReturnSlot = '11:00';
    this.minPickupDate = pickupDate;

    this.rentalForm = this.fb.group({
      pickupDate: [pickupDate, Validators.required],
      pickupSlot: [defaultPickupSlot, Validators.required],
      returnDate: [returnDate, Validators.required],
      returnSlot: [defaultReturnSlot, Validators.required],
      pickupTime: [`${pickupDate}T${defaultPickupSlot}`, Validators.required],
      returnTime: [`${returnDate}T${defaultReturnSlot}`, Validators.required],
      pickupBranchId: [1, Validators.required],
      returnBranchId: [1, Validators.required],
      durationDays: [0],
      totalAmount: [0]
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

  private updateCalculations(): void {
    if (!this.vehicle?.basePrice) return;

    const pickup = this.rentalForm.get('pickupTime')?.value;
    const returnT = this.rentalForm.get('returnTime')?.value;

    if (pickup && returnT && returnT > pickup) {
      const days = this.calculateDays(); // Dùng hàm này thay vì Math.ceil
      const total = days * this.vehicle.basePrice;

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
      const minutes = diffMs / (1000 * 60);
      const actualDays = minutes / (24.0 * 60.0);
      const dFloor = Math.floor(actualDays);
      const frac = actualDays - dFloor;

      let rounded;
      if (frac === 0) {
        rounded = dFloor;
      } else {
        rounded = (frac <= 0.5) ? dFloor + 0.5 : dFloor + 1.0;
      }

      return rounded;
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

  minReturnDate(): string {
    return this.rentalForm.get('pickupDate')?.value || this.minPickupDate;
  }

  private buildTimeSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 8; hour <= 22; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      slots.push(`${hourStr}:00`);
      if (hour !== 22) {
        slots.push(`${hourStr}:30`);
      }
    }
    return slots;
  }

  private toDateInputValue(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private addDays(date: Date, days: number): Date {
    const clone = new Date(date);
    clone.setDate(clone.getDate() + days);
    return clone;
  }

  private setupValueSync(): void {
    this.syncPickupDateTime();
    this.syncReturnDateTime();

    this.rentalForm.get('pickupDate')?.valueChanges.subscribe(() => {
      this.syncPickupDateTime();
      this.ensureReturnAfterPickup();
    });
    this.rentalForm.get('pickupSlot')?.valueChanges.subscribe(() => {
      this.syncPickupDateTime();
      this.ensureReturnAfterPickup();
    });
    this.rentalForm.get('returnDate')?.valueChanges.subscribe(() => this.syncReturnDateTime());
    this.rentalForm.get('returnSlot')?.valueChanges.subscribe(() => this.syncReturnDateTime());
  }

  private syncPickupDateTime(): void {
    const date = this.rentalForm.get('pickupDate')?.value;
    const slot = this.rentalForm.get('pickupSlot')?.value;
    if (!date || !slot) return;
    this.rentalForm.patchValue({ pickupTime: `${date}T${slot}` }, { emitEvent: true });
  }

  private syncReturnDateTime(): void {
    const date = this.rentalForm.get('returnDate')?.value;
    const slot = this.rentalForm.get('returnSlot')?.value;
    if (!date || !slot) return;
    this.rentalForm.patchValue({ returnTime: `${date}T${slot}` }, { emitEvent: true });
  }

  private ensureReturnAfterPickup(): void {
    const pickupDate = this.rentalForm.get('pickupDate')?.value;
    const pickupSlot = this.rentalForm.get('pickupSlot')?.value;
    const returnDate = this.rentalForm.get('returnDate')?.value;
    const returnSlot = this.rentalForm.get('returnSlot')?.value;

    if (!pickupDate) return;

    if (!returnDate || returnDate < pickupDate) {
      this.rentalForm.patchValue({ returnDate: pickupDate }, { emitEvent: false });
    }

    if (pickupDate === this.rentalForm.get('returnDate')?.value && pickupSlot && returnSlot && returnSlot <= pickupSlot) {
      const nextSlot = this.findNextSlot(pickupSlot);
      if (nextSlot) {
        this.rentalForm.patchValue({ returnSlot: nextSlot }, { emitEvent: false });
      } else {
        const nextDate = this.toDateInputValue(this.addDays(new Date(pickupDate), 1));
        this.rentalForm.patchValue({
          returnDate: nextDate,
          returnSlot: this.timeSlots[0]
        }, { emitEvent: false });
      }
    }

    this.syncReturnDateTime();
  }

  private findNextSlot(currentSlot: string): string | null {
    const index = this.timeSlots.indexOf(currentSlot);
    if (index === -1) return null;
    return this.timeSlots[index + 1] || null;
  }
}