import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { NostrService } from "./nostr.service";
import { StorageService } from "./storage.service";
import { Router, RouterLink, RouterModule } from "@angular/router";
import { LoggerService } from "./logger.service";
import { ApplicationStateService } from "./application-state.service";
import { ThemeService } from "./theme.service";
import { NotificationService } from "./notification.service";

@Injectable({
    providedIn: 'root'
})
export class ApplicationService {
    nostrService = inject(NostrService);
    storage = inject(StorageService);
    router = inject(Router);
    logger = inject(LoggerService);
    appState = inject(ApplicationStateService);
    theme = inject(ThemeService);
    notificationService = inject(NotificationService);

    /** Check the status on fully initialized, which ensures Nostr, Storage and user is logged in. */
    initialized = computed(() => this.nostrService.initialized() && this.storage.initialized());

    /** User is "authenticated" if there is any account set. This will read from local storage on start up,
     so no need to wait to check it. */
    authenticated = computed(() => this.nostrService.account());

    /** Used to check if both initialized and authenticated. Used to wait for both conditions. */
    // initializedAndAuthenticated = computed(() => this.initialized() && this.authenticated());

    loadingMessage = signal('Loading data...');
    showSuccess = signal(false);
    isLoading = signal(false);

    constructor() {
        // Set up effect to load notifications when app is initialized and authenticated
        effect(() => {
            if (this.authenticated()) {
                this.loadAppData();
            }
        });
    }

    reload() {
        // Reload the application
        window.location.reload();
    }

    private async loadAppData(): Promise<void> {
        this.logger.info('Application initialized and authenticated, loading app data');

        // Load notifications from storage
        if (!this.notificationService.notificationsLoaded()) {
            await this.notificationService.loadNotifications();
        }

        // Add any other app data loading here in the future
    }

    async wipe() {
        this.nostrService.reset();

        // Clear known localStorage keys related to the app
        const keysToRemove = [
            this.appState.ACCOUNT_STORAGE_KEY,
            this.appState.ACCOUNTS_STORAGE_KEY,
            this.appState.BOOTSTRAP_RELAYS_STORAGE_KEY,
            this.appState.PEOPLE_VIEW_MODE,
            this.appState.MEDIA_ACTIVE_TAB,
            this.logger.LOG_LEVEL_KEY,
            this.theme.THEME_KEY
        ];

        for (let i = 0; i < keysToRemove.length; i++) {
            localStorage.removeItem(keysToRemove[i]);
        }

        // Clear notifications from memory
        this.notificationService.clearNotifications();

        await this.storage.wipe(); // Assuming this method clears all app data

        // Navigate to home page before reloading
        await this.router.navigate(['/']);

        // Reload the application
        window.location.reload();
    }
}