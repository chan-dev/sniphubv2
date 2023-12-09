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
      this.appClickOutside.emit();
    }
  }
}
