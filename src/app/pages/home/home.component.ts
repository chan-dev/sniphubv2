import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
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
import { MatMenuModule } from '@angular/material/menu';
import { provideComponentStore } from '@ngrx/component-store';
import { Subject, map, shareReplay } from 'rxjs';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  ionAdd,
  ionCopyOutline,
  ionChevronForward,
  ionChevronDown,
} from '@ng-icons/ionicons';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { NewListDTO } from '../../models/list';
import { SnippetComponent } from '../../components/snippet/snippet.component';
import { ListComponent } from '../../components/list/list.component';
import { ListGroupComponent } from '../../components/list-group/list-group.component';
import { DropdownMenuDirective } from '../../directives/dropdown-menu.directive';
import { ModalComponent } from '../../ui/libs/modal/modal.component';
import { DefaultSnippetViewComponent } from '../../components/default-snippet-view/default-snippet-view.component';
import { SnippetsStore } from '../../services/snippets.store';
import { Snippet } from '../../models/snippet';
import { SnippetService } from '../../services/snippets.service';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { DbSyncService } from '../../services/db-sync.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styles: [],
  providers: [provideComponentStore(SnippetsStore)],
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
  private cdRef = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  private snippetsStore = inject(SnippetsStore);

  private ngZone = inject(NgZone);
  private renderer = inject(Renderer2);
  private snippetsService = inject(SnippetService);
  private modalService = inject(ModalService);
  private dbSyncService = inject(DbSyncService);

  private removeSearchEventListener?: Function;

  vm$ = this.snippetsStore.vm$;

  @ViewChild('createListBodyTemplateRef')
  createListBodyTemplateRef!: TemplateRef<any>;

  @ViewChild('searchBodyTemplateRef')
  searchBodyTemplateRef!: TemplateRef<any>;

  listName = '';
  searchText = '';
  currentUser = this.authService.session?.user;
  currentUserId = this.currentUser?.id;

  searchResultsSubject = new Subject<Snippet[]>();
  matchingSnippets$ = this.searchResultsSubject.asObservable();

  activeSnippetId$ = this.route.queryParamMap.pipe(
    map((params) => +(params.get('snippetId') ?? -1)),
    shareReplay(1),
  );

  ngOnInit() {
    this.snippetsStore.getListsEffect(this.currentUserId ?? null);
    this.snippetsStore.getActiveSnippetEffect(this.activeSnippetId$);

    this.dbSyncService.listen(this.snippetsStore);
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

    this.dbSyncService.unlisten();
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

      this.snippetsStore.saveListEffect({
        newList,
        cb: () => {
          this.listName = '';
          this.cdRef.markForCheck();
        },
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
    // TODO: update component store
    const { data, error } =
      await this.snippetsService.searchSnippets(searchPattern);

    if (data) {
      this.searchResultsSubject.next(data);
    }
  }

  navigateToSnippet(snippetId: number) {
    this.router.navigate([], {
      queryParams: {
        snippetId,
      },
    });
    this.modalService.closeDialog();
  }
}
