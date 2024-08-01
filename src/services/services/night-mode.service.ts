import { Injectable } from '@angular/core';

@Injectable()
export class NightModeService {
  private nightMode: boolean = false;

  constructor() {
    const savedMode = localStorage.getItem('nightMode');
    this.nightMode = savedMode === 'true';
    this.updateBodyClass();
  }

  toggleNightMode(): void {
    this.nightMode = !this.nightMode;
    localStorage.setItem('nightMode', this.nightMode.toString());
    this.updateBodyClass();
  }

  isNightMode(): boolean {
    return this.nightMode;
  }

  private updateBodyClass(): void {
    if (this.nightMode) {
      document.body.classList.add('night-mode');
    } else {
      document.body.classList.remove('night-mode');
    }
  }
}
