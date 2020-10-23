import { Directive, ElementRef, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appResizable]' // Attribute selector
})

export class ResizableDirective implements OnInit {


  @Input() resize = true;
  @Input() resizableGrabHeight = 10;
  @Input() resizableMinHeight = 10;
  @Output() resizeOut = new EventEmitter<any>();
  // @Input() resizableMinWidth = 10;

  dragging = false;

  constructor(private el: ElementRef) {

  }

  ngOnInit(): void {
    const self = this;

    const EventListenerMode = { capture: true };

    function preventGlobalMouseEvents() {
      document.body.style['pointer-events'] = 'none';
    }

    function restoreGlobalMouseEvents() {
      document.body.style['pointer-events'] = 'auto';
    }


    const newHeight = (wid) => {
      const newHeight = Math.max(this.resizableMinHeight, wid);
      this.el.nativeElement.style.height = (newHeight) + 'px';
      return newHeight;
    }

    const mouseMoveGlobal = (evt) => {
      document.body.style.cursor = this.dragging ? 'ns-resize' : 'default';
      if (!this.dragging) {
        return;
      }
      this.el.nativeElement.style.cursor = 'ns-resize';
      const position = this.el.nativeElement.getBoundingClientRect();
      const height = newHeight(evt.clientY - position.top + this.resizableGrabHeight);
      this.resizeOut.emit();
      evt.preventDefault();
    };

    const mouseUpGlobal = (evt) => {
      if (!this.dragging) {
        return;
      }
      restoreGlobalMouseEvents();
      this.dragging = false;
      evt.stopPropagation();
    };

    const mouseDown = (evt) => {
      if (this.inDragRegion(evt)) {
        this.dragging = true;
      }
    };


    const mouseMove = (evt) => {
      if (this.inDragRegion(evt) || this.dragging) {
        this.el.nativeElement.style.cursor = 'ns-resize';
      } else {
        this.el.nativeElement.style.cursor = 'default';
      }
    }

    if ( this.resize ) {
      document.addEventListener('mousemove', mouseMoveGlobal, true);
      document.addEventListener('mouseup', mouseUpGlobal, true);
      this.el.nativeElement.addEventListener('mousedown', mouseDown, true);
      this.el.nativeElement.addEventListener('mousemove', mouseMove, true);
      // this.el.nativeElement.style["border-bottom"] =  "3px solid #000";
    }
  }

  inDragRegion(evt) {
    const poistion = this.el.nativeElement.getBoundingClientRect();
    return this.el.nativeElement.clientHeight - evt.clientY + poistion.top < this.resizableGrabHeight;
  }

}
