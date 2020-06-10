import { Component, OnInit, OnDestroy } from '@angular/core';
import Glide from '@glidejs/glide'
import { Subscription } from 'rxjs';
import { TransportorService } from '../transportor/transportor.service';
import { Router, Event, NavigationStart } from '@angular/router';

@Component({
  selector: '.item-navigator',
  templateUrl: './item-navigator.component.html',
  styleUrls: [
    './item-navigator.component.scss'
  ]
})
export class ItemNavigatorComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  public categories: any;
  private glide: any;
  public ghostSlides = []

  constructor(
    private transport: TransportorService,
    private route: Router
  ) {
    this.categories = []
  }

  ngOnInit() {
    this.subscriptions.push(
      this.transport.call.subscribe((data: any) => {
        this.transportData(data)
      })
    )
    this.mountGlider()
    this.routeChanges()
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private transportData(data) {
    switch (data.type) {
      case 'nav-categories':
        this.addCategories(data.msg)
        break;
    }
  }

  private routeChanges() {
    this.subscriptions.push(
      this.route.events.subscribe((event: Event) => {
        if (event instanceof NavigationStart) {
          let links = document.querySelectorAll('.main-slide-link')
          for (let i = 0; i < links.length; i++) {
            let elem: any = links[i]
            elem.classList.remove('active')
          }

          for (let k = 0; k < links.length; k++) {
            let _elem = links[k]
            if(encodeURIComponent(event.url) == encodeURIComponent(_elem.getAttribute('href'))){
              _elem.classList.add('loading')
              break;
            }
          }
        }
      })
    )
  }

  private mountGlider() {

    for (let i = 0; i <= 8; i++) {
      this.ghostSlides.push([])
    }

    this.glide = new Glide('.glide', {
      type: 'slider',
      focusAt: 0,
      bound: false,
      rewind: false,
      perView: 7,
      breakpoints: {
        800: {
          perView: 4
        },
        480: {
          perView: 3
        }
      }
    })
    setTimeout(() => {
      this.glide.mount();
    }, 500)
  }

  public disableClickEvent(event: any) {
    event.preventDefault();
  }

  private addCategories(data: any) {
    this.categories = data
    this.glide.mount()
  }

}
