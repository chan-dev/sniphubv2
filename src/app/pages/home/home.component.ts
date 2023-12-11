import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { map, shareReplay } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  ionAdd,
  ionCopyOutline,
  ionChevronForward,
  ionChevronDown,
} from '@ng-icons/ionicons';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { CollapsibleList } from '../../models/list';
import { ListsService } from '../../services/lists.service';
import { SnippetComponent } from '../../components/snippet/snippet.component';
import { ListComponent } from '../../components/list/list.component';
import { ListGroupComponent } from '../../components/list-group/list-group.component';
import { DropdownMenuDirective } from '../../directives/dropdown-menu.directive';

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
    SnippetComponent,
    RouterLink,
    ListGroupComponent,
    ListComponent,
    DropdownMenuDirective,
  ],
})
export class HomeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listsService = inject(ListsService);

  lists: CollapsibleList[] = [];

  activeSnippetId$ = this.route.queryParamMap.pipe(
    map((params) => params.get('snippetId')),
    shareReplay(1),
  );

  ngOnInit() {
    const userId = 'YNcQBgiyZ5ANasIrvH5p';

    return this.listsService.getLists(userId).subscribe((lists) => {
      this.lists = lists.map((l) => {
        return {
          ...l,
          open: false,
        };
      });
    });
  }

  toggleSnippets(listId: string) {
    this.lists = this.lists.map((l) => {
      return {
        ...l,
        open: l.id === listId ? !l.open : l.open,
      };
    });
  }

  logout() {
    // TODO: implement later once we have the auth service
    this.router.navigate(['/login']);
  }
}
