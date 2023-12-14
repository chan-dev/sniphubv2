import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

import { List } from '../../models/list';
import { ContextMenuDirective } from '../../directives/context-menu.directive';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
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
})
export class ListComponent {
  @Input() list!: List;
  @Input() activeSnippetId?: string;

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  isExpanded = false;

  editList(id: string) {
    console.log('editList', id);
  }
  deleteList(id: string) {
    console.log('deleteList', id);
  }

  editSnippet(id: string) {
    console.log('editSnippet', id);
  }
  deleteSnippet(id: string) {
    console.log('deleteSnippet', id);
  }

  toggleList() {
    this.isExpanded = !this.isExpanded;
  }
}
