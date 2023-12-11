import { Directive, inject } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

import { ClickOutsideDirective } from './click-outside.directive';

@Directive({
  selector: '[matMenuTriggerFor][isDropdownMenu]',
  standalone: true,
  host: {
    '(click)': '$event.stopPropagation()',
    '(clickOutside)': 'closeContextMenu($event);',
  },
  hostDirectives: [
    {
      directive: ClickOutsideDirective,
      outputs: ['appClickOutside:clickOutside'],
    },
  ],
})
export class DropdownMenuDirective {
  // Inject the directive you want to augment
  private menu = inject(MatMenuTrigger);

  closeContextMenu(event: MouseEvent) {
    this.menu.closeMenu();
    event.stopPropagation();
    console.log('DropdownMenuDirective: closeContextMenu');
  }
}
