import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { from, map, mergeMap, tap } from 'rxjs';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  ionAdd,
  ionCopyOutline,
  ionChevronForward,
  ionChevronDown,
} from '@ng-icons/ionicons';
import { simpleJavascript } from '@ng-icons/simple-icons';

import { CollapsibleGroup } from '../../models/group';
import { CollapsibleList } from '../../models/list';
import { GroupsService } from '../../services/groups.service';
import { ListsService } from '../../services/lists.service';
import { GroupsComponent } from '../../components/groups/groups.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NgIconComponent, GroupsComponent],
  templateUrl: './home.component.html',
  styles: [],
  viewProviders: [
    provideIcons({
      ionAdd,
      ionCopyOutline,
      ionChevronForward,
      ionChevronDown,
      simpleJavascript,
    }),
  ],
})
export class HomeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private groupsService = inject(GroupsService);
  private listsService = inject(ListsService);

  groups!: CollapsibleGroup[];
  // Record<groupId, CollapsibleList>
  lists: Record<string, CollapsibleList[] | undefined> = {};

  activeSnippetId$ = this.route.queryParamMap.pipe(
    tap((params) => console.log('params', params)),
    map((params) => params.get('snippetId')),
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
}
