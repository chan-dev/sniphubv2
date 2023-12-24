import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { map, of, shareReplay, switchMap } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { serverTimestamp } from '@angular/fire/firestore';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  ionAdd,
  ionCopyOutline,
  ionChevronForward,
  ionChevronDown,
} from '@ng-icons/ionicons';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { List, NewListWithTimestampDTO } from '../../models/list';
import { ListsService } from '../../services/lists.service';
import { SnippetComponent } from '../../components/snippet/snippet.component';
import { ListComponent } from '../../components/list/list.component';
import { ListGroupComponent } from '../../components/list-group/list-group.component';
import { DropdownMenuDirective } from '../../directives/dropdown-menu.directive';
import { ModalComponent } from '../../ui/libs/modal/modal.component';
import { AuthService } from '../../services/auth.service';
import { DefaultSnippetViewComponent } from '../../components/default-snippet-view/default-snippet-view.component';
import { Snippet } from '../../models/snippet';
import { SnippetService } from '../../services/snippets.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styles: [],
  viewProviders: [
    provideIcons({
      ionAdd,
      ionCopyOutline,
      ionChevronForward,
      ionChevronDown,
    }),
  ],
  imports: [
    CommonModule,
    RouterOutlet,
    MonacoEditorModule,
    MatMenuModule,
    NgIconComponent,
    FormsModule,
    SnippetComponent,
    RouterLink,
    ListGroupComponent,
    ModalComponent,
    ListComponent,
    DropdownMenuDirective,
    DefaultSnippetViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  private listsService = inject(ListsService);
  private authService = inject(AuthService);
  private snippetsService = inject(SnippetService);

  private readonly defaultSnippet = {
    id: '',
    title: 'Untitled',
    content: '',
    language: '',
  } as Snippet;

  @ViewChild('bodyTemplateRef') bodyTemplateRef!: TemplateRef<any>;

  lists: List[] = [];
  listName = '';
  currentUser = this.authService.currentUser;
  currentUserId = this.currentUser?.uid;

  activeSnippetId$ = this.route.queryParamMap.pipe(
    map((params) => params.get('snippetId')),
    shareReplay(1),
  );

  activeSnippet$ = this.activeSnippetId$.pipe(
    switchMap((id) => {
      console.log('snippet id', id);
      if (!id) {
        return of(null);
      }
      return this.snippetsService.getSnippet(id);
    }),
  );

  ngOnInit() {
    if (!this.currentUserId) {
      return;
    }

    return this.listsService
      .getLists(this.currentUserId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lists) => {
        this.lists = lists;
        this.cdRef.markForCheck();
      });
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.log('error', { error });
    }
  }

  openListModal() {
    const dialogRef = this.dialog.open(ModalComponent, {
      disableClose: true,
    });

    dialogRef.componentInstance.title = 'Create new list';
    dialogRef.componentInstance.bodyTemplateRef = this.bodyTemplateRef;
    dialogRef.componentInstance.confirmButtonLabel = 'Create';

    dialogRef.afterClosed().subscribe((confirm) => {
      console.log('The dialog was closed', { confirm });
      if (!confirm) {
        return;
      }

      if (!this.currentUserId) {
        console.error('Not allowed to create a list without a user id');
        return;
      }

      const newList: NewListWithTimestampDTO = {
        name: this.listName,
        uid: this.currentUserId,
        created_at: serverTimestamp(),
      };

      this.listsService
        .createList(newList)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.listName = '';
          this.cdRef.markForCheck();
        });
    });
  }
}
