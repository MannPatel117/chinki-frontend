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
      localStorage.removeItem('token');
      localStorage.removeItem('selectedLocation');
      localStorage.removeItem('role');
      localStorage.removeItem('location');
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
      localStorage.removeItem('invoiceData1');
      localStorage.removeItem('invoiceData2');
      localStorage.removeItem('invoiceData3');
      return false;
    }
  
    // ✅ Allow navigation if all checks pass
    return true;
  }

  async checkUserLoggedIn(role: any): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res: any = await this.api
          .getAPI('/adminUser/session', [['role', role]])
          .toPromise();
        if (res.statusCode === 200) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  }
}
