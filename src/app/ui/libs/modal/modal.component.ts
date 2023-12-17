import {
  NgClass,
  NgIf,
  NgIfContext,
  NgStyle,
  NgTemplateOutlet,
} from '@angular/common';
import {
  Component,
  Input,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

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
    // NgIf,
    // NgIfContext
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
}
