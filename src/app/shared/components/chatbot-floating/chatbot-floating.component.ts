import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewChecked, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleService, VehicleRequestDTO, VehicleResponseDTO } from '../../../core/services/vehicle.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MiniCardComponent } from '../mini-card/mini-card.component';

interface ChatMessage {
  type: 'user' | 'bot';
  content?: string;
  vehicles?: VehicleResponseDTO[];
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot-floating',
  standalone: true,
  imports: [CommonModule, FormsModule, MiniCardComponent],
  templateUrl: './chatbot-floating.component.html',
  styleUrls: ['./chatbot-floating.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // OnPush yêu cầu trigger thủ công trong async
})
export class ChatbotFloatingComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  
  private vehicleService = inject(VehicleService);
  private cdr = inject(ChangeDetectorRef); // 1. Inject ChangeDetectorRef

  isOpen = false;
  hasNewMessage = false;
  isLoading = false;
  userInput = '';

  messages: ChatMessage[] = [
    {
      type: 'bot',
      content: 'Xin chào! Tôi là trợ lý AI. Bạn muốn tìm xe loại nào? (Ví dụ: "Tìm xe Vinfast màu trắng giá dưới 1 triệu")',
      timestamp: new Date()
    }
  ];

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.hasNewMessage = false;
      this.scrollToBottom();
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      } catch (err) { }
    }
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const text = this.userInput.trim();
    
    this.messages.push({
      type: 'user',
      content: text,
      timestamp: new Date()
    });
    
    this.userInput = '';
    this.isLoading = true; // Bắt đầu loading

    const request: VehicleRequestDTO = {
      freeText: text,
      pickupTime: new Date().toISOString(),
      returnTime: new Date().toISOString(),
      isMeaningFull: false
    };

    this.vehicleService.getVehicles(request).subscribe({
      next: (res) => {
        this.isLoading = false; // Tắt loading
        
        // UPDATE: Lấy dữ liệu từ content vì response giờ là PagingResponse
        const vehicles = res.data?.content || [];

        if (vehicles.length === 0) {
          this.pushBotMessage('Xin lỗi, tôi không tìm thấy xe nào phù hợp với yêu cầu của bạn.');
        } else {
          console.log('Chatbot found vehicles:', vehicles);
          this.messages.push({
            type: 'bot',
            content: `Tôi tìm thấy ${vehicles.length} xe phù hợp:`,
            vehicles: vehicles,
            timestamp: new Date()
          });
          this.hasNewMessage = true;
        }

        // 2. QUAN TRỌNG: Báo cho Angular biết dữ liệu đã thay đổi để vẽ lại view
        this.cdr.markForCheck(); 
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Chatbot Error:', err);

        const errorCode = err.error?.code || err.error?.errorCode;

        if (errorCode === 2013) {
          this.pushBotMessage('Xin lỗi, câu hỏi này nằm ngoài phạm vi hỗ trợ của tôi. Tôi chỉ có thể giúp bạn tìm kiếm xe.');
        } else {
          this.pushBotMessage('Đã có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại sau.');
        }

        // 2. QUAN TRỌNG: Trigger check ở cả block error
        this.cdr.markForCheck(); 
      }
    });
  }

  private pushBotMessage(text: string) {
    this.messages.push({
      type: 'bot',
      content: text,
      timestamp: new Date()
    });
    this.hasNewMessage = true;
  }
}