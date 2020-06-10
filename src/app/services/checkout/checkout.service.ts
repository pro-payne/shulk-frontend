import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/utility/config/config.service';
import { TokenService } from '../token/token.service';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private token: TokenService
  ) { }

  public post(type: string, data: any, loggedIn: boolean) {
    let location = "order", subLocation = "";

    if (type == 'shipping') {
      location = location + "/shipping";
      subLocation = "address";
    }else if(type == 'payment'){
      subLocation = 'orders'
    }

    if (loggedIn) {
      let user = this.token.getUser('user_id')
      if (user == null) {
        console.log("You need to login to save!!")
        return;
      }

      location = "customer/" + parseInt(user) + "/" + subLocation;
    }

    return this.http.post(ConfigService.Url + location, data, {
      headers: this.config.headers(loggedIn)
    })
  }

  public getAddress() {
    let user = this.token.getUser('user_id')
    if (user == null) {
      console.log("You need to login to save!!")
      return;
    }
    return this.http.get(ConfigService.Url + "customer/" + parseInt(user) + "/address", {
      headers: this.config.headers(true)
    });
  }
}
