import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { from, map, mergeMap } from 'rxjs';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  ionAdd,
  ionCopyOutline,
  ionChevronForward,
  ionChevronDown,
} from '@ng-icons/ionicons';
import { simpleJavascript } from '@ng-icons/simple-icons';

import { GroupsService } from './services/groups.service';
import { CollapsibleGroup } from './models/group';
import { CollapsibleList } from './models/list';
import { ListsService } from './services/lists.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NgIconComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
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
export class AppComponent implements OnInit {
  private groupsService = inject(GroupsService);
  private listsService = inject(ListsService);

  groups!: CollapsibleGroup[];

  // Record<groupId, CollapsibleList>
  lists: Record<string, CollapsibleList[] | undefined> = {};

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
