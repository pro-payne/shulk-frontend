import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { ButtonService } from './utility/button/button.service';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: '.app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  private isPopState = false;

  constructor(
    private route: Router,
    private buttonEffect: ButtonService,
    private locStrat: LocationStrategy
  ) {
    // buttonEffect.activate()
    // this.routeChanges()
  }

  ngOnInit() {
    this.locStrat.onPopState(() => {
      this.isPopState = true;
    });

    this.route.events.subscribe(event => {
      // Scroll to top if accessing a page, not via browser history stack
      if (event instanceof NavigationEnd && !this.isPopState) {
        window.scrollTo(0, 0);
        this.isPopState = false;
      }

      // Ensures that isPopState is reset
      if (event instanceof NavigationEnd) {
        this.isPopState = false;
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private routeChanges() {

    this.subscriptions.push(
      this.route.events.subscribe((event: Event) => {
        if (event instanceof NavigationEnd) {
          this.buttonEffect.activate()
        }
      })
    )

  }

}
