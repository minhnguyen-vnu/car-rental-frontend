// src/app/features/fleet/search/search.component.ts

import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VehicleCardComponent } from '../vehicle-card.component';
import { VehicleService, VehicleRequestDTO, VehicleResponseDTO } from '../../../core/services/vehicle.service';

type Role = 'admin' | 'customer';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, VehicleCardComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  @Input() role: Role = 'customer';  // ← Nhận từ cha (admin-main-layout hoặc user-main-layout)

  request: VehicleRequestDTO = {};
  vehicles: VehicleResponseDTO[] = [];
  loading = false;

  constructor(
    private vehicleService: VehicleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.search(); // Tự động load lần đầu
  }

  search() {
    this.loading = true;
    this.vehicleService.getVehicles(this.request).subscribe({
      next: (res) => {
        this.vehicles = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.vehicles = [];
        this.loading = false;
      }
    });
  }

  // ← Hàm quan trọng nhất: điều hướng đúng theo role
  onViewDetail(id: number) {
    if (this.role === 'admin') {
      this.router.navigate(['/admin/vehicle', id]);
    } else {
      this.router.navigate(['/vehicle', id]);
    }
  }
}