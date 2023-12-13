import { Component, NgModule, inject } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

interface DialogData {
  list: string;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './modal.component.html',
  styles: ``,
})
export class ModalComponent {
  dialogRef = inject(MatDialogRef<ModalComponent>);
  data = inject<DialogData>(MAT_DIALOG_DATA);
}
