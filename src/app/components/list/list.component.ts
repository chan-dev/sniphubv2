import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

import { List } from '../../models/list';
import { ContextMenuDirective } from '../../directives/context-menu.directive';
import { ModalComponent } from '../../ui/libs/modal/modal.component';
import { SnackbarService } from '../../services/snackbar.service';
import { UpdateSnippetDTO } from '../../models/snippet';
import { SnippetsStore } from '../../services/snippets.store';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatMenuModule,
    NgIconComponent,
    RouterLink,
    ContextMenuDirective,
  ],
  templateUrl: './list.component.html',
  styles: `
    ng-icon {
      margin-left: -3px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  @Input() list!: List;
  @Input() activeSnippetId?: string;

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  @ViewChild('editSnippetBodyTemplateRef')
  editListBodyTemplateRef!: TemplateRef<any>;

  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackbarService = inject(SnackbarService);
  private snippetsStore = inject(SnippetsStore);

  isExpanded = false;
  snippetTitle = '';

  editList(id: string) {
    console.log('editList', id);
  }
  deleteList(id: string) {
    console.log('deleteList', id);
  }

  editSnippet(id: string, title: string, listId: string) {
    this.snippetTitle = title;

    const dialogRef = this.dialog.open(ModalComponent, {
      disableClose: false,
    });

    dialogRef.componentInstance.title = 'Rename snippet';
    dialogRef.componentInstance.bodyTemplateRef = this.editListBodyTemplateRef;
    dialogRef.componentInstance.confirmButtonLabel = 'Save';

    dialogRef.afterClosed().subscribe(async (confirm) => {
      if (!confirm) {
        return;
      }

      const updatedSnippet: UpdateSnippetDTO = {
        title: this.snippetTitle,
      };

      this.snippetsStore.updateSnippet({
        id,
        list_id: listId,
        snippet: updatedSnippet,
        cb: () => {
          this.snippetTitle = '';
          this.openSnackbar('Snippet updated');
        },
      });
    });
  }
  deleteSnippet(id: string, listId: string) {
    const dialogRef = this.dialog.open(ModalComponent, {
      disableClose: false,
    });

    dialogRef.componentInstance.title = 'Delete snippet';
    dialogRef.componentInstance.body =
      'Are you sure you want to delete this snippet?';
    dialogRef.componentInstance.confirmButtonLabel = 'Delete';

    dialogRef.afterClosed().subscribe(async (confirm) => {
      if (!confirm) {
        return;
      }

      this.snippetsStore.deleteSnippet({
        id,
        list_id: listId,
        cb: () => {
          const firstNonDeletedSnippetId = Object.keys(
            this.list.snippets || {},
          ).find((snippetId) => snippetId !== id);

          if (!firstNonDeletedSnippetId) {
            this.router.navigate(['/home']);
          } else {
            this.router.navigate(['/home'], {
              queryParams: {
                snippetId: firstNonDeletedSnippetId,
              },
            });
          }
          this.openSnackbar('Snippet deleted');
        },
      });
    });
  }

  toggleList() {
    this.isExpanded = !this.isExpanded;
  }

  private openSnackbar(message: string) {
    this.snackbarService.openSnackbar(message);
  }
}
