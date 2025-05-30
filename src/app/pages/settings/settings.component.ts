import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { LoggerService, LogLevel } from '../../services/logger.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { StorageStatsComponent } from '../../components/storage-stats/storage-stats.component';
import { ThemeService } from '../../services/theme.service';
import { NostrService } from '../../services/nostr.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { ApplicationStateService } from '../../services/application-state.service';
import { ApplicationService } from '../../services/application.service';
import { PrivacySettingsComponent } from '../../components/privacy-settings/privacy-settings.component';
import { LogsSettingsComponent } from '../../components/logs-settings/logs-settings.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    RouterModule,
    MatListModule,
    MatDividerModule,
    MatTabsModule,
    StorageStatsComponent,
    PrivacySettingsComponent,
    LogsSettingsComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private logger = inject(LoggerService);
  currentLogLevel = signal<LogLevel>(this.logger.logLevel());
  themeService = inject(ThemeService);
  nostrService = inject(NostrService);
  storage = inject(StorageService);
  appState = inject(ApplicationStateService);
  app = inject(ApplicationService);
  dialog = inject(MatDialog);
  router = inject(Router);

  // Track active tab
  activeTabIndex = signal(0);

  constructor() {
    // Keep the current log level in sync with the service
    effect(() => {
      this.currentLogLevel.set(this.logger.logLevel());
    });
  }

  setLogLevel(level: LogLevel): void {
    debugger;
    this.logger.setLogLevel(level);
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
  
  logout() {
    this.nostrService.logout();
  }
  
  // showLoginDialog(): void {
  //   this.dialog.open(LoginDialogComponent, {
  //     width: '500px',
  //     disableClose: true
  //   });
  // }
  
  wipeData(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Data Deletion',
        message: 'Are you sure you want to delete all app data? This action cannot be undone.',
        confirmButtonText: 'Delete All Data'
      }
    });

    dialogRef.afterClosed().subscribe(async confirmed => {
      if (confirmed) {
        await this.app.wipe();
      }
    });
  }
}
