import { Component, OnInit } from '@angular/core';
import { RentalService, RentalRequestDTO, RentalResponseDTO } from '../../../core/services/rental.service';
import { RentalCardComponent } from '../rental-card.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service'; 
import { RequestContext } from '../../../shared/models/request-context.model';

@Component({
  selector: 'app-rental-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RentalCardComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class RentalSearchComponent implements OnInit {
  filter: RentalRequestDTO = {
    page: 0
  };
  rentals: RentalResponseDTO[] = [];
  loading = false;

  // Pagination state
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;

  isCustomerMode = false;
  currentUser: RequestContext | null = null;

  constructor(
    private rentalService: RentalService,
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.checkUserRole();
    this.search();
  }

  private checkUserRole() {
    this.currentUser = this.storageService.getUser();
    if (!this.currentUser) {
      // Mock for testing only
      this.currentUser = {
        userId: 66771508,
        role: 'USER'
      };
    }

    const role = this.currentUser?.role?.toUpperCase();
    if (role === 'USER' || role === 'CUSTOMER') {
      this.isCustomerMode = true;
      this.filter.userId = this.currentUser?.userId;
    }
  }

  // Handle manual search (button click) -> reset to page 0
  onSearchSubmit() {
    this.filter.page = 0;
    this.search();
  }

  // Handle page change
  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.filter.page = newPage;
      this.search();
    }
  }

  search() {
    this.loading = true;
    this.rentalService.getRentals(this.filter).subscribe({
      next: (res) => {
        if (res.data) {
          this.rentals = res.data.content || [];
          this.totalPages = res.data.totalPages;
          this.totalElements = res.data.totalElements;
          this.currentPage = res.data.number;
        } else {
          this.rentals = [];
          this.totalPages = 0;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.rentals = [];
      }
    });
  }

  onViewDetail(id: number) {
    if (this.isCustomerMode) {
      this.router.navigate(['/rental', id]);
      return;
    }
    this.router.navigate(['/admin/rental', id]);
  }
}