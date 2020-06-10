import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HomeService } from 'src/app/services/home/home.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: '.home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {

  private subscriptions: Subscription[] = [];
  public ghostLoading: boolean;
  public ghostContainer = [];
  public ghostData = [];
  public contentData = [];
  private fragment: string;
  private keepTrack : number

  constructor(
    private homeService: HomeService,
    private route: ActivatedRoute
  ) {
    this.ghostLoading = true;
    this.ghostFunction();
    this.keepTrack = 0;
  }

  ngOnInit() {
    this.subscriptions.push(
      this.homeService.get().subscribe((results: any) => {
        this.ghostLoading = false;
        this._contentData(results);
      })
    )

    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment;
     });
  }

  ngAfterViewInit(): void {
      this.fragmentSwitch()
  }

  private fragmentSwitch(){
    try {
      document.querySelector('#' + this.fragment).scrollIntoView();
    } catch (e) { }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private ghostFunction() {
    this.ghostData = [];
    for (let i = 1; i <= 10; i++) {
      this.ghostData.push(i);
    }
  }

  public disableClickEvent(event: any) {
    event.preventDefault();
  }

  private _contentData(_data: any) {
    for(let i =0; i < _data.collection.length; i++){
      this.contentData.push(_data.collection[i])
    }
  }

}
