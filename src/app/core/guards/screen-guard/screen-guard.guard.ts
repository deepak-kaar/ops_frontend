import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const screenGuardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router)
  if (window.innerWidth > 1024) {
    return true;
  }
  else {
    router.navigateByUrl('/desktop-required');
    return false;
  }
  return true;
};
