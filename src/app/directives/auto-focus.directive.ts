import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: 'input[autofocus]',
  standalone: true,
})
export class AutoFocusDirective implements AfterViewInit {
  private elementRef = inject(ElementRef);

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.focus();
  }
}
