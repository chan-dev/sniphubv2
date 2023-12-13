import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  NgZone,
  Output,
  Renderer2,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective implements AfterViewInit {
  @Output() appClickOutside = new EventEmitter();

  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  private zone = inject(NgZone);

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.addClickHandler();
    });
  }

  private addClickHandler() {
    // This prevents running change detection on every click since
    // the directive is attached to the document
    this.renderer.listen(document, 'click', (event: MouseEvent) => {
      this.handleClick(event);
    });
  }

  handleClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.zone.run(() => {
        this.appClickOutside.emit(event);
      });
    }
    event.stopPropagation();
    // Comment this one as it stops other elements which use this directive
    // from receiving the event
    // event.stopImmediatePropagation();
  }
}
