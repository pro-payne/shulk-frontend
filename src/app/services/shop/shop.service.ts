import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/utility/config/config.service';
import { TokenService } from '../token/token.service';

@Injectable({
  providedIn: 'root'
})
export class ShopService {

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private token: TokenService
  ) { }

  public get(identity?: string) {
    if (identity == undefined) {
      identity = '';
    }
    return this.http.get(ConfigService.Url + 'shops', {
      headers: this.config.headers(false),
      params: {
        identity: identity
      }
    })
  }

  public getProducts(identity: any, category: string) {
    return this.http.get(ConfigService.Url + 'products', {
      headers: this.config.headers(false),
      params: {
        shop: identity,
        category: category
      }
    })
  }

  public getShop() {
    let user = this.token.getUser('user_id');
    if (user != null) {
      user = parseInt(user);
    } else {
      user = 0;
    }
    return this.http.get(ConfigService.Url + 'manager/' + user + '/shops', {
      headers: this.config.headers(true)
    })
  }

}
