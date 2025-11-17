import { Component } from '@angular/core';
import { VehicleRequestDTO, VehicleResponseDTO, VehicleService } from '../../../core/services/vehicle.service';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
  imports: [FormsModule],
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  request: VehicleRequestDTO = {};
  vehicles: VehicleResponseDTO[] = [];
  loading = false;

  displayedColumns: (keyof VehicleResponseDTO)[] = [
    'id', 'vehicleCode', 'licensePlate', 'brand', 'model', 'vehicleType',
    'seats', 'transmission', 'fuelType', 'color', 'year', 'basePrice',
    'status', 'branchId', 'turnaroundMinutes'
  ];

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
}