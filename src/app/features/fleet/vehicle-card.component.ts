import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { VehicleResponseDTO } from '../../core/services/vehicle.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-vehicle-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vehicle-card.component.html',
  styleUrls: ['./vehicle-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush   // bonus tốc độ
})
export class VehicleCardComponent {
  @Input({ required: true }) vehicle!: VehicleResponseDTO;
  @Output() viewDetail = new EventEmitter<number>();

  onViewDetail() {
    this.viewDetail.emit(this.vehicle.id);
  }
}