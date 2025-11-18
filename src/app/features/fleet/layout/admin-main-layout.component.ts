// src/app/features/fleet/layouts/admin-main-layout/admin-main-layout.component.ts

import { Component } from '@angular/core';
import { SearchComponent } from '../search/search.component'; // fleet search
import { InfoFormComponent } from '../info-form.component';
import { RentalSearchComponent } from '../../rental/search/search.component'; // <-- mới thêm

type AdminTab = 'vehicle-search' | 'vehicle-add' | 'rental-manage'; // <-- mở rộng

@Component({
  selector: 'app-admin-main-layout',
  standalone: true,
  imports: [
    SearchComponent,
    InfoFormComponent,
    RentalSearchComponent  // ← import component rental search
  ],
  templateUrl: './admin-main-layout.component.html',
  styleUrl: './admin-main-layout.component.css'
})
export class AdminMainLayoutComponent {
  activeTab: AdminTab = 'vehicle-search'; // mặc định mở tab quản lý xe

  setTab(tab: AdminTab) {
    this.activeTab = tab;
  }

  onVehicleAdded() {
    this.setTab('vehicle-search');
  }
}