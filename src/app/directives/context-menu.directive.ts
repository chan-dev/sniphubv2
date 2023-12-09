import { Directive, inject } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

@Directive({
  selector: '[matMenuTriggerFor][preventDefault]',
  standalone: true,
  host: {
    '(contextmenu)': 'handleContextMenu($event)',
    '(click)': 'disableContextMenu($event)',
  },
})
export class ContextMenuDirective {
  // Inject the directive you want to augment
  private menu = inject(MatMenuTrigger);

  handleContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.menu.toggleMenu();
  }

  disableContextMenu(event: MouseEvent) {
    this.menu.closeMenu();
  }
}
