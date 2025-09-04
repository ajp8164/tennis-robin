import Config from 'react-native-config';

export interface AppConfig
  extends Record<string, string | string[] | boolean | number | undefined> {
  appName: string;
  appNameNS: string;
  buildEnvironment: string;
  businessName: string;
  businessNameShort: string;
  deepLinkScheme: string;
  environment: string;
  firebaseOauthClientId: string;
  googleSignInWebClientId: string;
  persistStoreVersion: string;
  privacyUrl: string;
  requireReAuthDays: number;
  sentryEndpoint: string;
  sentryLoggingEnabled: boolean;
  storageAllocation: number;
  storageImageUsers: string;
  storageSchemaVersion: number;
  supportEmail: string;
  supportUrl: string;
  websiteUrl: string;
}

export const appConfig: AppConfig = {
  appName: Config.APP_NAME || '',
  appNameNS: Config.APP_NAME_NS || '',
  buildEnvironment: Config.BUILD_ENVIRONMENT || '',
  businessName: Config.BUSINESS_NAME || '',
  businessNameShort: Config.BUSINESS_NAME_SHORT || '',
  deepLinkScheme: Config.DEEP_LINK_SCHEME || '',
  environment: Config.ENVIRONMENT || '',
  firebaseOauthClientId: Config.FIREBASE_OAUTH_CLIENT_ID || '',
  googleSignInWebClientId: Config.GOOGLE_SIGN_IN_WEB_CLIENT_ID || '',
  persistStoreVersion: Config.PERSIST_STORE_VERSION || '',
  privacyUrl: Config.PRIVACY_URL || '',
  requireReAuthDays: Number(Config.REQUIRE_REAUTH_DAYS) || 0,
  sentryEndpoint: Config.SENTRY_ENDPOINT || '',
  sentryLoggingEnabled: Config.SENTRY_LOGGING_ENABLED === 'true' ? true : false,
  storageAllocation: Number(Config.STORAGE_ALLOCATION) || 0,
  storageImageUsers: Config.STORAGE_IMAGE_USERS || '',
  storageSchemaVersion: Number(Config.STORAGE_SCHEMA_VERSION) || 0,
  supportEmail: Config.SUPPORT_EMAIL || '',
  supportUrl: Config.SUPPORT_URL || '',
  websiteUrl: Config.WEBSITE_URL || '',
};
