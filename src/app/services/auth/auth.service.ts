import { Injectable } from '@angular/core';
import { TokenService } from '../token/token.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/utility/config/config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    public jwtHelper: JwtHelperService,
    public tokenService: TokenService,
    private http: HttpClient,
    private config: ConfigService
  ) { }

  public isAuthenticated(): boolean {
    const token = this.tokenService.get('token');
    // Check whether the token is expired and return
    // true or false
    if (token == null) {
      return false;
    }
    return !this.jwtHelper.isTokenExpired(token);
  }

  public logout() {
    return this.http.post(ConfigService.Url + 'auth/logout', {} , {
      headers: this.config.headers(true)
    });
  }
}
