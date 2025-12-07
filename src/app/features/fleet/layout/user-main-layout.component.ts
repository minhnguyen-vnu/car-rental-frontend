// user-main-layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../search/search.component';
import { RentalSearchComponent } from '../../rental/search/search.component'; 
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-main-layout',
  standalone: true,
  imports: [CommonModule,
    SearchComponent,
    RentalSearchComponent
  ],
  templateUrl: './user-main-layout.component.html',
  styleUrl: './user-main-layout.component.css'
})
export class UserMainLayoutComponent {
  
  constructor(private authService: AuthService) {}
  activeTab: string = 'vehicle-search'; // tab mặc định khi mở

  setTab(tab: string): void {
    this.activeTab = tab;
  }
  logout(): void {
    this.authService.logout();
   }
}