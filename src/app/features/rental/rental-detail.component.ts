// src/app/features/rental/detail/rental-detail.component.ts
import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RentalService, RentalResponseDTO, RentalRequestDTO } from '../../core/services/rental.service';
import { CommonModule } from '@angular/common';

type DetailMode = 'view' | 'edit';

@Component({
  selector: 'app-rental-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rental-detail.component.html',
  styleUrls: ['./rental-detail.component.css']
})
export class RentalDetailComponent implements OnInit, OnChanges {
  rental!: RentalResponseDTO;
  mode: DetailMode = 'view';
  form!: FormGroup;
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    public location: Location,
    private fb: FormBuilder,
    private rentalService: RentalService
  ) {}

  ngOnInit(): void {
    this.createForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRental(+id);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rental'] && this.form) {
      this.applyDataAndMode();
    }
  }

  private createForm(): void {
    this.form = this.fb.group({
      id: [{ value: '', disabled: true }],
      transactionCode: [{ value: '', disabled: true }],
      userId: [{ value: '', disabled: true }],
      vehicleId: [{ value: '', disabled: true }],
      paymentId: [{ value: '', disabled: true }],
      pickupTime: [''],
      returnTime: [''],
      pickupBranchId: [{ value: '', disabled: true }],
      returnBranchId: [{ value: '', disabled: true }],
      durationDays: [{ value: '', disabled: true }],
      totalAmount: [''],
      currency: [{ value: '', disabled: true }],
      status: ['']
    });
  }

  private loadRental(id: number): void {
    this.rentalService.getRentals({ id }).subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          this.rental = res.data[0];
          this.applyDataAndMode();
        }
      },
      error: () => {
        alert('Không tải được thông tin đơn thuê');
        this.location.back();
      }
    });
  }

  private applyDataAndMode(): void {
    setTimeout(() => {
      // Chuyển đổi thời gian về định dạng datetime-local
      const pickup = this.rental.pickupTime ? this.toDateTimeLocal(this.rental.pickupTime) : '';
      const returnT = this.rental.returnTime ? this.toDateTimeLocal(this.rental.returnTime) : '';

      this.form.patchValue({
        ...this.rental,
        pickupTime: pickup,
        returnTime: returnT
      });

      // Tự động disable toàn bộ khi ở chế độ view
      if (this.mode === 'view') {
        this.form.disable();
      } else {
        this.form.enable();
        // Chỉ cho phép sửa một số field
        this.form.get('id')?.disable();
        this.form.get('transactionCode')?.disable();
        this.form.get('userId')?.disable();
        this.form.get('vehicleId')?.disable();
        this.form.get('paymentId')?.disable();
        this.form.get('pickupBranchId')?.disable();
        this.form.get('returnBranchId')?.disable();
        this.form.get('durationDays')?.disable();
        this.form.get('currency')?.disable();
      }
    }, 0);
  }

  enterEdit(): void {
    this.mode = 'edit';
    this.applyDataAndMode();
  }

  cancel(): void {
    this.mode = 'view';
    this.applyDataAndMode();
  }

  save(): void {
    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;

    const raw = this.form.getRawValue();
    const updateReq: RentalRequestDTO = {
      id: this.rental.id,
      status: raw.status,
      pickupTime: raw.pickupTime ? this.fromDateTimeLocal(raw.pickupTime) : undefined,
      returnTime: raw.returnTime ? this.fromDateTimeLocal(raw.returnTime) : undefined,
      totalAmount: raw.totalAmount
    };

    this.rentalService.updateRental(updateReq).subscribe({
      next: (res) => {
        this.rental = res.data!;
        this.mode = 'view';
        this.applyDataAndMode();
        this.isSubmitting = false;
        alert('Cập nhật thành công!');
      },
      error: () => {
        this.isSubmitting = false;
        alert('Cập nhật thất bại!');
      }
    });
  }

  // Helper chuyển đổi thời gian
  private toDateTimeLocal(iso: string): string {
    return iso ? new Date(iso).toISOString().slice(0, 16) : '';
  }

  private fromDateTimeLocal(local: string): string {
    return local ? new Date(local).toISOString() : '';
  }

  get title(): string {
    return this.mode === 'view' ? 'Chi tiết đơn thuê' : 'Chỉnh sửa đơn thuê';
  }

  get showActions(): boolean {
    return this.mode === 'edit';
  }
}