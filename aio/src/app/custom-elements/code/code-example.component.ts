/* eslint-disable  @angular-eslint/component-selector */
import { Component, HostBinding, ElementRef, ViewChild, Input, AfterViewInit } from '@angular/core';
import { fromInnerHTML } from 'app/shared/security';
import { CodeComponent } from './code.component';

/**
 * An embeddable code block that displays nicely formatted code.
 * Example usage:
 *
 * ```
 * <code-example language="ts" linenums="2" class="special" header="Do Stuff">
 * // a code block
 * console.log('do stuff');
 * </code-example>
 * ```
 */
@Component({
  selector: 'code-example',
  template: `
    <!-- Content projection is used to get the content HTML provided to this component -->
    <div #content style="display: none"><ng-content></ng-content></div>

    <header *ngIf="header">{{header}}</header>

    <aio-code [class.headed-code]="!!this.header"
              [class.simple-code]="!this.header"
              [language]="language"
              [linenums]="linenums"
              [path]="path"
              [region]="region"
              [hideCopy]="hidecopy"
              [header]="header">
    </aio-code>
  `,
})
export class CodeExampleComponent implements AfterViewInit {
  classes: { 'headed-code': boolean, 'simple-code': boolean };

  @Input() language: string;

  @Input() linenums: string;

  @Input() region: string;

  @Input() header: string;

  @Input()
  set path(path: string) {
    this._path = path;
    this.isAvoid = this.path.indexOf('.avoid.') !== -1;
  }
  get path(): string { return this._path; }
  private _path = '';

  @Input()
  set hidecopy(hidecopy: boolean) {
    // Coerce the boolean value.
    this._hidecopy = hidecopy != null && `${hidecopy}` !== 'false';
  }
  get hidecopy(): boolean { return this._hidecopy; }
  private _hidecopy: boolean;

  /* eslint-disable-next-line @angular-eslint/no-input-rename */
  @Input('hide-copy')
  set hyphenatedHideCopy(hidecopy: boolean) {
    this.hidecopy = hidecopy;
  }

  /* eslint-disable-next-line @angular-eslint/no-input-rename */
  @Input('hideCopy')
  set capitalizedHideCopy(hidecopy: boolean) {
    this.hidecopy = hidecopy;
  }

  @HostBinding('class.avoidFile') isAvoid = false;

  @ViewChild('content', { static: true }) content: ElementRef<HTMLDivElement>;

  @ViewChild(CodeComponent, { static: true }) aioCode: CodeComponent;

  ngAfterViewInit() {
    const contentElem = this.content.nativeElement;
    this.aioCode.code = fromInnerHTML(contentElem);
    contentElem.textContent = '';  // Remove DOM nodes that are no longer needed.
  }
}
