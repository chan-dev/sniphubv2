import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NgIconComponent } from '@ng-icons/core';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

import { List } from '../../models/list';
import { ContextMenuDirective } from '../../directives/context-menu.directive';
import { ModalComponent } from '../../ui/libs/modal/modal.component';
import { SnippetService } from '../../services/snippets.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
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

  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackbarService = inject(SnackbarService);
  private snippetsService = inject(SnippetService);

  isExpanded = false;

  editList(id: string) {
    console.log('editList', id);
  }
  deleteList(id: string) {
    console.log('deleteList', id);
  }

  editSnippet(id: string) {
    console.log('editSnippet', id);
  }
  deleteSnippet(id: string, listId: string) {
    console.log('deleteList', id);

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

      await this.snippetsService.deleteSnippet(id, listId);

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
    });
  }

  toggleList() {
    this.isExpanded = !this.isExpanded;
  }

  private openSnackbar(message: string) {
    this.snackbarService.openSnackbar(message);
  }
}
