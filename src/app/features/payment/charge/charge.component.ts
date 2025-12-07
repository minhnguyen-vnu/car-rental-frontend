import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common'; // <--- 1. Thêm Import Location
import { ReactiveFormsModule } from '@angular/forms';
import { PaymentFormComponent } from './payment-form/payment-form.component';

@Component({
  selector: 'app-payment-charge',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaymentFormComponent
  ],
  templateUrl: './charge.component.html',
  styleUrls: ['./charge.component.css']
})
export class PaymentChargeComponent implements OnInit {
  selectionForm!: FormGroup;
  showPaymentForm = false;

  rentalId!: number;
  amount!: number;

  methods = ['CARD'];
  providers = ['VNPAY'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location // <--- 2. Inject Location
  ) {}

  ngOnInit(): void {
    this.rentalId = +this.route.snapshot.queryParamMap.get('rentalId')!;
    this.amount = +this.route.snapshot.queryParamMap.get('amount')!;

    if (!this.rentalId || !this.amount) {
      alert('Thiếu thông tin thanh toán');
      this.router.navigate(['/']);
      return;
    }

    this.selectionForm = this.fb.group({
      method: ['CARD', Validators.required],
      provider: ['VNPAY', Validators.required]
    });
  }

  onContinue() {
    if (this.selectionForm.invalid) {
      this.selectionForm.markAllAsTouched();
      return;
    }
    this.showPaymentForm = true;
  }

  onBackFromForm() {
    this.showPaymentForm = false;
  }

  onPaymentSuccess(url: string) {
    window.location.href = url;
  }

 onBack() {
    this.location.back(); // <--- 3. Quay lại trang trước đó trong history
  }
}