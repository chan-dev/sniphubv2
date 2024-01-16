import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
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
import { Subject, map, of, shareReplay, switchMap } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  ionAdd,
  ionCopyOutline,
  ionChevronForward,
  ionChevronDown,
} from '@ng-icons/ionicons';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { List, NewListDTO } from '../../models/list';
import { ListsService } from '../../services/lists.service';
import { SnippetComponent } from '../../components/snippet/snippet.component';
import { ListComponent } from '../../components/list/list.component';
import { ListGroupComponent } from '../../components/list-group/list-group.component';
import { DropdownMenuDirective } from '../../directives/dropdown-menu.directive';
import { ModalComponent } from '../../ui/libs/modal/modal.component';
import { DefaultSnippetViewComponent } from '../../components/default-snippet-view/default-snippet-view.component';
import { Snippet } from '../../models/snippet';
import { SnippetService } from '../../services/snippets.service';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';

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
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private renderer = inject(Renderer2);
  private listsService = inject(ListsService);
  private authService = inject(AuthService);
  private snippetsService = inject(SnippetService);
  private modalService = inject(ModalService);

  private removeSearchEventListener?: Function;

  private readonly defaultSnippet = {
    id: '',
    title: 'Untitled',
    content: '',
    language: '',
  } as Snippet;

  @ViewChild('createListBodyTemplateRef')
  createListBodyTemplateRef!: TemplateRef<any>;

  @ViewChild('searchBodyTemplateRef')
  searchBodyTemplateRef!: TemplateRef<any>;

  lists: List[] = [];
  listName = '';
  searchText = '';
  currentUser = this.authService.session?.user;
  currentUserId = this.currentUser?.id;

  searchResultsSubject = new Subject<Snippet[]>();
  matchingSnippets$ = this.searchResultsSubject.asObservable();

  activeSnippetId$ = this.route.queryParamMap.pipe(
    map((params) => params.get('snippetId')),
    shareReplay(1),
  );

  activeSnippet$ = this.activeSnippetId$.pipe(
    switchMap((id) => {
      if (!id) {
        return of(null);
      }
      return this.snippetsService.getSnippet(id);
    }),
  );

  async ngOnInit() {
    if (!this.currentUserId) {
      return;
    }

    const { data, error } = await this.listsService.getLists(
      this.currentUserId,
    );

    if (error) {
      console.error('error', error);
    } else {
      if (data) {
        this.lists = data;
        this.cdRef.markForCheck();
      }
    }
  }

  ngAfterViewInit(): void {
    // Use this approach instead of hostlistener to prevent
    // unnecessary change detection lifecycles
    this.ngZone.runOutsideAngular(() => {
      this.removeSearchEventListener = this.renderer.listen(
        document.body,
        'keydown',
        (event) => {
          if (event.ctrlKey && event.key === 'k') {
            console.log('open search modal');
            event.preventDefault();

            this.ngZone.run(() => {
              this.openSearchModal();
            });
          }
        },
      );
    });
  }

  ngOnDestroy(): void {
    if (this.removeSearchEventListener) {
      this.removeSearchEventListener();
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.log('error', { error });
    }
  }

  createList() {
    const modalAfterClosed$ = this.modalService.openModal({
      dialogOptions: {
        width: '400px',
        disableClose: true,
      },
      componentProps: {
        title: 'Create new list',
        bodyTemplateRef: this.createListBodyTemplateRef,
        confirmButtonLabel: 'Create',
      },
    });

    modalAfterClosed$.subscribe((confirm) => {
      if (!confirm) {
        this.listName = '';
        return;
      }

      if (!this.currentUserId) {
        console.error('Not allowed to create a list without a user id');
        return;
      }

      const newList: NewListDTO = {
        name: this.listName,
        user_id: this.currentUserId,
      };

      this.listsService.createList(newList).then(() => {
        this.listName = '';
        this.cdRef.markForCheck();
      });
    });
  }

  openSearchModal() {
    const modalAfterClosed$ = this.modalService.openModal({
      dialogOptions: {
        width: '400px',
        disableClose: true,
      },
      componentProps: {
        title: 'Search snippets',
        bodyTemplateRef: this.searchBodyTemplateRef,
        confirmButtonLabel: 'Search',
      },
    });

    modalAfterClosed$.subscribe((_confirm) => {
      this.searchText = '';
    });
  }

  async searchSnippets(searchPattern: string) {
    const { data, error } =
      await this.snippetsService.searchSnippets(searchPattern);

    if (data) {
      this.searchResultsSubject.next(data);
    }
  }

  navigateToSnippet(snippetId: string) {
    this.router.navigate([], {
      queryParams: {
        snippetId,
      },
    });
    this.modalService.closeDialog();
  }
}
