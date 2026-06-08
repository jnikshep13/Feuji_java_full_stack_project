import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRole = route.data?.['role'];
  if (requiredRole && auth.currentUser?.role !== requiredRole) {
    const role = auth.currentUser?.role?.toLowerCase();
    router.navigate([`/${role}/dashboard`]);
    return false;
  }

  return true;
};
