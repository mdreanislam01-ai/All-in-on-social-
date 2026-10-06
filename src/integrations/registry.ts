import type { AppIntegration } from './types';

/**
 * The integration registry is the single source of truth for app cards,
 * activity, settings, and the integration details dialog. Provider status is
 * intentionally not inferred from an external-site visit: only a verified
 * OAuth/API callback should ever change it to `connected`.
 */
export const integrations: AppIntegration[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Connect and access supported Facebook features',
    providerUrl: 'https://www.facebook.com/',
    accent: '#1877f2',
    softAccent: '#edf4ff',
    authorizationMethod: 'Meta Facebook Login · OAuth 2.0',
    authorizationDetails:
      'Facebook Login can authorize a person and, with the permissions they grant, expose supported Graph API data. App review and business verification may be required for additional permissions.',
    supportedFeatures: [
      'Official Facebook-hosted sign-in and consent',
      'Basic profile data where permitted',
      'Graph API features approved for your app',
    ],
    limitations:
      'Facebook refuses to run inside another website’s frame, and phones often hand the link to the Facebook app, so the click looks like it did nothing. Orbit opens an in-site workspace instead of a blank frame, then sends you to the official site with a return button. It does not copy the login page or your password.',
    officialDocsUrl: 'https://developers.facebook.com/documentation/facebook-login/web',
    status: 'not-connected',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Connect and access supported WhatsApp features',
    providerUrl: 'https://web.whatsapp.com/',
    accent: '#20b968',
    softAccent: '#eaf8f0',
    authorizationMethod: 'WhatsApp Business Platform · Embedded Signup',
    authorizationDetails:
      'Meta Embedded Signup is the official onboarding flow for businesses connecting WhatsApp Business Platform assets. It relies on Meta authorization and a server-side exchange for business access.',
    supportedFeatures: [
      'Official business onboarding and asset authorization',
      'Cloud API messaging for eligible business accounts',
      'Webhooks and approved business workflows',
    ],
    limitations:
      'WhatsApp Web does not redirect back to another website after login, and it refuses to be embedded. Orbit keeps this page open so you can return after signing in on the official site. It is not a personal inbox copy.',
    officialDocsUrl:
      'https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview',
    status: 'not-connected',
  },
  {
    id: 'messenger',
    name: 'Messenger',
    description: 'Connect and access supported Messenger features',
    providerUrl: 'https://www.messenger.com/',
    accent: '#0866ff',
    softAccent: '#edf3ff',
    authorizationMethod: 'Messenger Platform · Page messaging APIs',
    authorizationDetails:
      'Meta’s Messenger Platform supports eligible messaging workflows for Facebook Pages. It uses Meta permissions, Page access, and webhook/API configuration.',
    supportedFeatures: [
      'Messaging workflows for eligible Facebook Pages',
      'Official Meta authorization and permission prompts',
      'Webhooks and supported message types',
    ],
    limitations:
      'Messenger does not send you back to another website after login, and it cannot be framed. Use Orbit’s return button, or open it in this tab and press the browser back button. This is not a personal inbox mirror.',
    officialDocsUrl: 'https://developers.facebook.com/documentation/business-messaging/messenger-platform',
    status: 'not-connected',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Connect and access supported TikTok features',
    providerUrl: 'https://www.tiktok.com/',
    accent: '#161823',
    softAccent: '#f0f1f4',
    authorizationMethod: 'TikTok Login Kit · OAuth 2.0 + Display API',
    authorizationDetails:
      'TikTok Login Kit provides an official OAuth 2.0 authorization flow. The Display API can return profile and video data for approved scopes after the user consents.',
    supportedFeatures: [
      'Official TikTok-hosted authorization',
      'Basic profile details for granted scopes',
      'Display API data approved for your app',
    ],
    limitations:
      'TikTok blocks embedding, so an in-page frame stays blank, and the phone app often swallows the link. Orbit opens a workspace on this website and a Chrome/official-window fallback, with a return button. It does not copy TikTok login.',
    officialDocsUrl: 'https://developers.tiktok.com/docs/en/login-kit-overview',
    status: 'not-connected',
  },
];

export function getIntegration(id: AppIntegration['id']): AppIntegration | undefined {
  return integrations.find((integration) => integration.id === id);
}
