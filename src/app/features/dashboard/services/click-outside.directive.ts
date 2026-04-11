// click-outside.directive.ts
import { Directive, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[clickoutside]',
  standalone: true
})
export class ClickOutsideDirective {
  @Output() clickoutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickoutside.emit();
    }
  }
}