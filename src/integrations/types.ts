export type ConnectionStatus =
  | 'not-connected'
  | 'connected'
  | 'needs-reauthorization'
  | 'error';

export interface AppIntegration {
  id: 'facebook' | 'whatsapp' | 'messenger' | 'tiktok';
  name: string;
  description: string;
  providerUrl: string;
  accent: string;
  softAccent: string;
  authorizationMethod: string;
  authorizationDetails: string;
  supportedFeatures: string[];
  limitations: string;
  officialDocsUrl: string;
  status: ConnectionStatus;
}

export interface ActivityEntry {
  id: string;
  integrationId: AppIntegration['id'];
  action: 'opened';
  createdAt: string;
}
