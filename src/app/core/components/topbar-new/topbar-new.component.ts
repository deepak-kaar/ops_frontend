import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PrimeNgModules } from '../../modules/primeng.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth/auth.service';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-topbar-new',
  standalone: true,
  templateUrl: './topbar-new.component.html',
  styleUrl: './topbar-new.component.css',
  imports: [PrimeNgModules, CommonModule, FormsModule, MenuModule]
})
export class TopbarNewComponent implements OnInit {
  @Output() menuToggle = new EventEmitter<void>();
  @Output() labelChange = new EventEmitter<void>();
  @Output() selectedLabelChange = new EventEmitter<string | null>();

  @Input() showRolloutLabel: boolean = false;
  @Input() labels: string[] = [];
  @Input() selectedLabel: string | null = null;

  currentUser: User | null = null;
  userMenuItems: MenuItem[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Setup user menu items
    this.userMenuItems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => this.onProfile()
      },
      {
        separator: true
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.onLogout()
      }
    ];
  }

  onMenuClick(): void {
    this.menuToggle.emit();
  }

  onLabelChange(): void {
    this.selectedLabelChange.emit(this.selectedLabel);
    this.labelChange.emit();
  }

  onProfile(): void {
    // Navigate to profile page if needed
    console.log('Profile clicked');
  }

  onLogout(): void {
    this.authService.logout();
  }

  getUserDisplayName(): string {
    if (this.currentUser) {
      return this.currentUser.displayName || this.currentUser.userName;
    }
    return 'Guest';
  }

  getUserRoles(): string {
    if (this.currentUser && this.currentUser.roles && this.currentUser.roles.length > 0) {
      return this.currentUser.roles[0]; // Show first role
    }
    return 'User';
  }
}
