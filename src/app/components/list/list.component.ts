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
import { FormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

import { List } from '../../models/list';
import { ContextMenuDirective } from '../../directives/context-menu.directive';
import { SnippetService } from '../../services/snippets.service';
import { SnackbarService } from '../../services/snackbar.service';
import { UpdateSnippetDTO } from '../../models/snippet';
import { ModalService } from '../../services/modal.service';

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
  private snackbarService = inject(SnackbarService);
  private snippetsService = inject(SnippetService);
  private modalService = inject(ModalService);

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

    const modalAfterClosed$ = this.modalService.openModal({
      dialogOptions: {
        width: '400px',
        disableClose: true,
      },
      componentProps: {
        title: 'Rename snippet',
        bodyTemplateRef: this.editListBodyTemplateRef,
        confirmButtonLabel: 'Save',
      },
    });

    modalAfterClosed$.subscribe(async (confirm) => {
      if (!confirm) {
        return;
      }

      const updatedSnippet: UpdateSnippetDTO = {
        title: this.snippetTitle,
      };

      await this.snippetsService.updateSnippet(id, listId, updatedSnippet);
      this.snippetTitle = '';
      this.openSnackbar('Snippet updated');
    });
  }
  deleteSnippet(id: string, listId: string) {
    const modalAfterClosed$ = this.modalService.openModal({
      dialogOptions: {
        width: '400px',
        disableClose: true,
      },
      componentProps: {
        title: 'Delete snippet',
        body: 'Are you sure you want to delete this snippet?',
        confirmButtonLabel: 'Delete',
      },
    });

    modalAfterClosed$.subscribe(async (confirm) => {
      if (!confirm) {
        return;
      }

      await this.snippetsService.deleteSnippet(id);

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
