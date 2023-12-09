import { Directive, inject } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ClickOutsideDirective } from './click-outside.directive';

@Directive({
  selector: '[matMenuTriggerFor][preventDefault]',
  standalone: true,
  host: {
    '(contextmenu)': 'handleContextMenu($event)',
    '(click)': 'disableContextMenu($event)',
    '(clickOutside)': 'disableContextMenu($event)',
  },
  hostDirectives: [
    // Directive composition
    {
      directive: ClickOutsideDirective,
      outputs: ['appClickOutside:clickOutside'],
    },
  ],
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
