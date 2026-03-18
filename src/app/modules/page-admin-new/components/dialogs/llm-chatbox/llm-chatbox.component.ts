import { Component, ElementRef, ViewChild } from '@angular/core';
import { PageAdministratorService } from '../../../page-administrator.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from 'primeng/api';
import { LlmChatboxService } from './llm-chatbox.service';

interface CodeBlock {
  code: string;
  language?: string;
  expanded?: boolean;
  readonly?: boolean;
}
interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  codeBlocks?: CodeBlock[];
}
@Component({
  selector: 'app-llm-chatbox',
  standalone: false,
  templateUrl: './llm-chatbox.component.html',
  styleUrl: './llm-chatbox.component.css'
})
export class LlmChatboxComponent {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  // Monaco Editor options
  monacoOptions = {
    theme: 'vs-dark',
    language: 'json',
    // readOnly: true,
    // minimap: { enabled: false },
    // fontSize: 14,
    // lineNumbers: 'on' as const,
    // roundedSelection: false,
    // scrollBeyondLastLine: false,
    // automaticLayout: true,
    // wordWrap: 'on' as const,
    // folding: true,
    // renderLineHighlight: 'none' as const,
    // contextmenu: true,
    // selectOnLineNumbers: true
  };

  messages: Message[] = [];

  currentMessage = '';
  isTyping = false;
  private shouldScrollToBottom = false;

  constructor(private pageAdminService: PageAdministratorService,
    private chatService: LlmChatboxService) {
    this.messages = this.chatService.getMessages();

    if (this.messages.length > 0) {
      this.shouldScrollToBottom = true;
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  trackByMessage(index: number, message: Message): string {
    return message.id;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage() {
    if (!this.currentMessage.trim() || this.isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: this.currentMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    //this.messages.push(userMessage);
    this.chatService.addMessage(userMessage);
    const messageToProcess = this.currentMessage.trim();
    this.currentMessage = '';
    this.shouldScrollToBottom = true;

    // Simulate AI response
    this.simulateAIResponse(messageToProcess);
  }

  private simulateAIResponse(userMessage: string) {
    this.isTyping = true;
    this.shouldScrollToBottom = true;

    // Check if user is asking for code
    const codeKeywords = ['code', 'function', 'component', 'write', 'create', 'build', 'implement', 'angular', 'typescript', 'javascript', 'page'];
    const isCodeRequest = codeKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));

    // Simulate thinking time
    setTimeout(() => {
      if (isCodeRequest) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `Here's a code example for "${userMessage}":`,
          isUser: false,
          timestamp: new Date(),
          codeBlocks: [
            {
              code: this.generateSampleCode(userMessage),
              language: this.detectLanguage(userMessage),
              expanded: false,
              readonly: true
            }
          ]
        };
        //this.messages.push(aiResponse);
        this.chatService.addMessage(aiResponse);

        this.isTyping = false;
        this.shouldScrollToBottom = true;
      } else {
        this.generateTextResponse(userMessage)
          .then(response => {

            let aiResponse: Message;

            if (typeof response === 'string') {
              aiResponse = {
                id: (Date.now() + 1).toString(),
                content: response,
                isUser: false,
                timestamp: new Date()
              };
            } else if (typeof response === 'object' && response !== null) {
              aiResponse = {
                id: (Date.now() + 1).toString(),
                content: `Here's a code example for "${userMessage}":`,
                isUser: false,
                timestamp: new Date(),
                codeBlocks: [
                  {
                    code: JSON.stringify(response, null, 2),
                    expanded: false,
                    readonly: true
                  }
                ]
              };
            } else {
              // ✅ Handle unexpected response types
              aiResponse = {
                id: (Date.now() + 1).toString(),
                content: 'Unexpected response format.',
                isUser: false,
                timestamp: new Date()
              };
            }

            // Send to chat service
            this.chatService.addMessage(aiResponse);
            this.isTyping = false;
            this.shouldScrollToBottom = true;

          })
          .catch(err => {
            const errorResponse: Message = {
              id: (Date.now() + 1).toString(),
              content: `Error: ${err}`,
              isUser: false,
              timestamp: new Date()
            };

            this.chatService.addMessage(errorResponse);

            this.isTyping = false;
            this.shouldScrollToBottom = true;
          });

      }
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5s
  }

  private generateTextResponse(userMessage: string): Promise<any> {

    let llmRes = "";
    const responses = [
      `I understand you're asking about "${userMessage}". That's an interesting topic! Let me help you with that.`,
      `Thank you for your question about "${userMessage}". Here's what I think about it...`,
      `Great question! Regarding "${userMessage}", I'd be happy to share some insights.`,
      `I see you're interested in "${userMessage}". This is definitely something worth exploring further.`
    ];

    const payload = {
      "prompt": userMessage
    }

    //Geeting Response from LLM
    return new Promise((resolve, reject) => {
      this.pageAdminService.postPrompt(payload).subscribe({
        next: (res: any) => {
          console.log("AI result", res);
          const firstKey = Object.keys(res)[0];
          resolve(res[firstKey]);
        },
        error: () => {
          reject("Error in generating response from LLM");
        }
      });
    });

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const additionalInfo = [
      ' Would you like me to elaborate on any specific aspect?',
      ' Is there anything particular you\'d like to know more about?',
      ' I can provide more detailed information if you\'re interested.',
      ' Feel free to ask follow-up questions!'
    ];

    //return randomResponse + additionalInfo[Math.floor(Math.random() * additionalInfo.length)];
  }



  private generateSampleCode(userMessage: string): string {
    // Generate different code samples based on the request
    if (userMessage.toLowerCase().includes('component')) {
      return `import { Component } from '@angular/core';

@Component({
  selector: 'app-example',
  template: \`
    <div class="example-component">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
      <button (click)="handleClick()" class="btn-primary">
        {{ buttonText }}
      </button>
      <div *ngIf="showMessage" class="message">
        {{ message }}
      </div>
    </div>
  \`,
  styles: [\`
    .example-component {
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .btn-primary:hover {
      background-color: #0056b3;
    }
    
    .message {
      margin-top: 15px;
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
  \`]
})
export class ExampleComponent {
  title = 'Example Component';
  description = 'This is a sample Angular component with enhanced features';
  buttonText = 'Click me';
  message = 'Button was clicked!';
  showMessage = false;

  handleClick() {
    this.showMessage = !this.showMessage;
    console.log('Button clicked! Message visibility:', this.showMessage);
  }
}`;
    } else if (userMessage.toLowerCase().includes('function')) {
      return `// Example function based on your request
function processData(input: string[]): { [key: string]: number } {
  const result: { [key: string]: number } = {};
  
  input.forEach((item, index) => {
    result[item] = index + 1;
  });
  
  return result;
}

// Usage example
const data = ['apple', 'banana', 'cherry'];
const processed = processData(data);
console.log(processed); // { apple: 1, banana: 2, cherry: 3 }`;
    } else if (userMessage.toLowerCase().includes('service')) {
      return `import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly apiUrl = 'https://api.example.com/v1';
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    })
  };

  constructor(private http: HttpClient) {}

  // GET request with query parameters
  getData(params?: any): Observable<ApiResponse<any[]>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }

    return this.http.get<ApiResponse<any[]>>(\`\${this.apiUrl}/data\`, {
      ...this.httpOptions,
      params: httpParams
    }).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  // POST request
  createData(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(\`\${this.apiUrl}/data\`, data, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // PUT request
  updateData(id: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(\`\${this.apiUrl}/data/\${id}\`, data, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // DELETE request
  deleteData(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(\`\${this.apiUrl}/data/\${id}\`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}`;
    } else {
      return `{
  "column": 24,
  "handle": ".drag-handle",
  "margin": 2,
  "float": true,
  "minRow": 1,
  "subGridDynamic": true,
  "subGridOpts": {
    "cellHeight": 50,
    "column": 24,
    "acceptWidgets": true,
    "margin": 2,
    "subGridDynamic": true,
    "float": true
  },
  "animate": false,
  "draggable": {
    "handle": ".drag-handle"
  },
  "cellHeight": 50,
  "children": [
    {
      "id": "grid-item-1",
      "w": 24,
      "y": 0,
      "x": 0,
      "selector": "app-label",
      "input": {
        "label": "Label",
        "style": {
          "paddingLeft": "10",
          "fontFamily": "manifapro",
          "fontSize": 17,
          "color": "#a01313",
          "textAlign": "Left",
          "raised": false,
          "rounded": false,
          "text": false,
          "outlined": false,
          "borderColors": [
            "#FF9F40",
            "#4BC0C0",
            "#36A2EB"
          ],
          "backgroundColors": [
            "#4CAF50",
            "#2196F3",
            "#FFEB3B"
          ],
          "tooltipColor": "#ffffff",
          "tooltipBgColor": "#000000",
          "gridColor": "#dfe7ef",
          "bgColor": "#2196F3",
          "borderColor": "#2196F3",
          "pBorderColor": "#2196F3",
          "phBgColor": "#2196F3",
          "phBorderColor": "#2196F3",
          "bg1": "#2196F3",
          "bg2": "#4CAF50",
          "buttonBar": false,
          "selectionRange": false,
          "month": false,
          "year": false,
          "paddingRight": "0",
          "paddingTop": "0",
          "paddingBottom": "0",
          "borderTopStyle": "solid",
          "borderBottomStyle": "solid",
          "borderLeftStyle": "solid",
          "borderRightStyle": "solid",
          "borderTopWidth": "0",
          "borderBottomWidth": "0",
          "borderLeftWidth": "0",
          "borderRightWidth": "0",
          "borderTopColor": "black",
          "borderBottomColor": "black",
          "borderLeftColor": "black",
          "borderRightColor": "black"
        }
      },
      "inputOdt": {
        "label": "",
        "style": {
          "paddingLeft": 10
        }
      }
    },
    {
      "id": "grid-item-2",
      "w": 24,
      "selector": "app-date-picker",
      "input": {
        "date": "2025-06-15T10:10:41.379Z"
      },
      "inputOdt": {
        "style": {
          "buttonBar": false
        },
        "date": ""
      },
      "x": 0,
      "y": 1
    }
  ]
}`;
    }
  }

  private detectLanguage(userMessage: string): string {
    const message = userMessage.toLowerCase();
    if (message.includes('angular') || message.includes('component') || message.includes('typescript')) {
      return 'typescript';
    } else if (message.includes('javascript') || message.includes('js')) {
      return 'javascript';
    } else if (message.includes('html')) {
      return 'html';
    } else if (message.includes('css') || message.includes('scss')) {
      return 'css';
    } else if (message.includes('json')) {
      return 'json';
    } else if (message.includes('python')) {
      return 'python';
    } else if (message.includes('java')) {
      return 'java';
    } else if (message.includes('sql')) {
      return 'sql';
    }
    return 'typescript'; // default
  }

  getMonacoOptions(language?: string) {
    return {
      ...this.monacoOptions,
      language: language || 'typescript'
    };
  }

  toggleCodeExpansion(messageId: string, codeBlockIndex: number) {
    const message = this.messages.find(m => m.id === messageId);
    if (message && message.codeBlocks && message.codeBlocks[codeBlockIndex]) {
      message.codeBlocks[codeBlockIndex].expanded = !message.codeBlocks[codeBlockIndex].expanded;
    }
  }

  onCodeChange(codeBlock: CodeBlock, newCode: string) {
    // Handle code changes if needed (for editable code blocks)
    if (!codeBlock.readonly) {
      codeBlock.code = newCode;
    }
  }

  formatMessage(content: string): string {
    // Simple formatting - you can enhance this with markdown parsing
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      // You can add a toast notification here
      console.log('Code copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy code:', err);
    });
  }

  private scrollToBottom() {
    try {
      const scrollPanel = this.messagesContainer.nativeElement.querySelector('.p-scrollpanel-content');
      if (scrollPanel) {
        scrollPanel.scrollTop = scrollPanel.scrollHeight;
      }
    } catch (err) {
      console.warn('Could not scroll to bottom:', err);
    }
  }
}
