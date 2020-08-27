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
      this.el.nativeElement.style.height = (newHeight) + "px";
      return newHeight;
    }


    const dragMoveG = (evt) => {
      if (!this.dragging) {
        return;
      }
      // el.nativeElement.style.cursor = "col-resize";
      // const newWidth = Math.max(this.resizableMinHeight, (evt.clientY - el.nativeElement.offsetTop)) + "px";
      this.el.nativeElement.style.height = (evt.clientY - this.el.nativeElement.offsetTop) + "px";
      evt.stopPropagation();
    };

    const mouseMoveGlobal = (evt) => {
      if (!this.dragging) {
        return;
      }
      // console.log(evt, el.nativeElement.getBoundingClientRect(), el.nativeElement.offsetTop)
      const position = this.el.nativeElement.getBoundingClientRect();
      const height = newHeight(evt.clientY - position.top + this.resizableGrabHeight);
      this.resizeOut.emit();
      evt.stopPropagation({ height: height });
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
        preventGlobalMouseEvents();
        evt.stopPropagation();
      }
    };


    const mouseMove = (evt) => {
      if (this.inDragRegion(evt) || this.dragging) {
        this.el.nativeElement.style.cursor = "ns-resize";
      } else {
        this.el.nativeElement.style.cursor = "default";
      }
    }

    if ( this.resize ) {
      document.addEventListener('mousemove', mouseMoveGlobal, true);
      document.addEventListener('mouseup', mouseUpGlobal, true);
      this.el.nativeElement.addEventListener('mousedown', mouseDown, true);
      this.el.nativeElement.addEventListener('mousemove', mouseMove, true);
      this.el.nativeElement.style["border-bottom"] =  "3px solid #000";
    }
  }

  inDragRegion(evt) {
    const poistion = this.el.nativeElement.getBoundingClientRect();
    return this.el.nativeElement.clientHeight - evt.clientY + poistion.top < this.resizableGrabHeight;
  }

}
