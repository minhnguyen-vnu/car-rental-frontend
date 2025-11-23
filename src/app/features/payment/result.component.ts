import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css'],
  imports: [CommonModule]
})
export class PaymentResultComponent implements OnInit {

  isSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
   this.isSuccess = this.route.snapshot.data['success'] === true;
  }

  goBack(): void {
    this.router.navigate(['/user']);
  }
}