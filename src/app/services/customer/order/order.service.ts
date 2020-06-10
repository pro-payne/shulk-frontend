import { Injectable } from '@angular/core';
import { TokenService } from '../../token/token.service';
import { ConfigService } from 'src/app/utility/config/config.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

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

  get() {
    return this.http.get(ConfigService.Url + 'customer/' + this.user + '/orders', {
      headers: this.config.headers(true)
    })
  }

  orderDetails(data: any) {
    return this.http.get(ConfigService.Url + 'customer/' + this.user + '/orders/' + data, {
      headers: this.config.headers(true)
    })
  }

  editOrder(orderId: any, type: string) {
    return this.http.put(ConfigService.Url + 'customer/' + this.user + '/orders/' + orderId, { type: type }, {
      headers: this.config.headers(true)
    })
  }

}
