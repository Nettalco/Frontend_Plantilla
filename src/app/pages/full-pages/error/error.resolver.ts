import { ResolveFn } from '@angular/router';

export const errorResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};
