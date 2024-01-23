import { NgClass, NgStyle, NgTemplateOutlet } from '@angular/common';
import { Component, Input, TemplateRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';

export interface ModalComponentProps {
  titleTemplateRef?: TemplateRef<any | undefined>;
  bodyTemplateRef?: TemplateRef<any | undefined>;
  ctaTemplateRef?: TemplateRef<any | undefined>;
  title?: string;
  body?: string;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
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
    NgClass,
    NgStyle,
    NgTemplateOutlet,
  ],
  templateUrl: './modal.component.html',
  styles: ``,
})
export class ModalComponent {
  @Input() titleTemplateRef: TemplateRef<any> | undefined;
  @Input() bodyTemplateRef: TemplateRef<any> | undefined;
  @Input() ctaTemplateRef: TemplateRef<any> | undefined;

  @Input() title = 'Title here';
  @Input() body = 'Message here';
  @Input() confirmButtonLabel = 'Ok';
  @Input() cancelButtonLabel = 'Cancel';

  dialogRef = inject(MatDialogRef<ModalComponent>);

  titleContext = {
    title: this.title,
  };

  ctaContext = {
    close: () => this.dialogRef.close(),
  };
}
