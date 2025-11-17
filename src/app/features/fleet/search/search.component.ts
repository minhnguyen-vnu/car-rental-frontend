import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VehicleCardComponent } from '../vehicle-card.component';
import { VehicleService, VehicleRequestDTO, VehicleResponseDTO } from '../../../core/services/vehicle.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    FormsModule,       // ← BẮT BUỘC cho ngModel + #searchForm
    CommonModule,      // ← BẮT BUỘC cho *ngIf, *ngFor (nếu còn dùng)
    VehicleCardComponent   // ← import card con
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  request: VehicleRequestDTO = {};
  vehicles: VehicleResponseDTO[] = [];
  loading = false;

  constructor(private vehicleService: VehicleService) {}

  search() {
    this.loading = true;
    this.vehicleService.getVehicles(this.request).subscribe({
      next: (res) => {
        this.vehicles = res.data || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onViewDetail(id: number) {
    console.log('Xem chi tiết xe:', id);
    // this.router.navigate(['/vehicle', id]);
  }
}