import { Component, Input, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import { MatMenu, MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

import { CollapsibleList } from '../../models/list';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, MatMenuModule, NgIconComponent, RouterLink],
  templateUrl: './list.component.html',
  styles: ``,
})
export class ListComponent {
  @Input() list!: CollapsibleList;
  @Input() activeSnippetId?: string;

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  openMenu(event: MouseEvent) {
    event.preventDefault();
    this.menuTrigger.toggleMenu();
  }

  disableContextMenu() {
    this.menuTrigger.closeMenu();
  }
}
