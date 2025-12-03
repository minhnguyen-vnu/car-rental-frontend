import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChatbotFloatingComponent } from './shared/components/chatbot-floating/chatbot-floating.component';

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. Thêm ChatbotComponent vào mảng imports
  imports: [RouterOutlet, ChatbotFloatingComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  title = 'untitled1';
  showChatbot = true; // Biến cờ để quyết định hiển thị
  private router = inject(Router); // Inject Router

  ngOnInit() {
    // Lắng nghe sự kiện thay đổi đường dẫn
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Logic: Nếu URL hiện tại chứa '/login' thì ẩn chatbot, ngược lại thì hiện
      // event.urlAfterRedirects đảm bảo lấy đúng URL cuối cùng
      const isLoginPage = event.urlAfterRedirects.includes('/login');
      console.log('isLoginPage:', isLoginPage);
      this.showChatbot = !isLoginPage;
    });
  }
}