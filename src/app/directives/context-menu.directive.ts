import { Directive, inject } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

import { ClickOutsideDirective } from './click-outside.directive';

@Directive({
  selector: '[matMenuTriggerFor][isContextMenu]',
  standalone: true,
  host: {
    '(contextmenu)': 'handleContextMenu($event)',
    '(click)': 'closeContextMenu($event)',
    '(clickOutside)': 'closeContextMenu($event)',
  },
  hostDirectives: [
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

  closeContextMenu(event: MouseEvent) {
    this.menu.closeMenu();
    event.stopPropagation();
  }
}
