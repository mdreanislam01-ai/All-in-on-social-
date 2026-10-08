export type SiteCategory =
  | 'Social'
  | 'Messaging'
  | 'Video & audio'
  | 'Creator tools'
  | 'Community & publishing'
  | 'Social management';

export interface DirectorySite {
  id: string;
  name: string;
  description: string;
  category: SiteCategory;
  url: string;
  domain: string;
  monogram: string;
  accent: string;
  featured?: boolean;
}

/** Orbit's own curated list. Each entry points to the service's public home page. */
export const directorySites: DirectorySite[] = [
  {
    id: 'facebook', name: 'Facebook', category: 'Social',
    description: 'Keep up with friends, groups, pages, and the communities you follow.',
    url: 'https://www.facebook.com/', domain: 'facebook.com', monogram: 'f', accent: '#3984f5', featured: true,
  },
  {
    id: 'instagram', name: 'Instagram', category: 'Social',
    description: 'A visual place to share photos, reels, stories, and creative ideas.',
    url: 'https://www.instagram.com/', domain: 'instagram.com', monogram: 'ig', accent: '#df5b9a', featured: true,
  },
  {
    id: 'x', name: 'X', category: 'Social',
    description: 'Follow live conversations, breaking updates, and people you care about.',
    url: 'https://x.com/', domain: 'x.com', monogram: 'x', accent: '#8b91a7',
  },
  {
    id: 'tiktok', name: 'TikTok', category: 'Social',
    description: 'Explore short-form video, new voices, and creative trends.',
    url: 'https://www.tiktok.com/', domain: 'tiktok.com', monogram: 'tt', accent: '#42d8d0', featured: true,
  },
  {
    id: 'linkedin', name: 'LinkedIn', category: 'Social',
    description: 'Build professional connections and discover ideas from your industry.',
    url: 'https://www.linkedin.com/', domain: 'linkedin.com', monogram: 'in', accent: '#3b8cc8',
  },
  {
    id: 'pinterest', name: 'Pinterest', category: 'Social',
    description: 'Collect inspiration and turn visual discoveries into your next project.',
    url: 'https://www.pinterest.com/', domain: 'pinterest.com', monogram: 'p', accent: '#e34a5b',
  },
  {
    id: 'snapchat', name: 'Snapchat', category: 'Social',
    description: 'Share moments with friends through camera-first conversations.',
    url: 'https://www.snapchat.com/', domain: 'snapchat.com', monogram: 'sc', accent: '#f1ca28',
  },
  {
    id: 'threads', name: 'Threads', category: 'Social',
    description: 'Join text-first conversations connected to the Instagram community.',
    url: 'https://www.threads.net/', domain: 'threads.net', monogram: 'th', accent: '#111418',
  },
  {
    id: 'bluesky', name: 'Bluesky', category: 'Social',
    description: 'A customizable social network for following people and public feeds.',
    url: 'https://bsky.app/', domain: 'bsky.app', monogram: 'bs', accent: '#67aafc',
  },
  {
    id: 'mastodon', name: 'Mastodon', category: 'Social',
    description: 'Discover independent communities across the open social web.',
    url: 'https://mastodon.social/', domain: 'mastodon.social', monogram: 'm', accent: '#8b72e9',
  },
  {
    id: 'whatsapp', name: 'WhatsApp', category: 'Messaging',
    description: 'Message people and groups, or continue in the official WhatsApp Web app.',
    url: 'https://web.whatsapp.com/', domain: 'web.whatsapp.com', monogram: 'wa', accent: '#29bd78', featured: true,
  },
  {
    id: 'messenger', name: 'Messenger', category: 'Messaging',
    description: 'Pick up conversations and calls in Meta’s dedicated messaging service.',
    url: 'https://www.messenger.com/', domain: 'messenger.com', monogram: 'ms', accent: '#4889f7', featured: true,
  },
  {
    id: 'telegram', name: 'Telegram', category: 'Messaging',
    description: 'Stay in touch through chats, broadcast channels, and large communities.',
    url: 'https://web.telegram.org/', domain: 'web.telegram.org', monogram: 'tg', accent: '#51a9d9',
  },
  {
    id: 'discord', name: 'Discord', category: 'Messaging',
    description: 'Gather in voice, text, and interest-based community spaces.',
    url: 'https://discord.com/app', domain: 'discord.com', monogram: 'dc', accent: '#7788f4',
  },
  {
    id: 'signal', name: 'Signal', category: 'Messaging',
    description: 'Private messaging and calls from an independent nonprofit service.',
    url: 'https://signal.org/', domain: 'signal.org', monogram: 'sg', accent: '#4d8cf5',
  },
  {
    id: 'slack', name: 'Slack', category: 'Messaging',
    description: 'Organize team discussions, shared channels, and day-to-day work.',
    url: 'https://slack.com/', domain: 'slack.com', monogram: 'sl', accent: '#8a69c9',
  },
  {
    id: 'teams', name: 'Microsoft Teams', category: 'Messaging',
    description: 'Meet and collaborate with your team in one connected workspace.',
    url: 'https://teams.microsoft.com/', domain: 'teams.microsoft.com', monogram: 'mt', accent: '#6c72df',
  },
  {
    id: 'line', name: 'LINE', category: 'Messaging',
    description: 'Chat, call, and share updates with friends and groups.',
    url: 'https://line.me/', domain: 'line.me', monogram: 'ln', accent: '#55c86f',
  },
  {
    id: 'youtube', name: 'YouTube', category: 'Video & audio',
    description: 'Watch channels, tutorials, live streams, and videos from around the world.',
    url: 'https://www.youtube.com/', domain: 'youtube.com', monogram: 'yt', accent: '#ff4b5e', featured: true,
  },
  {
    id: 'twitch', name: 'Twitch', category: 'Video & audio',
    description: 'Find live creators, gaming streams, and communities in real time.',
    url: 'https://www.twitch.tv/', domain: 'twitch.tv', monogram: 'tw', accent: '#9a72ed',
  },
  {
    id: 'vimeo', name: 'Vimeo', category: 'Video & audio',
    description: 'Watch and share thoughtfully produced video and creative work.',
    url: 'https://vimeo.com/', domain: 'vimeo.com', monogram: 'vm', accent: '#46a8e9',
  },
  {
    id: 'dailymotion', name: 'Dailymotion', category: 'Video & audio',
    description: 'Browse news, entertainment, and independent video publishers.',
    url: 'https://www.dailymotion.com/', domain: 'dailymotion.com', monogram: 'dm', accent: '#7c63df',
  },
  {
    id: 'spotify', name: 'Spotify', category: 'Video & audio',
    description: 'Play music and podcasts, and discover audio picked for you.',
    url: 'https://open.spotify.com/', domain: 'open.spotify.com', monogram: 'sp', accent: '#3bc77b',
  },
  {
    id: 'soundcloud', name: 'SoundCloud', category: 'Video & audio',
    description: 'Explore independent music, mixes, and new sounds from creators.',
    url: 'https://soundcloud.com/', domain: 'soundcloud.com', monogram: 'sc', accent: '#ff9651',
  },
  {
    id: 'canva', name: 'Canva', category: 'Creator tools',
    description: 'Make social graphics, presentations, and quick visual projects.',
    url: 'https://www.canva.com/', domain: 'canva.com', monogram: 'ca', accent: '#55a3ed', featured: true,
  },
  {
    id: 'capcut', name: 'CapCut', category: 'Creator tools',
    description: 'Edit clips and prepare short videos for your favorite platforms.',
    url: 'https://www.capcut.com/', domain: 'capcut.com', monogram: 'cc', accent: '#d8dce8',
  },
  {
    id: 'adobe-express', name: 'Adobe Express', category: 'Creator tools',
    description: 'Design polished posts, flyers, and short-form visual content.',
    url: 'https://www.adobe.com/express/', domain: 'adobe.com', monogram: 'ae', accent: '#f16b73',
  },
  {
    id: 'figma', name: 'Figma', category: 'Creator tools',
    description: 'Sketch interfaces and collaborate on ideas with a creative team.',
    url: 'https://www.figma.com/', domain: 'figma.com', monogram: 'fi', accent: '#d37ab1',
  },
  {
    id: 'reddit', name: 'Reddit', category: 'Community & publishing',
    description: 'Find focused communities, thoughtful threads, and lively discussions.',
    url: 'https://www.reddit.com/', domain: 'reddit.com', monogram: 'rd', accent: '#ff835e',
  },
  {
    id: 'tumblr', name: 'Tumblr', category: 'Community & publishing',
    description: 'Follow creative blogs and share a little of what makes you, you.',
    url: 'https://www.tumblr.com/', domain: 'tumblr.com', monogram: 'tu', accent: '#7890bb',
  },
  {
    id: 'medium', name: 'Medium', category: 'Community & publishing',
    description: 'Read essays and ideas from writers across a wide range of subjects.',
    url: 'https://medium.com/', domain: 'medium.com', monogram: 'md', accent: '#8fc4a2',
  },
  {
    id: 'substack', name: 'Substack', category: 'Community & publishing',
    description: 'Discover newsletters, podcasts, and independent publications.',
    url: 'https://substack.com/', domain: 'substack.com', monogram: 'su', accent: '#ff9865',
  },
  {
    id: 'quora', name: 'Quora', category: 'Community & publishing',
    description: 'Explore questions and answers shared by people with varied experience.',
    url: 'https://www.quora.com/', domain: 'quora.com', monogram: 'q', accent: '#e15b65',
  },
  {
    id: 'patreon', name: 'Patreon', category: 'Community & publishing',
    description: 'Support the artists, educators, and storytellers you follow.',
    url: 'https://www.patreon.com/', domain: 'patreon.com', monogram: 'pa', accent: '#fa786e',
  },
  {
    id: 'ko-fi', name: 'Ko-fi', category: 'Community & publishing',
    description: 'Find independent creators and the projects they share with supporters.',
    url: 'https://ko-fi.com/', domain: 'ko-fi.com', monogram: 'kf', accent: '#62bde5',
  },
  {
    id: 'buffer', name: 'Buffer', category: 'Social management',
    description: 'Plan a publishing rhythm and manage social posts from one workspace.',
    url: 'https://buffer.com/', domain: 'buffer.com', monogram: 'bu', accent: '#71a6f8',
  },
  {
    id: 'hootsuite', name: 'Hootsuite', category: 'Social management',
    description: 'Coordinate social publishing and monitoring across channels.',
    url: 'https://www.hootsuite.com/', domain: 'hootsuite.com', monogram: 'ho', accent: '#f08080',
  },
  {
    id: 'later', name: 'Later', category: 'Social management',
    description: 'Plan visual content and organize a publishing calendar.',
    url: 'https://later.com/', domain: 'later.com', monogram: 'la', accent: '#bf80e5',
  },
  {
    id: 'metricool', name: 'Metricool', category: 'Social management',
    description: 'Review channel performance and plan content in one dashboard.',
    url: 'https://metricool.com/', domain: 'metricool.com', monogram: 'me', accent: '#4cc6b2',
  },
  {
    id: 'sprout-social', name: 'Sprout Social', category: 'Social management',
    description: 'Manage customer conversations and publishing across social channels.',
    url: 'https://sproutsocial.com/', domain: 'sproutsocial.com', monogram: 'ss', accent: '#87bf8b',
  },
  {
    id: 'meta-business-suite', name: 'Meta Business Suite', category: 'Social management',
    description: 'Manage eligible Facebook and Instagram business activity.',
    url: 'https://business.facebook.com/', domain: 'business.facebook.com', monogram: 'mb', accent: '#668cf0',
  },
  {
    id: 'youtube-studio', name: 'YouTube Studio', category: 'Social management',
    description: 'Review channel settings, publish videos, and follow creator analytics.',
    url: 'https://studio.youtube.com/', domain: 'studio.youtube.com', monogram: 'ys', accent: '#ed6871',
  },
  {
    id: 'tiktok-business', name: 'TikTok for Business', category: 'Social management',
    description: 'Find tools and information for organizations using TikTok.',
    url: 'https://www.tiktok.com/business/en', domain: 'tiktok.com', monogram: 'tb', accent: '#55c9c2',
  },
  {
    id: 'pinterest-business', name: 'Pinterest Business', category: 'Social management',
    description: 'Explore business resources for reaching people on Pinterest.',
    url: 'https://business.pinterest.com/', domain: 'business.pinterest.com', monogram: 'pb', accent: '#ed6871',
  },
  {
    id: 'linkedin-campaign-manager', name: 'LinkedIn Campaign Manager', category: 'Social management',
    description: 'Access LinkedIn’s advertising tools and campaign workspace.',
    url: 'https://www.linkedin.com/campaignmanager/', domain: 'linkedin.com', monogram: 'lc', accent: '#55a2d5',
  },
];

export const directoryCategories: SiteCategory[] = [
  'Social',
  'Messaging',
  'Video & audio',
  'Creator tools',
  'Community & publishing',
  'Social management',
];

export function getDirectorySite(id: string | null | undefined): DirectorySite | undefined {
  if (!id) return undefined;
  return directorySites.find((site) => site.id === id);
}
