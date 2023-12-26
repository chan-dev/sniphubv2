import {
  ChangeDetectionStrategy,
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
import { SnackbarService } from '../../services/snackbar.service';
import { SaveSnippetDTO } from '../../models/snippet';
import { AuthService } from '../../services/auth.service';
import { SnippetsStore } from '../../services/snippets.store';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListGroupComponent {
  @Input() lists: List[] = [];
  @Input() activeSnippetId?: string;

  @ViewChild('editListBodyTemplateRef')
  editListBodyTemplateRef!: TemplateRef<any>;
  @ViewChild('addSnippetBodyTemplateRef')
  addSnippetBodyTemplateRef!: TemplateRef<any>;

  private dialog = inject(MatDialog);
  private snippetsStore = inject(SnippetsStore);
  private authService = inject(AuthService);

  private snackbarService = inject(SnackbarService);

  listName = '';
  snippetTitle = '';
  currentUser = this.authService.currentUser;
  currentUserId = this.currentUser?.uid;

  editList(list: EditListDTO) {
    const dialogRef = this.dialog.open(ModalComponent, {
      disableClose: true,
    });

    this.listName = list.name;

    dialogRef.componentInstance.title = 'Rename list';
    dialogRef.componentInstance.bodyTemplateRef = this.editListBodyTemplateRef;
    dialogRef.componentInstance.confirmButtonLabel = 'Save';

    dialogRef.afterClosed().subscribe((confirm) => {
      if (!confirm) {
        return;
      }

      const editListDTO: EditListDTO = {
        id: list.id,
        name: this.listName,
      };

      this.snippetsStore.editList({
        list: editListDTO,
        cb: () => {
          this.openSnackbar('List updated');
          this.listName = '';
        },
      });
    });
  }

  deleteList(id: string) {
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

      this.snippetsStore.deleteList({
        id,
        cb: () => {
          this.openSnackbar('List deleted');
        },
      });
    });
  }

  addSnippet(listId: string) {
    const dialogRef = this.dialog.open(ModalComponent, {
      disableClose: false,
    });

    dialogRef.componentInstance.title = 'Add snippet';
    dialogRef.componentInstance.bodyTemplateRef =
      this.addSnippetBodyTemplateRef;
    dialogRef.componentInstance.confirmButtonLabel = 'Add';

    dialogRef.afterClosed().subscribe(async (confirm) => {
      if (!confirm) {
        return;
      }

      if (!this.currentUserId) {
        console.error('Not allowed to add a snippet without a user id');
        return;
      }

      const newSnippet: SaveSnippetDTO = {
        content: '',
        language: '',
        list_id: listId,
        title: this.snippetTitle,
        user_id: this.currentUserId,
      };

      this.snippetsStore.addSnippet({
        snippet: newSnippet,
        cb: () => {
          this.snippetTitle = '';
          this.openSnackbar('Snippet added');
        },
      });
    });
  }

  openSnackbar(message: string) {
    this.snackbarService.openSnackbar(message);
  }
}
