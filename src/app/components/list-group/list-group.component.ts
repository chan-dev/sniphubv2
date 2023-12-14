import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';

import { EditListDTO, List } from '../../models/list';
import { ListComponent } from '../list/list.component';
import { ContextMenuDirective } from '../../directives/context-menu.directive';
import { ModalComponent } from '../../ui/libs/modal/modal.component';
import { ConfirmModalComponent } from '../../ui/libs/confirm-modal/confirm-modal.component';
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
    MatMenuModule,
    NgIconComponent,
    ListComponent,
    ContextMenuDirective,
  ],
})
export class ListGroupComponent {
  @Input() lists: List[] = [];
  @Input() activeSnippetId?: string;

  private listsService = inject(ListsService);
  private dialog = inject(MatDialog);
  private snackbarService = inject(SnackbarService);

  editList(list: EditListDTO) {
    console.log('editList', list);

    const dialogRef = this.dialog.open(ModalComponent, {
      disableClose: true,
      data: {
        listName: list.name,
      },
    });

    dialogRef.afterClosed().subscribe((listName) => {
      const editListDTO: EditListDTO = {
        id: list.id,
        name: listName,
      };

      this.listsService.editList(editListDTO).subscribe((result) => {
        console.log('edit succesful', result);
        this.openSnackbar('List updated');
      });
    });
  }

  deleteList(id: string) {
    console.log('deleteList', id);

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((shouldDelete) => {
      if (!shouldDelete) {
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
