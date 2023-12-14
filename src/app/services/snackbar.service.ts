import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private snackbar = inject(MatSnackBar);

  openSnackbar(message: string, config?: MatSnackBarConfig) {
    this.snackbar.open(message, 'Close', {
      ...(config ?? {}),
      duration: 3000,
      verticalPosition: 'top',
    });
  }
}
