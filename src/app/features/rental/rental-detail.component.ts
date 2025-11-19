// src/app/features/rental/detail/rental-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RentalService, RentalResponseDTO, RentalRequestDTO } from '../../core/services/rental.service';
import { StorageService } from '../../core/services/storage.service';
import { RequestContext } from '../../shared/models/request-context.model';
import { CommonModule } from '@angular/common';

type DetailMode = 'view' | 'edit';

@Component({
  selector: 'app-rental-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rental-detail.component.html',
  styleUrls: ['./rental-detail.component.css']
})
export class RentalDetailComponent implements OnInit {
  rental!: RentalResponseDTO;
  mode: DetailMode = 'view';
  form!: FormGroup;
  isSubmitting = false;

  // Role detection
  user: RequestContext | null = null;
  isAdmin = false;
  isCustomer = false;

  constructor(
    private route: ActivatedRoute,
    public location: Location,
    private fb: FormBuilder,
    private rentalService: RentalService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.user = this.storageService.getUser();
    if (!this.user) {
      this.user = {
        userId: 66771508,
        role: 'customer'
      }
    }
    this.isAdmin = this.user?.role === 'ADMIN';
    this.isCustomer = this.user?.role === 'CUSTOMER';

    this.createForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRental(+id);
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

    // Nếu là customer → luôn disable form, không cho edit
    if (this.isCustomer) {
      this.form.disable();
    }
  }

  private loadRental(id: number): void {
    this.rentalService.getRentals({ id }).subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          this.rental = res.data[0];
          this.applyDataToForm();
        }
      },
      error: () => {
        alert('Không tải được thông tin đơn thuê');
        this.location.back();
      }
    });
  }

  private applyDataToForm(): void {
    setTimeout(() => {
      const pickup = this.rental.pickupTime ? this.toDateTimeLocal(this.rental.pickupTime) : '';
      const returnT = this.rental.returnTime ? this.toDateTimeLocal(this.rental.returnTime) : '';

      this.form.patchValue({
        ...this.rental,
        pickupTime: pickup,
        returnTime: returnT
      });

      // Customer: luôn ở view mode + disable form
      if (this.isCustomer) {
        this.mode = 'view';
        this.form.disable();
      }
      // Admin: có thể vào edit mode
      else if (this.mode === 'view') {
        this.form.disable();
      } else {
        this.enableEditableFields();
      }
    }, 0);
  }

  enterEdit(): void {
    if (!this.isAdmin) return; // Bảo vệ thêm

    this.mode = 'edit';
    this.enableEditableFields();
  }

  private enableEditableFields(): void {
    this.form.enable();
    // Vẫn khóa các field không được sửa
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

  cancel(): void {
    this.mode = 'view';
    this.applyDataToForm();
  }

  save(): void {
    if (!this.isAdmin || this.form.invalid || this.isSubmitting) return;

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
        this.applyDataToForm();
        this.isSubmitting = false;
        alert('Cập nhật thành công!');
      },
      error: () => {
        this.isSubmitting = false;
        alert('Cập nhật thất bại!');
      }
    });
  }

  // Helper thời gian
  private toDateTimeLocal(iso: string): string {
    return iso ? new Date(iso).toISOString().slice(0, 16) : '';
  }

  private fromDateTimeLocal(local: string): string {
    return local ? new Date(local).toISOString() : '';
  }

  get title(): string {
    return this.isCustomer
      ? 'Chi tiết đơn thuê xe của tôi'
      : this.mode === 'view'
        ? 'Chi tiết đơn thuê'
        : 'Chỉnh sửa đơn thuê';
  }

  // Chỉ admin và đang ở view mode mới thấy nút Cập nhật
  get canEdit(): boolean {
    return this.isAdmin && this.mode === 'view';
  }

  get showActions(): boolean {
    return this.isAdmin && this.mode === 'edit';
  }
}