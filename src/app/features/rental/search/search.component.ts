// src/app/features/rental/search/search.component.ts
import { Component, OnInit } from '@angular/core';
import { RentalService, RentalRequestDTO, RentalResponseDTO } from '../../../core/services/rental.service';
import { RentalCardComponent } from '../rental-card.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';  // thêm dòng này
import { RequestContext } from '../../../shared/models/request-context.model';

@Component({
  selector: 'app-rental-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RentalCardComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class RentalSearchComponent implements OnInit {
  filter: RentalRequestDTO = {};
  rentals: RentalResponseDTO[] = [];
  loading = false;

  // Thêm 2 biến mới
  isCustomerMode = false;
  currentUser: RequestContext | null = null;

  constructor(
    private rentalService: RentalService,
    private router: Router,
    private storageService: StorageService   // thêm inject
  ) {}

  ngOnInit() {
    this.checkUserRole();
    this.search();
  }

  private checkUserRole() {
    this.currentUser = this.storageService.getUser();
    if (!this.currentUser) {
      alert('mock user cho mục đích thử nghiệm');
      this.currentUser = {
        userId: 66771508,
        role: 'USER'
      };
    }

    const role = this.currentUser?.role?.toUpperCase();
    if (role === 'USER' || role === 'CUSTOMER') {
      this.isCustomerMode = true;
      this.filter.userId = this.currentUser?.userId;  // tự động điền và khóa
    }
  }

  search() {
    this.loading = true;
    this.rentalService.getRentals(this.filter).subscribe({
      next: (res) => {
        this.rentals = res.data || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onViewDetail(id: number) {
    // Admin và customer cùng xem chi tiết ở link giống nhau (sau này bạn có thể đổi)
    if (this.isCustomerMode) {
      this.router.navigate(['/rental', id]);
      return;
    }
    this.router.navigate(['/admin/rental', id]);
  }
}