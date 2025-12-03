// src/app/shared/components/chatbot-floating/chatbot-floating.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule  } from '@angular/common';

@Component({
  selector: 'app-chatbot-floating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot-floating.component.html',
  styleUrls: ['./chatbot-floating.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatbotFloatingComponent {
  isOpen = false;
  hasNewMessage = false;

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.hasNewMessage = false;
  }
}