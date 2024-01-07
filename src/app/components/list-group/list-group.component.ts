import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Input,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { MatMenuModule } from '@angular/material/menu';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EditListDTO, List } from '../../models/list';
import { ListComponent } from '../list/list.component';
import { ContextMenuDirective } from '../../directives/context-menu.directive';
import { ListsService } from '../../services/lists.service';
import { SnackbarService } from '../../services/snackbar.service';
import { SaveSnippetDTO } from '../../models/snippet';
import { AuthService } from '../../services/auth.service';
import { SnippetService } from '../../services/snippets.service';
import { ModalService } from '../../services/modal.service';

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

  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private listsService = inject(ListsService);
  private snippetsService = inject(SnippetService);

  private snackbarService = inject(SnackbarService);
  private modalService = inject(ModalService);

  listName = '';
  snippetTitle = '';
  currentUser = this.authService.currentUser;
  currentUserId = this.currentUser?.uid;

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

      this.listsService
        .editList(editListDTO)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((result) => {
          console.log('edit succesful', result);
          this.openSnackbar('List updated');
          this.listName = '';
        });
    });
  }

  deleteList(id: string) {
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

      this.listsService
        .deleteList(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((result) => {
          console.log('delete succesful', result);
          this.openSnackbar('List deleted');
        });
    });
  }

  adSnippet(listId: string) {
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
        uid: this.currentUserId,
      };

      await this.snippetsService.addSnippet(newSnippet);
      this.snippetTitle = '';
      this.openSnackbar('Snippet saved');
    });
  }

  openSnackbar(message: string) {
    this.snackbarService.openSnackbar(message);
  }
}
