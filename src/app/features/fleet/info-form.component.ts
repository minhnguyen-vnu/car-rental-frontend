import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { 
  VehicleRequestDTO, 
  VehicleResponseDTO, 
  VehicleService, 
  VEHICLE_FEATURES_LIST, 
  VehicleFeature 
} from '../../core/services/vehicle.service';

type FormMode = 'view' | 'edit' | 'create';
type Role = 'ADMIN' | 'USER';

@Component({
  selector: 'app-info-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './info-form.component.html',
  styleUrl: './info-form.component.css'
})
export class InfoFormComponent implements OnInit, OnChanges {
  @Input() vehicle?: VehicleResponseDTO;
  @Input() mode: FormMode = 'view';
  @Input() role: Role = 'USER'; // Nhận role từ cha để phân quyền hiển thị
  
  // Sửa Output thành VehicleResponseDTO để đảm bảo có ID
  @Output() save = new EventEmitter<VehicleResponseDTO>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private vehicleService = inject(VehicleService);

  form!: FormGroup;
  isSubmitting = false;

  // Dữ liệu Features dùng cho UI
  featureGroups: { name: string; items: VehicleFeature[] }[] = [];
  selectedFeatureIds: number[] = []; // Lưu các ID tính năng đang được chọn

  private emptyVehicle: VehicleRequestDTO = {
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
    turnaroundMinutes: 30,
    featureMask: 0 // Mặc định không có tính năng nào
  };

  ngOnInit(): void {
    this.initFeatureGroups();
    this.createForm();
    this.applyModeAndData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.form && (changes['vehicle'] || changes['mode'])) {
      this.applyModeAndData();
    }
  }

  // Phân nhóm feature để hiển thị cho đẹp
  private initFeatureGroups() {
    const groupsMapping: Record<string, string> = {
      'SAFETY': 'An toàn & An ninh',
      'INTERIOR': 'Nội thất & Tiện nghi',
      'TECH': 'Công nghệ & Giải trí',
      'ASSIST': 'Hỗ trợ lái xe'
    };

    const groupMap = new Map<string, VehicleFeature[]>();
    Object.keys(groupsMapping).forEach(key => groupMap.set(key, []));

    VEHICLE_FEATURES_LIST.forEach(f => {
      const list = groupMap.get(f.group);
      if (list) list.push(f);
    });

    this.featureGroups = Array.from(groupMap.entries()).map(([key, items]) => ({
      name: groupsMapping[key],
      items
    }));
  }

  private createForm(): void {
    this.form = this.fb.group({
      id: [{ value: '', disabled: true }], // Chỉ hiển thị nếu có
      imageUrl: [''],
      
      // Các trường thông tin cơ bản
      brand: ['', Validators.required],
      model: ['', Validators.required],
      vehicleType: ['Sedan', Validators.required],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
      color: ['', Validators.required],
      seats: [5, [Validators.required, Validators.min(2)]],
      transmission: ['Tự động', Validators.required],
      fuelType: ['Xăng', Validators.required],
      basePrice: [0, [Validators.required, Validators.min(0)]],
      
      // Các trường dành riêng cho Admin (có thể validator required nếu là Admin)
      vehicleCode: [''],
      licensePlate: [''],
      branchId: [1],
      turnaroundMinutes: [30],
      status: ['AVAILABLE']
    });
  }

  public applyModeAndData(): void {
    this.form.reset();
    // 1. Xác định dữ liệu nguồn
    const data = this.mode === 'create' ? this.emptyVehicle : (this.vehicle || this.emptyVehicle);
    
    // 2. Patch dữ liệu vào form
    if (data.featureMask) {
      this.selectedFeatureIds = this.vehicleService.decodeFeatures(data.featureMask);
    } else {
      this.selectedFeatureIds = [];
    }

    // Set timeout để tránh lỗi ExpressionChangedAfterItHasBeenChecked
    setTimeout(() => {
      this.form.patchValue({
        ...data,
        id: (this.vehicle as any)?.id
      });

      // --- CẬP NHẬT LOGIC VALIDATOR CHO IMAGE URL ---
      const imageControl = this.form.get('imageUrl');
      if (this.mode === 'create') {
        // Bắt buộc nhập ảnh khi tạo mới
        imageControl?.setValidators([Validators.required]);
      } else {
        // Không bắt buộc khi edit (hoặc tùy logic của bạn)
        imageControl?.clearValidators();
      }
      imageControl?.updateValueAndValidity();
      // ----------------------------------------------

      // 3. Xử lý logic Enable/Disable theo Mode và Role
      if (this.mode === 'view') {
        this.form.disable();
      } else {
        this.form.enable();
        this.form.get('id')?.disable(); 

        if (this.role !== 'ADMIN') {
          this.form.get('vehicleCode')?.disable();
          this.form.get('licensePlate')?.disable();
          this.form.get('branchId')?.disable();
          this.form.get('turnaroundMinutes')?.disable();
          this.form.get('status')?.disable(); 
        }
      }
    });
  }

  // Checkbox toggle feature
  toggleFeature(featureId: number) {
    if (this.mode === 'view') return; // Không cho sửa khi view

    const index = this.selectedFeatureIds.indexOf(featureId);
    if (index > -1) {
      this.selectedFeatureIds.splice(index, 1);
    } else {
      this.selectedFeatureIds.push(featureId);
    }
  }

  isFeatureSelected(id: number): boolean {
    return this.selectedFeatureIds.includes(id);
  }

  onSubmit(): void {
    console.log('isAdmin:', this.isAdmin);
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.form.getRawValue();

    // Tính toán lại Feature Mask từ mảng ID đã chọn
    const calculatedMask = this.vehicleService.encodeFeatures(this.selectedFeatureIds);

    // Chuẩn bị DTO gửi đi (RequestDTO - ID có thể undefined nếu create)
    const requestData: VehicleRequestDTO = {
      ...formData,
      featureMask: calculatedMask
    };

    // Gọi API
    const action$ = this.mode === 'create'
      ? this.vehicleService.addVehicle(requestData)
      : this.vehicleService.updateVehicle(requestData);

    action$.subscribe({
      next: (res) => {
        alert(this.mode === 'create' ? 'Thêm xe thành công!' : 'Cập nhật thành công!');
        
        // Emit res.data (VehicleResponseDTO) thay vì requestData
        // res.data chắc chắn có ID từ backend trả về
        if (res.data) {
          this.save.emit(res.data);
        }
        
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        alert('Thao tác thất bại: ' + (err.error?.message || 'Lỗi hệ thống'));
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Getters cho template gọn hơn
  get isAdmin(): boolean { return this.role === 'ADMIN'; }
  get isViewMode(): boolean { return this.mode === 'view'; }
 get imageUrl(): string { return this.form.get('imageUrl')?.value; }
  
  hasError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return control ? control.touched && control.hasError(errorName) : false;
  }
}