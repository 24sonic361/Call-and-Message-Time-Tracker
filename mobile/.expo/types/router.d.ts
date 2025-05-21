/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/pincode`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/tabs/call`; params?: Router.UnknownInputParams; } | { pathname: `/tabs/sms`; params?: Router.UnknownInputParams; } | { pathname: `/tabs/sync`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/pincode`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/tabs/call`; params?: Router.UnknownOutputParams; } | { pathname: `/tabs/sms`; params?: Router.UnknownOutputParams; } | { pathname: `/tabs/sync`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/pincode${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `/tabs/call${`?${string}` | `#${string}` | ''}` | `/tabs/sms${`?${string}` | `#${string}` | ''}` | `/tabs/sync${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/pincode`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/tabs/call`; params?: Router.UnknownInputParams; } | { pathname: `/tabs/sms`; params?: Router.UnknownInputParams; } | { pathname: `/tabs/sync`; params?: Router.UnknownInputParams; };
    }
  }
}
