import {
    animate,
    keyframes,
    state,
    style,
    transition,
    trigger
  } from '@angular/animations';
    import { NgIf } from '@angular/common';
  import { Component } from '@angular/core';
  
  import { Toast, ToastrService, ToastPackage } from 'ngx-toastr';
  
  @Component({
    selector: '[error-toast-component]',
    standalone: true,
    imports: [NgIf],  
    styleUrl: './toast.scss',
    templateUrl: './toast.html',
    animations: [
      trigger('flyInOut', [
        state('inactive', style({
          opacity: 0,
        })),
        transition('inactive => active', animate('400ms ease-out', keyframes([
          style({
            transform: 'translate3d(100%, 0, 0) skewX(-30deg)',
            opacity: 0,
          }),
          style({
            transform: 'skewX(20deg)',
            opacity: 1,
          }),
          style({
            transform: 'skewX(-5deg)',
            opacity: 1,
          }),
          style({
            transform: 'none',
            opacity: 1,
          }),
        ]))),
        transition('active => removed', animate('400ms ease-out', keyframes([
          style({
            opacity: 1,
          }),
          style({
            transform: 'translate3d(100%, 0, 0) skewX(30deg)',
            opacity: 0,
          }),
        ]))),
      ]),
    ],
    preserveWhitespaces: false,
  })
  export class ErrorToast extends Toast {
  
    action(event: Event) {
      event.stopPropagation();
      this.toastPackage.triggerAction();
      return false;
    }
  }