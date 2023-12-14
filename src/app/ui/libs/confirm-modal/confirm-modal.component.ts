import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirm-modal.component.html',
  styles: `
  :host {
    padding: theme('spacing.6');
    display: block;
  }
  `,
})
export class ConfirmModalComponent {
  dialogRef = inject(MatDialogRef<ConfirmModalComponent>);
}
