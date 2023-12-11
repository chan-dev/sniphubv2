import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { MatMenuModule } from '@angular/material/menu';

import { CollapsibleList } from '../../models/list';
import { ListComponent } from '../list/list.component';
import { ContextMenuDirective } from '../../directives/context-menu.directive';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

@Component({
  selector: 'app-list-group',
  standalone: true,
  templateUrl: './list-group.component.html',
  styles: `
  :host {
    display: block;
    width: 100%;
  }
  `,
  imports: [
    CommonModule,
    MatMenuModule,
    NgIconComponent,
    ListComponent,
    ContextMenuDirective,
    ClickOutsideDirective,
  ],
})
export class ListGroupComponent {
  @Input() lists: CollapsibleList[] = [];
  @Input() activeSnippetId?: string;

  toggleSnippets(listId: string) {
    this.lists = this.lists.map((l) => {
      return {
        ...l,
        open: l.id === listId ? !l.open : l.open,
      };
    });
  }

  editList(id: string) {
    console.log('editList', id);
  }
  deleteList(id: string) {
    console.log('deleteList', id);
  }
}
