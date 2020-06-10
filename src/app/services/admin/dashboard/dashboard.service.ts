import { Injectable } from '@angular/core';
import { TokenService } from '../../token/token.service';
import { ConfigService } from 'src/app/utility/config/config.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private user: any;
  constructor(
    private token: TokenService,
    private http: HttpClient,
    private config: ConfigService
  ) {
    let user = this.token.getUser('user_id');
    if (user == null) {
      console.log("You need to login to save!!")
      this.user = 0
    } else {
      this.user = user
    }
  }

  public get_stats() {
    return this.http.get(ConfigService.Url + 'admin/' + this.user + '/system_stats', {
      headers: this.config.headers(true)
    })
  }

}
