import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

  private token_name = 'shrulk_token';
  private token_user = 'shrulk_user';

  handle(data) {
    this.set(this.token_user, JSON.stringify(data.user));
    this.set(this.token_name, data.access_token);
  }

  set(data_name, data_value) {
    localStorage.setItem(data_name, data_value)
  }

  removeAll() {
    localStorage.clear();
  }

  remove(key: string) {
    localStorage.removeItem(key)
  }

  get(type: string) {
    let data: any;
    switch (type) {
      case 'user':
        let user = localStorage.getItem(this.token_user)
        data = (user != null) ? JSON.parse(user) : user;
        break;
      case 'token':
        data = localStorage.getItem(this.token_name);
        break;
    }
    return data;
  }

  getUser(item?: string) {
    let data: any,
      user = localStorage.getItem(this.token_user),
      parseJSON = (user != null) ? JSON.parse(user) : user;
    if (parseJSON == null) {
      return null;
    }

    switch (item) {
      case 'user_id':
        data = parseJSON.identity;
        break;
      default:
        data = parseJSON;
        break;
    }
    return data;
  }

  setUser(data) {
    return localStorage.setItem(this.token_user, JSON.stringify(data));
  }
}
