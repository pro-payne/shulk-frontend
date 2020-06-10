import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService } from 'src/app/services/admin/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  public stats: any;
  public loadingStats: boolean;
  public ghosts: any[];

  constructor(
    private dashService: DashboardService
  ) {
    this.loadingStats = true;
    this.ghosts = [];
    for(let i =0; i <= 5; i++){
      this.ghosts.push([])
    }
  }

  ngOnInit() {

    this.dashService.get_stats().subscribe((r: any) => {
      this.stats = r.stats
      this.loadingStats = false;
    })
  }

  ngOnDestroy(){
    this.ghosts = [];
  }

}
