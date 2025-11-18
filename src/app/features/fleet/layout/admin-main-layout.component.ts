// src/app/features/fleet/layouts/admin-main-layout/admin-main-layout.component.ts

import { Component } from '@angular/core';
import { SearchComponent } from '../search/search.component';
import { InfoFormComponent } from '../info-form.component';

type AdminTab = 'search' | 'add';

@Component({
  selector: 'app-admin-main-layout',
  standalone: true,
  imports: [SearchComponent, InfoFormComponent],
  templateUrl: './admin-main-layout.component.html',
  styleUrl: './admin-main-layout.component.css'
})
export class AdminMainLayoutComponent {
  activeTab: AdminTab = 'search';

  setTab(tab: AdminTab) {
    this.activeTab = tab;
  }

  onVehicleAdded() {
    this.activeTab = 'search'; // Sau khi thêm xong → quay về tab tìm kiếm
    // Có thể gọi refresh search nếu cần
  }
}