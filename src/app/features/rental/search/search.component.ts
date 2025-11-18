// src/app/features/rental/search/search.component.ts
import { Component, OnInit } from '@angular/core';
import { RentalService, RentalRequestDTO, RentalResponseDTO } from '../../../core/services/rental.service';
import { RentalCardComponent } from '../rental-card.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

  constructor(
    private rentalService: RentalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.search();
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
    this.router.navigate(['/admin/rental', id]);
  }
}