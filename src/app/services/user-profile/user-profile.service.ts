import { Injectable } from '@angular/core';
import { TokenService } from '../token/token.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/utility/config/config.service';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  constructor(
    private token: TokenService,
    private http: HttpClient,
    private config: ConfigService
  ) { }

  public get(type: string) {
    let user = this.token.getUser('user_id'), routeType = '';
    if (user == null) {
      console.log("You need to login to save!!")
      return;
    }

    switch (type) {
      case 'shop':
        routeType = 'manager/' + user + '/shops';
        break;
      case 'customer':
        routeType = 'customers/' + user;
        break;
      case 'manager':
        routeType = 'managers/' + user;
        break;
      case 'shipping':
        routeType = 'customer/' + user + '/address';
        break;
      case 'admin':
        routeType = 'admins/' + user;
        break;
    }

    return this.http.get(ConfigService.Url + routeType, {
      headers: this.config.headers(true)
    })
  }

  public updateProfile(type: string, data: any) {
    let user = this.token.getUser(), routeType = '';
    if (user == null) {
      console.log("You need to login to save!!")
      return;
    }

    switch (type) {
      case 'shop':
        routeType = 'manager/' + user.identity + '/shops/' + user.shop.id;
        break;
      case 'customer':
        routeType = 'customers/' + user.identity;
        break;
      case 'manager':
        routeType = 'managers/' + user.identity;
        break;
      case 'admin':
        routeType = 'admins/' + user.identity;
        break;
    }

    return this.http.put(ConfigService.Url + routeType, data, {
      headers: this.config.headers(true)
    })
  }

  public newAddress(data: any) {
    let user = this.token.getUser();
    if (user == null) {
      console.log("You need to login to save!!")
      return;
    }
    return this.http.post(ConfigService.Url + 'customer/' + user.identity + '/address', data, {
      headers: this.config.headers(true)
    })
  }

  public address(data: any, id: number, type: string) {
    let user = this.token.getUser();
    if (user == null) {
      console.log("You need to login to save!!")
      return;
    }
    if (type == 'edit') {
      return this.http.put(ConfigService.Url + 'customer/' + user.identity + '/address/' + id, data, {
        headers: this.config.headers(true)
      })
    } else if (type == 'delete') {
      return this.http.delete(ConfigService.Url + 'customer/' + user.identity + '/address/' + id, {
        headers: this.config.headers(true)
      })
    }

  }

}
