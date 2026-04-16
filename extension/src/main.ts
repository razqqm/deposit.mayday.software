/**
 * Extension entry point.
 *
 * Sets WORKER_BASE to the production API so all shared services
 * (anchor orchestrator, RFC 3161, OpenTimestamps, Ethereum) route
 * through the live Cloudflare Worker instead of relative paths.
 */
window.__MAYDAY_WORKER_BASE__ = 'https://deposit.mayday.software';

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { PopupComponent } from './popup/popup.component';

bootstrapApplication(PopupComponent, appConfig).catch((err) => console.error(err));
