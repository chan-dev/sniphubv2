import {
  Directive,
  ElementRef,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
  host: {
    '(document:click)': 'handleClick($event)',
  },
})
export class ClickOutsideDirective {
  @Output() appClickOutside = new EventEmitter();

  private elementRef = inject(ElementRef);

  handleClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.appClickOutside.emit(event);
    }

    // Use this instead of stopPropagation so it also stops
    // propagation the event handler on the same element (in this case `document`)
    event.stopImmediatePropagation();
  }
}
