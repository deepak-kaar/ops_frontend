import { Injectable } from '@angular/core';

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class LlmChatboxService {

  initialMessage = {
    id: '1',
    content: 'Hello! I\'m your AI assistant. I can help you with code, explanations, and much more. Try asking me to write some code!',
    isUser: false,
    timestamp: new Date()
  }

  private messages: Message[] = [
    this.initialMessage
  ];

  getMessages(): Message[] {
    return this.messages;
  }

  addMessage(message: Message): void {
    this.messages.push(message);
  }

  clearMessages(): void {
    this.messages = [
      this.initialMessage
    ];
  }
}
