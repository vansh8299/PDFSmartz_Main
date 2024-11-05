import { HttpInterceptorFn } from '@angular/common/http';

export const validationInterceptor: HttpInterceptorFn = (req, next) => {
  const clonereq = req.clone({
    setHeaders: {
      Authorization: '32123b5a-d16e-47c1-aab2-323f5fd0ee48',
    },
  });
  return next(clonereq);
};
