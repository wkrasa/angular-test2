import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { AsyncSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { htmlEscape } from 'safevalues';
import { htmlSafeByReview } from 'safevalues/restricted/reviewed';

import { DocumentContents, UnsafeDocumentContents } from './document-contents';
export { DocumentContents } from './document-contents';

import { LocationService } from 'app/shared/location.service';
import { Logger } from 'app/shared/logger.service';

export const FILE_NOT_FOUND_ID = 'file-not-found';
export const FETCHING_ERROR_ID = 'fetching-error';

export const CONTENT_URL_PREFIX = 'generated/';
export const DOC_CONTENT_URL_PREFIX = CONTENT_URL_PREFIX + 'docs/';
const FETCHING_ERROR_CONTENTS = (path: string) => htmlSafeByReview(`
  <div class="nf-container l-flex-wrap flex-center">
    <div class="nf-icon material-icons">error_outline</div>
    <div class="nf-response l-flex-wrap center">
      <h1 class="no-toc">Request for document failed</h1>
      <p>
        We are unable to retrieve the "${htmlEscape(path)}" page at this time.
        <br/>
        Please check your connection and try again later.
      </p>
    </div>
  </div>
`, 'inline HTML with interpolations escaped');

@Injectable()
export class DocumentService {

  private cache = new Map<string, Observable<DocumentContents>>();

  currentDocument: Observable<DocumentContents>;

  constructor(
    private logger: Logger,
    private http: HttpClient,
    location: LocationService) {
    // Whenever the URL changes we try to get the appropriate doc
    this.currentDocument = location.currentPath.pipe(switchMap(path => this.getDocument(path)));
  }

  private getDocument(url: string) {
    const id = url || 'index';
    this.logger.log('getting document', id);
    if (!this.cache.has(id)) {
      this.cache.set(id, this.fetchDocument(id));
    }
    return this.cache.get(id) as Observable<DocumentContents>;
  }

  private fetchDocument(id: string): Observable<DocumentContents> {
    const requestPath = `${DOC_CONTENT_URL_PREFIX}${encodeToLowercase(id)}.json`;
    const subject = new AsyncSubject<DocumentContents>();

    this.logger.log('fetching document from', requestPath);
    this.http.get<UnsafeDocumentContents>(requestPath, {responseType: 'json'})
        .pipe(
            tap(data => {
              if (!data || typeof data !== 'object') {
                this.logger.log('received invalid data:', data);
                throw Error('Invalid data');
              }
            }),
            map((data: UnsafeDocumentContents) => ({
              id: data.id,
              contents: data.contents === null ?
                  null :
                  // SECURITY: HTML is authored by the documentation team and is fetched directly
                  // from the server
                  htmlSafeByReview(data.contents, '^')
            })),
            catchError((error: HttpErrorResponse) =>
              error.status === 404 ? this.getFileNotFoundDoc(id) : this.getErrorDoc(id, error)
            ),
        )
        .subscribe(subject);

    return subject.asObservable();
  }

  private getFileNotFoundDoc(id: string): Observable<DocumentContents> {
    if (id !== FILE_NOT_FOUND_ID) {
      this.logger.error(new Error(`Document file not found at '${id}'`));
      // using `getDocument` means that we can fetch the 404 doc contents from the server and cache it
      return this.getDocument(FILE_NOT_FOUND_ID);
    } else {
      return of({
        id: FILE_NOT_FOUND_ID,
        contents: htmlEscape('Document not found')
      });
    }
  }

  private getErrorDoc(id: string, error: HttpErrorResponse): Observable<DocumentContents> {
    this.logger.error(new Error(`Error fetching document '${id}': (${error.message})`));
    this.cache.delete(id);
    return of({
      id: FETCHING_ERROR_ID,
      contents: FETCHING_ERROR_CONTENTS(id),
    });
  }
}

/**
 * Encode the path to the content in a deterministic, reversible, case-insensitive form.
 *
 * This avoids collisions on case-insensitive file-systems.
 *
 * - Escape underscores (_) to double underscores (__).
 * - Convert all uppercase letters to lowercase followed by an underscore.
 */
function encodeToLowercase(str: string): string {
  return str.replace(/[A-Z_]/g, char => char.toLowerCase() + '_');
}
