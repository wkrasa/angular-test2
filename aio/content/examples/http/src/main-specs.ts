import 'jasmine-core/lib/jasmine-core/jasmine-html.js';
import 'jasmine-core/lib/jasmine-core/boot.js';

declare const jasmine: any;

import './polyfills';

import 'zone.js/testing';

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Import spec files individually for Stackblitz
import './app/heroes/heroes.service.spec.ts';
import './testing/http-client.spec.ts';

//
bootstrap();

//
function bootstrap() {
  if ((window as any).jasmineRef) {
    location.reload();
    return;
  } else {
    window.onload?.({} as Event);
    (window as any).jasmineRef = jasmine.getEnv();
  }

  // First, initialize the Angular testing environment.
  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
}
