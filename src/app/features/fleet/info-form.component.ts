// src/app/features/fleet/info-form/info-form.component.ts

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { VehicleRequestDTO, VehicleResponseDTO, VehicleService } from '../../core/services/vehicle.service';
import { NgIf } from '@angular/common';

type FormMode = 'view' | 'edit' | 'create';

@Component({
  selector: 'app-info-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './info-form.component.html',
  styleUrl: './info-form.component.css'
})
export class InfoFormComponent implements OnInit, OnChanges {
  @Input() vehicle?: VehicleResponseDTO;     // ← BỎ required: true → cho phép undefined
  @Input() mode: FormMode = 'view';
  @Output() save = new EventEmitter<VehicleResponseDTO>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  isSubmitting = false;

  private emptyVehicle: VehicleResponseDTO = {
    id: 0,
    vehicleCode: '',
    licensePlate: '',
    brand: '',
    model: '',
    vehicleType: 'Sedan',
    seats: 5,
    transmission: 'Tự động',
    fuelType: 'Xăng',
    color: '',
    year: new Date().getFullYear(),
    basePrice: 0,
    status: 'AVAILABLE',
    branchId: 1,
    turnaroundMinutes: 30
  };

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.applyModeAndData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.form && (changes['vehicle'] || changes['mode'])) {
      this.applyModeAndData();
    }
  }

  private createForm(): void {
    this.form = this.fb.group({
      imageUrl: [{ value: '', visible: false }],
      id: [{ value: '', disabled: true }],
      vehicleCode: ['', [Validators.required, Validators.minLength(3)]],
      licensePlate: ['', [Validators.required, Validators.pattern(/^\d{2}[A-Z]-\d{5}$/)]],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      vehicleType: ['Sedan', Validators.required],
      seats: [5, [Validators.required, Validators.min(2)]],
      transmission: ['Tự động', Validators.required],
      fuelType: ['Xăng', Validators.required],
      color: ['', Validators.required],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
      basePrice: [0, [Validators.required, Validators.min(100000)]],
      status: ['AVAILABLE', Validators.required],
      branchId: [1, [Validators.required, Validators.min(1)]],
      turnaroundMinutes: [30, [Validators.required, Validators.min(15)]]
    });
  }

  private applyModeAndData(): void {
    this.form.reset();

    const dataToUse = this.mode === 'create' ? this.emptyVehicle : (this.vehicle || this.emptyVehicle);
setTimeout(() => {
    this.form.patchValue(dataToUse);
    console.log('Patched form with data:', dataToUse);

    if (this.mode === 'view') {
      this.form.disable();
    } else {
      this.form.enable();
          // always disable id field
      this.form.get('id')?.disable();
    }
}, 0);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const data: VehicleRequestDTO = this.form.getRawValue();

    const action$ = this.mode === 'create'
      ? this.vehicleService.addVehicle(data)
      : this.vehicleService.updateVehicle(data);

    action$.subscribe({
      next: (res) => {
        alert(this.mode === 'create' ? 'Thêm xe thành công!' : 'Cập nhật thành công!');
        this.save.emit(res.data!);
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        alert('Thao tác thất bại!');
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get title(): string {
    return {
      view: 'Chi tiết xe',
      edit: 'Chỉnh sửa xe',
      create: 'Thêm xe mới'
    }[this.mode];
  }

  get showActions(): boolean {
    return this.mode === 'edit' || this.mode === 'create';
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return control ? control.touched && control.hasError(errorName) : false;
  }
}