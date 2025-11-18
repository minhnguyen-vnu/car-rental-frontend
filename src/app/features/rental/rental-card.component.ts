// src/app/features/rental/card/rental-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RentalResponseDTO } from '../../core/services/rental.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-rental-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rental-card.component.html',
  styleUrls: ['./rental-card.component.css']
})
export class RentalCardComponent {
  @Input() rental!: RentalResponseDTO;
  @Output() viewDetail = new EventEmitter<number>();

  onViewDetail() {
    this.viewDetail.emit(this.rental.id);
  }
}