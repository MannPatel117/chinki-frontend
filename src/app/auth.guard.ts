import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { ApiService } from './services/api/api.service'; // Update with your path

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private api: ApiService) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    let role = localStorage.getItem('role');
    const isLoggedIn = await this.checkUserLoggedIn(role);

    if (isLoggedIn && state.url === '/login') {
      this.router.navigate(['/pos/main']);
      return false;
    }
  
    // ✅ Prevent infinite loop when redirecting to /login
    if (!isLoggedIn && state.url !== '/login') {
      this.router.navigate(['/login']);
      return false;
    }
  
    // ✅ Allow navigation if all checks pass
    return true;
  }

  async checkUserLoggedIn(role: any): Promise<boolean> {
    const token = localStorage.getItem('token');
    console.log("AUTH "+token)
    console.log("AUTH "+role)
    if (token) {
      try {
        const res: any = await this.api
          .getAPI('/adminUser/session', [['role', role]])
          .toPromise();
        console.log("AUTH "+res)
        if (res.statusCode === 200) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error('API Error:', error);
        return false;
      }
    } else {
      return false;
    }
  }
}
