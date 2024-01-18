import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {
  ModalComponent,
  ModalComponentProps,
} from '../ui/libs/modal/modal.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private dialog = inject(MatDialog);

  openModal(options: {
    dialogOptions?: MatDialogConfig;
    componentProps?: ModalComponentProps;
  }) {
    const dialogRef = this.dialog.open(ModalComponent, {
      disableClose: true,
      ...(options.dialogOptions ?? {}),
    });

    if (options.componentProps) {
      const {
        title,
        body,
        bodyTemplateRef,
        titleTemplateRef,
        ctaTemplateRef,
        cancelButtonLabel,
        confirmButtonLabel,
      } = options.componentProps;

      // TemplateReferences take precendence over strings.
      // If none are provided, the modal component has default values.
      if (bodyTemplateRef) {
        dialogRef.componentInstance.bodyTemplateRef = bodyTemplateRef;
      } else if (body) {
        dialogRef.componentInstance.body = body;
      }

      if (titleTemplateRef) {
        dialogRef.componentInstance.titleTemplateRef = titleTemplateRef;
      } else if (title) {
        dialogRef.componentInstance.title = title;
      }

      if (ctaTemplateRef) {
        dialogRef.componentInstance.ctaTemplateRef = ctaTemplateRef;
      }

      if (cancelButtonLabel) {
        dialogRef.componentInstance.cancelButtonLabel = cancelButtonLabel;
      }

      if (confirmButtonLabel) {
        dialogRef.componentInstance.confirmButtonLabel = confirmButtonLabel;
      }
    }

    return dialogRef.afterClosed();
  }

  closeDialog() {
    this.dialog.closeAll();
  }
}
