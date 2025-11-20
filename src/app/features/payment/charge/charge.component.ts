import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { PaymentFormComponent } from './payment-form/payment-form.component';

@Component({
  selector: 'app-payment-charge',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
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
    private router: Router
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
}