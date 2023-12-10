import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { from, map, mergeMap, shareReplay, tap } from 'rxjs';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  ionAdd,
  ionCopyOutline,
  ionChevronForward,
  ionChevronDown,
} from '@ng-icons/ionicons';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { CollapsibleGroup } from '../../models/group';
import { CollapsibleList } from '../../models/list';
import { GroupsService } from '../../services/groups.service';
import { ListsService } from '../../services/lists.service';
import { GroupsComponent } from '../../components/groups/groups.component';
import { SnippetComponent } from '../../components/snippet/snippet.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MonacoEditorModule,
    NgIconComponent,
    GroupsComponent,
    SnippetComponent,
    RouterLink,
  ],
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
})
export class HomeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupsService = inject(GroupsService);
  private listsService = inject(ListsService);

  groups!: CollapsibleGroup[];
  // Record<groupId, CollapsibleList>
  lists: Record<string, CollapsibleList[] | undefined> = {};

  activeSnippetId$ = this.route.queryParamMap.pipe(
    map((params) => params.get('snippetId')),
    shareReplay(1),
  );

  ngOnInit() {
    const userId = 'YNcQBgiyZ5ANasIrvH5p';

    this.groupsService
      .getGroups(userId)
      .pipe(
        map((groups) => {
          return groups.map((g) => ({
            ...g,
            open: false,
          }));
        }),
      )
      .subscribe((groups) => {
        this.groups = groups;

        const groupIds = this.groups.map((g) => g.id);

        from(groupIds)
          .pipe(
            mergeMap((id) => {
              return this.listsService.getLists(id).pipe(
                map((lists) => {
                  return [id, lists] as const;
                }),
              );
            }),
          )
          .subscribe(([groupId, lists]) => {
            this.lists[groupId] = lists.map((l) => {
              return {
                ...l,
                open: false,
              };
            });
          });
      });
  }

  toggleGroup(groupId: string) {
    this.groups = this.groups.map((g) => {
      return {
        ...g,
        open: g.id === groupId ? !g.open : g.open,
      };
    });
  }

  toggleSnippets(groupId: string, listId: string) {
    this.lists[groupId] = this.lists[groupId]?.map((l) => {
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
