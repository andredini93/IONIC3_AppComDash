import { Injectable } from '@angular/core';
import { UserAgent } from '@ionic-native/user-agent';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class HttpsRequestInterceptor implements HttpInterceptor {
  constructor(private userAgent: UserAgent) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
	this.userAgent.set('Analytics/1');
    return next.handle(request);
  }
}