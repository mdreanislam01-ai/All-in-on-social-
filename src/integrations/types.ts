export type ConnectionStatus =
  | 'not-connected'
  | 'connected'
  | 'needs-reauthorization'
  | 'error';

export type IntegrationId = 'facebook' | 'whatsapp' | 'messenger' | 'tiktok' | 'youtube';

export interface AppIntegration {
  id: IntegrationId;
  name: string;
  /** English summary used for search + assistive text. */
  description: string;
  /** Bengali summary shown on the card and on the open screen. */
  descriptionBn: string;
  /**
   * The only address an open button may point at. It is a plain HTTPS link to
   * the provider's own site: never a proxy, never a frame, never a local copy.
   */
  providerUrl: string;
  /**
   * An optional alternate *official* address on the exact same origin as
   * `providerUrl` that loads better in a phone browser (e.g. TikTok's root
   * page insists on the app, `/explore` stays on the web). `openUrlFor()` in
   * launch.ts refuses any value on another origin and falls back to
   * `providerUrl`. Never a third-party viewer, scraper or downloader.
   */
  browserUrl?: string;
  /**
   * True only when the provider's own mobile app is known to intercept taps on
   * its web address (Facebook, TikTok), so the browser tap looks dead. Only on
   * Android and only for these entries may the same-tab href be wrapped in an
   * `intent://` that pins the destination to Chrome.
   */
  appHijacksLinks?: boolean;
  /** Bengali explanation of what actually goes wrong for this site on a phone. */
  phoneIssueBn: string;
  /** Bengali, ordered, real fixes for that phone problem. */
  phoneFixBn: string[];
  accent: string;
  softAccent: string;
  authorizationMethod: string;
  authorizationDetails: string;
  supportedFeatures: string[];
  limitations: string;
  /** Bengali line on the open screen about what happens once the site is open. */
  openNoteBn: string;
  /** Bengali line on the open screen about how to come back to Orbit. */
  returnNoteBn: string;
  officialDocsUrl: string;
  /**
   * Static, deliberately inert. A visit to `providerUrl` must never change
   * this; only a verified provider callback may set `connected`.
   */
  status: ConnectionStatus;
}

export interface ActivityEntry {
  id: string;
  integrationId: IntegrationId;
  action: 'opened' | 'returned';
  createdAt: string;
}
