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
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EditListDTO, List } from '../../models/list';
import { ListComponent } from '../list/list.component';
import { ContextMenuDirective } from '../../directives/context-menu.directive';
import { ModalComponent } from '../../ui/libs/modal/modal.component';
import { ListsService } from '../../services/lists.service';
import { SnackbarService } from '../../services/snackbar.service';
import { SaveSnippetDTO } from '../../models/snippet';
import { AuthService } from '../../services/auth.service';
import { SnippetService } from '../../services/snippets.service';

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
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private listsService = inject(ListsService);
  private snippetsService = inject(SnippetService);

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

      this.listsService
        .deleteList(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((result) => {
          console.log('delete succesful', result);
          this.openSnackbar('List deleted');
        });
    });
  }

  openSnippetModal(listId: string) {
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

      await this.snippetsService.addSnippet(newSnippet);
      this.snippetTitle = '';
      this.openSnackbar('Snippet saved');
    });
  }

  openSnackbar(message: string) {
    this.snackbarService.openSnackbar(message);
  }
}
