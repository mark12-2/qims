import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


export const appConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(), provideAnimationsAsync(),
  ],
};
