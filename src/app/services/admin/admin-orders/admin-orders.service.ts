import { Injectable } from '@angular/core';
import { TokenService } from '../../token/token.service';
import { ConfigService } from 'src/app/utility/config/config.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminOrdersService {

  private user: any
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

  public get(data: any) {
    return this.http.get(ConfigService.Url + 'admin/' + this.user + '/orders', {
      headers: this.config.headers(true),
      params: data
    })
  }

  public changeStatus(order: number, status: string) {
    return this.http.put(ConfigService.Url + 'admin/' + this.user + '/orders/' + order + '/status', {
      status: status
    }, {
      headers: this.config.headers(true)
    })
  }

}
