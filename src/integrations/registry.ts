import type { AppIntegration } from './types';

/**
 * The integration registry is the single source of truth for app cards, the
 * open screen, activity, settings and the details dialog.
 *
 * Rules this file must keep honouring:
 * - `providerUrl` is the real, official HTTPS address. Every open button in the
 *   UI renders it as a plain `<a href>` — no iframe, no proxy, no service worker
 *   trickery, and no attempt to strip `X-Frame-Options` or `frame-ancestors`.
 * - Provider status is never inferred from a visit. Only a verified OAuth/API
 *   callback may change it to `connected`, and no adapter for that exists yet.
 * - Nothing here collects or stores a social password, and Orbit ships no login
 *   form for any of these providers.
 */
export const integrations: AppIntegration[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Open facebook.com; Facebook Login stays on Meta’s site',
    descriptionBn: 'facebook.com আসল লিংকে খুলুন — লগইন সবসময় Facebook-এর নিজের সাইটে।',
    providerUrl: 'https://www.facebook.com/',
    appHijacksLinks: true,
    phoneIssueBn: 'ফোনে Facebook অ্যাপ ইনস্টল থাকলে facebook.com-এর লিংক ফোন নিজে অ্যাপে পাঠিয়ে দেয় — তাই বোতাম চাপলেও অনেক সময় মনে হয় কিছুই হলো না।',
    phoneFixBn: [
      'এই ডিভাইসে Orbit লিংকটা স্বয়ংক্রিয়ভাবে Chrome-এ খোলে। অ্যাপেই চাইলে নিচের “আমি অ্যাপেই খুলতে চাই” সুইচটা চালু করুন।',
      'স্থায়ী সমাধান — Android: Settings → Apps → Facebook → Open by default → Open supported links → “Don’t open” বেছে নিন।',
      'তারপর এই পেজে ফিরে এসে লিংকটা আবার চাপুন — এবার ব্রাউজারেই খুলবে।',
    ],
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
      'Facebook refuses to run inside another website’s frame, so an embedded view can only ever be blank, and a phone often hands the link to the Facebook app. Orbit does not fight either behaviour: it links straight to facebook.com and leaves the browser Back button as your way home. No login page is copied and no password is collected.',
    openNoteBn: 'ফোন চাইলে লিংকটা নিজের Facebook অ্যাপে নিয়ে যেতে পারে — সেখানেও লগইন অফিসিয়ালই থাকে।',
    returnNoteBn: 'লগইন শেষে ব্রাউজারের ব্যাক বাটন চাপলেই এই পেজে ফিরে আসবেন।',
    officialDocsUrl: 'https://developers.facebook.com/documentation/facebook-login/web',
    status: 'not-connected',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Open WhatsApp Web; sign-in and QR stay on WhatsApp',
    descriptionBn: 'web.whatsapp.com খুলুন — QR মিলানো ও লগইন শুধু WhatsApp-এর নিজের সাইটে।',
    providerUrl: 'https://web.whatsapp.com/',
    appHijacksLinks: false,
    phoneIssueBn: 'মোবাইল ব্রাউজারে WhatsApp Web নিজেই বলে এটি কম্পিউটারের জন্য, আর ফোনের WhatsApp অ্যাপ খুলতে চাপ দেয় — QR পেজটা তখন দেখায় না।',
    phoneFixBn: [
      'Chrome মেনু (⋮) → “Desktop site” চালু করুন, তারপর লিংকটা আবার চাপুন — QR কোড পেজ তখনই ওঠে।',
      'QR স্ক্যান করতে যে ফোনে WhatsApp চালু আছে সেটাই লাগবে — এটা WhatsApp-এর নিজের নিয়ম।',
      'মোবাইলে আসল অভিজ্ঞতা যদি চাই, ফোনের WhatsApp অ্যাপই অফিসিয়াল পথ — সেখানেও Orbit কিছু দেখে না।',
    ],
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
      'WhatsApp Web will not be framed and does not redirect back to another website after sign-in; on a phone browser it asks for a desktop or the app. Orbit only hands you the official address, so nothing here mirrors a personal inbox. This entry is a shortcut, not WhatsApp Business Platform access.',
    openNoteBn: 'মোবাইল ব্রাউজারকে WhatsApp Web প্রায়ই ডেস্কটপ চাইতে বলে। চল না গেলে “নতুন ট্যাবে খুলুন” বা ফোনের WhatsApp অ্যাপ ব্যবহার করুন।',
    returnNoteBn: 'WhatsApp লগইনের পর নিজের সাইটেই থাকে, ফেরত পাঠায় না — তাই ব্যাক বাটন চাপুন।',
    officialDocsUrl:
      'https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview',
    status: 'not-connected',
  },
  {
    id: 'messenger',
    name: 'Messenger',
    description: 'Open messenger.com; Page tooling stays on Meta’s site',
    descriptionBn: 'messenger.com খুলুন — লগইন ও ইনবক্স শুধু Meta-র নিজের সাইটেই।',
    providerUrl: 'https://www.messenger.com/',
    appHijacksLinks: false,
    phoneIssueBn: 'ফোনে messenger.com খুললেই প্রায়ই “অ্যাপ নামাও” ওয়াল ওঠে — এটা Orbit-এর বাধা নয়, Meta-র নিজের আচরণ (মোবাইলে ওরা অ্যাপেই পাঠাতে চায়)।',
    phoneFixBn: [
      'Chrome মেনু (⋮) → “Desktop site” চালু করে পেজটা রিলোড করলে ওয়েব ভার্সন খোলে।',
      'ওয়াল বারবার এলে Messenger অ্যাপ থেকেই চালিয়ে যান — সেখানেও লগইন অফিসিয়াল, Orbit কিছু দেখে না।',
    ],
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
      'Messenger blocks embedding and does not send you back to another website after login, which is why an in-page frame showed a broken request instead of a chat. Orbit links to messenger.com and keeps this page open as your way back. It is not a personal inbox mirror.',
    openNoteBn: 'মেসেঞ্জার লগইন শেষে আপনার সাইটে ফেরত পাঠায় না; এই ট্যাবে থাকলে ব্যাক বাটনে ফিরবেন, নতুন ট্যাব দিলে Orbit খোলাই থাকবে।',
    returnNoteBn: 'এই পেজ বন্ধ হচ্ছে না — চাইলে “নতুন ট্যাবে খুলুন” বেছে নিন।',
    officialDocsUrl: 'https://developers.facebook.com/documentation/business-messaging/messenger-platform',
    status: 'not-connected',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Open tiktok.com; TikTok Login Kit stays on TikTok',
    descriptionBn: 'tiktok.com খুলুন — লগইন সবসময় TikTok-এর নিজের সাইটে বা অ্যাপে।',
    providerUrl: 'https://www.tiktok.com/',
    browserUrl: 'https://www.tiktok.com/explore',
    appHijacksLinks: true,
    phoneIssueBn: 'ফোনে TikTok অ্যাপ থাকলে tiktok.com-এর লিংক চুপিচুপি অ্যাপে চলে যায়, আর মূল পেজটা ব্রাউজারে লগইন ছাড়া খুলতে চায় না — তাই ট্যাপ করলেও মনে হয় কিছু হয়নি।',
    phoneFixBn: [
      'Orbit এই ডিভাইসে টিকটকের ব্রাউজার-বান্ধব ঠিকানা (tiktok.com/explore) Chrome-এ খোলে। মূল ঠিকানা চাইলে নিচের “মূল ঠিকানা ব্যবহার করুন” সুইচ চালু করুন।',
      'স্থায়ী সমাধান — Android: Settings → Apps → TikTok → Open by default → Open supported links → “Don’t open” বেছে নিন।',
      'তারপর “নতুন ট্যাবে আবার চেষ্টা করুন” চাপুন — এবার ব্রাউজারেই খুলবে।',
    ],
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
      'TikTok blocks embedding, so a frame inside this site stays blank, and the installed app frequently intercepts the tap so it looks like nothing happened. Orbit links to tiktok.com directly; when you arrived here from another app’s built-in browser, an extra “Chrome” link is offered. TikTok login is never reproduced.',
    openNoteBn: 'TikTok বা Instagram-এর ভিতরের ব্রাউজার থেকে এসে থাকলে লিংক অ্যাপে চলে যেতে পারে; সেক্ষেত্রে নিচের Chrome লিংকটা ব্যবহার করুন।',
    returnNoteBn: 'লগইন শেষে ব্যাক বাটন চাপলে Orbit-এর এই পেজ পাবেন।',
    officialDocsUrl: 'https://developers.tiktok.com/docs/en/login-kit-overview',
    status: 'not-connected',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Open youtube.com; Google OAuth covers the YouTube APIs',
    descriptionBn: 'youtube.com খুলুন — Google লগইন শুধু youtube.com/Google-এর নিজের সাইটে।',
    providerUrl: 'https://www.youtube.com/',
    appHijacksLinks: false,
    phoneIssueBn: 'কিছু ফোনে youtube.com চাপলে YouTube অ্যাপ লিংকটা নিয়ে নেয়, আর ব্রাউজারে খুললেও মাঝে মাঝে “অ্যাপে খুলুন?” প্রম্পট আসে।',
    phoneFixBn: [
      'ব্রাউজারেই থাকতে চাইলে — Android: Settings → Apps → YouTube → Open by default → “Don’t open” বেছে নিন।',
      'মোবাইলে ভিডিও ছোট দেখালে Chrome মেনু (⋮) → “Desktop site” চালু করুন।',
      'অ্যাপে খোলাটা ভুল নয় — সেখানেও Google লগইন অফিসিয়ালই, Orbit কিছু সংরক্ষণ করে না।',
    ],
    accent: '#ff0033',
    softAccent: '#ffeff1',
    authorizationMethod: 'Google Identity Services · OAuth 2.0 + YouTube Data API v3',
    authorizationDetails:
      'YouTube API access is authorized with OAuth 2.0 through a Google Cloud project and its consent screen. YouTube Data API v3 reads and writes channel, playlist and video resources; YouTube Analytics and Reporting APIs need extra scopes and an approved quota.',
    supportedFeatures: [
      'Official Google-hosted sign-in and consent',
      'Data API v3 calls limited to the granted scopes',
      'YouTube Analytics and Reporting APIs once approved',
    ],
    limitations:
      'youtube.com will not render inside another website’s frame; the only supported embed is the official video player, which is a player and not the site or a login page. Orbit therefore links to youtube.com itself. Visiting it does not authorize a Google account for any API.',
    openNoteBn: 'Google অ্যাকাউন্টের লগইন লাগলে সেটা youtube.com-এর নিজের পেজেই করুন। Orbit কোনো Google পাসওয়ার্ড বা টোকেন দেখে না, রাখে না।',
    returnNoteBn: 'লগইন শেষে ব্যাক বাটন চাপলে এই পেজে ফিরে আসবেন, অথবা নতুন ট্যাব বেছে নিন।',
    officialDocsUrl: 'https://developers.google.com/youtube/v3/getting-started',
    status: 'not-connected',
  },
];

export function getIntegration(id: string | null | undefined): AppIntegration | undefined {
  if (!id) return undefined;
  return integrations.find((integration) => integration.id === id);
}
