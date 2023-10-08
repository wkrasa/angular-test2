import XRegExp from 'xregexp';

import {FirebaseRedirectConfig} from './FirebaseRedirector';
import {FirebaseRedirectSource} from './FirebaseRedirectSource';

export class FirebaseRedirect {
  source: FirebaseRedirectSource;
  destination: string;

  constructor(readonly rawConfig: FirebaseRedirectConfig) {
    this.source = (rawConfig.regex === undefined) ?
        FirebaseRedirectSource.fromGlobPattern(rawConfig.source) :
        FirebaseRedirectSource.fromRegexPattern(rawConfig.regex);
    this.destination = rawConfig.destination;
  }

  replace(url: string): string|undefined {
    const match = this.source.match(url);

    if (!match) {
      return undefined;
    }

    const namedReplacers = this.source.namedGroups.map<[RegExp, string]>(
        (name) =>
            [XRegExp(`:${name}`, 'g'),
             match[name],
    ]);
    const restReplacers = this.source.restNamedGroups.map<[RegExp, string]>(
        (name) =>
            [XRegExp(`:${name}\\*`, 'g'),
             match[name],
    ]);
    return XRegExp.replaceEach(this.destination, [...namedReplacers, ...restReplacers]);
  }
}
