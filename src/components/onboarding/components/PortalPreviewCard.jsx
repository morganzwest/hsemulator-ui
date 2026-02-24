'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Hash } from 'lucide-react';

const ICON_MAP = {
  briefcase: '💼',
  building: '🏢',
  rocket: '🚀',
  star: '⭐',
  heart: '❤️',
  bolt: '⚡',
  shield: '🛡️',
  code: '💻',
  database: '🗄️',
  cloud: '☁️',
  settings: '⚙️',
  chart: '📊'
};

const COLOR_CLASSES = {
  blue: 'bg-blue-500',
  green: 'bg-green-500', 
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  pink: 'bg-pink-500',
  gray: 'bg-gray-500'
};

export default function PortalPreviewCard({ portalId, portalName, icon, color }) {
  const getPortalIcon = (iconName) => {
    return ICON_MAP[iconName] || '💼';
  };

  const getColorClass = (colorName) => {
    return COLOR_CLASSES[colorName] || COLOR_CLASSES.blue;
  };

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          {/* Portal Icon */}
          <div className={`w-16 h-16 rounded-xl ${getColorClass(color)} flex items-center justify-center text-2xl shrink-0`}>
            {getPortalIcon(icon)}
          </div>

          {/* Portal Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {portalName || 'Portal Name'}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Hash className="w-4 h-4 mr-1 shrink-0" />
              <span className="font-mono">{portalId || '1234567890'}</span>
            </div>
            <Badge variant="outline" className="mt-2 inline-flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>HubSpot Portal</span>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
