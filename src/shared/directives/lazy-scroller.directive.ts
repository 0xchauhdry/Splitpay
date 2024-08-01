import { Directive, ElementRef, EventEmitter, Output, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appLazyScroller]',
  standalone: true
})
export class LazyScrollerDirective implements OnDestroy {
  @Output() scrolled = new EventEmitter<void>();
  private scrollListener: () => void;

  constructor(private elRef: ElementRef) {
    const element = this.elRef.nativeElement;
    this.scrollListener = this.onScroll.bind(this);
    element.addEventListener('scroll', this.scrollListener);
  }

  private onScroll() {
    const element = this.elRef.nativeElement;
    if (this.isScrolledToEnd(element)) {
      this.scrolled.emit();
    }
  }

  private isScrolledToEnd(e: HTMLElement): boolean {
    return (Math.ceil(e.scrollHeight - e.scrollTop) === Math.ceil(e.clientHeight) ||
            Math.round(e.scrollHeight - e.scrollTop) === Math.round(e.clientHeight));
  }

  ngOnDestroy() {
    const element = this.elRef.nativeElement;
    element.removeEventListener('scroll', this.scrollListener);
  }
}
