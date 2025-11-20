import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaymentChargeRequestDTO, PaymentService } from '../../../../core/services/payment.service';
import { StorageService } from '../../../../core/services/storage.service';
import { v4 as uuidv4 } from 'uuid';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.css']
})
export class PaymentFormComponent {
  @Input() rentalId!: number;
  @Input() amount!: number;
  @Output() success = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();

  loading = false;

  constructor(
    private paymentService: PaymentService,
    private storageService: StorageService
  ) {}

  onConfirmPayment() {
    if (this.loading) return;

    const user = this.storageService.getUser();
    const userId = user?.userId || 66771508;

    const request: PaymentChargeRequestDTO = {
      rentalId: this.rentalId,
      userId: userId,
      amount: this.amount,
      currency: 'VND',
      method: 'CARD',
      provider: 'VNPAY',
      idempotencyKey: uuidv4()
    };

    this.loading = true;

    this.paymentService.charge(request).subscribe({
      next: (res) => {
        const url = res.data?.checkoutUrl;
        if (url) {
          this.success.emit(url);
        } else {
          alert('Không nhận được link thanh toán');
          this.loading = false;
        }
      },
      error: (err) => {
        console.error(err);
        alert('Thanh toán thất bại. Vui lòng thử lại.');
        this.loading = false;
      }
    });
  }

  onBack() {
    this.back.emit();
  }
}