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
import { SaveSnippetDTO } from '../../models/snippet';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { SnackbarService } from '../../services/snackbar.service';
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
  @Input() activeSnippetId?: number;

  @ViewChild('editListBodyTemplateRef')
  editListBodyTemplateRef!: TemplateRef<any>;
  @ViewChild('addSnippetBodyTemplateRef')
  addSnippetBodyTemplateRef!: TemplateRef<any>;

  private dialog = inject(MatDialog);
  private snippetsStore = inject(SnippetsStore);
  private authService = inject(AuthService);

  private snackbarService = inject(SnackbarService);
  private modalService = inject(ModalService);

  listName = '';
  snippetTitle = '';
  currentUser = this.authService.session?.user;
  currentUserId = this.currentUser?.id;

  editList(list: EditListDTO) {
    const modalAfterClosed$ = this.modalService.openModal({
      dialogOptions: {
        width: '400px',
        disableClose: true,
      },
      componentProps: {
        title: 'Rename list',
        bodyTemplateRef: this.editListBodyTemplateRef,
        confirmButtonLabel: 'Save',
      },
    });

    this.listName = list.name;

    modalAfterClosed$.subscribe((confirm) => {
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

  deleteList(id: number) {
    const modalAfterClosed$ = this.modalService.openModal({
      dialogOptions: {
        width: '400px',
        disableClose: true,
      },
      componentProps: {
        title: 'Delete list',
        body: 'Are you sure you want to delete this list?',
        confirmButtonLabel: 'Delete',
      },
    });

    modalAfterClosed$.subscribe((confirm) => {
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

  addSnippet(listId: number) {
    const modalAfterClosed$ = this.modalService.openModal({
      dialogOptions: {
        width: '400px',
        disableClose: true,
      },
      componentProps: {
        title: 'Add snippet',
        bodyTemplateRef: this.addSnippetBodyTemplateRef,
        confirmButtonLabel: 'Add',
      },
    });

    modalAfterClosed$.subscribe(async (confirm) => {
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
