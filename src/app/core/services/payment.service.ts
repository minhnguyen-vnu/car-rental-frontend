import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GeneralResponse } from '../../shared/models/general-response.model';
import { environment } from '../../../environments/environment';

export class PaymentChargeResponseDTO {
  paymentCode!: string;
  status!: string;
  checkoutUrl!: string;
  providerTxnId?: string;
  paidAt?: string;
  refundAmount?: number;
}
export class PaymentChargeRequestDTO {
  rentalId!: number;
  userId!: number;
  amount!: number;
  currency: string = 'VND';
  method!: 'CARD';
  provider!: 'VNPAY';
  idempotencyKey!: string;
}
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  charge(request: PaymentChargeRequestDTO): Observable<GeneralResponse<PaymentChargeResponseDTO>> {
    return this.http.post<GeneralResponse<PaymentChargeResponseDTO>>(`${this.apiUrl}/charge`, request);
  }

  getByCode(paymentCode: string): Observable<GeneralResponse<any>> {
    return this.http.get<GeneralResponse<any>>(`${this.apiUrl}/${paymentCode}`);
  }
}