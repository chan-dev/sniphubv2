import {
  Component,
  Input,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';

import { EditListDTO, List } from '../../models/list';
import { ListComponent } from '../list/list.component';
import { ContextMenuDirective } from '../../directives/context-menu.directive';
import { ModalComponent } from '../../ui/libs/modal/modal.component';
import { ListsService } from '../../services/lists.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-list-group',
  standalone: true,
  templateUrl: './list-group.component.html',
  styles: `
  :host {
    display: block;
    width: 100%;
  }
  `,
  imports: [
    CommonModule,
    FormsModule,
    MatMenuModule,
    NgIconComponent,
    ListComponent,
    ContextMenuDirective,
  ],
})
export class ListGroupComponent {
  @Input() lists: List[] = [];
  @Input() activeSnippetId?: string;

  @ViewChild('bodyTemplateRef') bodyTemplateRef!: TemplateRef<any>;

  private listsService = inject(ListsService);
  private dialog = inject(MatDialog);
  private snackbarService = inject(SnackbarService);

  listName = '';

  editList(list: EditListDTO) {
    console.log('editList', list);

    const dialogRef = this.dialog.open(ModalComponent, {
      disableClose: true,
    });

    this.listName = list.name;

    dialogRef.componentInstance.title = 'Edit list';
    dialogRef.componentInstance.bodyTemplateRef = this.bodyTemplateRef;
    dialogRef.componentInstance.confirmButtonLabel = 'Save';

    dialogRef.afterClosed().subscribe((confirm) => {
      if (!confirm) {
        return;
      }

      const editListDTO: EditListDTO = {
        id: list.id,
        name: this.listName,
      };

      this.listsService.editList(editListDTO).subscribe((result) => {
        console.log('edit succesful', result);
        this.openSnackbar('List updated');
        this.listName = '';
      });
    });
  }

  deleteList(id: string) {
    console.log('deleteList', id);

    const dialogRef = this.dialog.open(ModalComponent, {
      disableClose: false,
    });

    dialogRef.componentInstance.title = 'Delete list';
    dialogRef.componentInstance.body =
      'Are you sure you want to delete this list?';
    dialogRef.componentInstance.confirmButtonLabel = 'Delete';

    dialogRef.afterClosed().subscribe((confirm) => {
      if (!confirm) {
        return;
      }

      this.listsService.deleteList(id).subscribe((result) => {
        console.log('delete succesful', result);
        this.openSnackbar('List deleted');
      });
    });
  }

  openSnackbar(message: string) {
    this.snackbarService.openSnackbar(message);
  }
}
