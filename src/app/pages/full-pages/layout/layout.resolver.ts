import { ResolveFn } from '@angular/router';

export const layoutResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};
