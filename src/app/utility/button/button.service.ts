import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ButtonService {

  constructor() { }

  public activate() {
    let btns = document.getElementsByClassName('shulk-btn');

    let createRipple = function (e) {
      let _this = e.target;
      let circle = document.createElement('div');
      _this.appendChild(circle);

      let d = Math.max(_this.clientWidth, _this.clientHeight)

      circle.style.width = circle.style.height = d + 'px';

      circle.style.left = (e.clientX - _this.offsetLeft - d / 2) + 'px';
      circle.style.top = (e.clientY - _this.offsetTop - d / 2) + 'px';

      circle.classList.add('ripple')
    }
    Array.prototype.forEach.call(btns, function(b){
      b.addEventListener('click', (e) => createRipple(e));
    });

  }

}
