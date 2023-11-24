import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';

import { CollapsibleGroup } from '../../models/group';
import { CollapsibleList } from '../../models/list';
import { ListComponent } from '../list/list.component';

@Component({
  selector: 'app-groups',
  standalone: true,
  templateUrl: './groups.component.html',
  styles: `
  :host {
    display: block;
    width: 100%;
  }
  `,
  imports: [CommonModule, NgIconComponent, ListComponent],
})
export class GroupsComponent {
  @Input() groups!: CollapsibleGroup[];
  @Input() lists: Record<string, CollapsibleList[] | undefined> = {};
  @Input() activeSnippetId?: string;

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
