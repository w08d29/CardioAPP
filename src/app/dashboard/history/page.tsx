
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/localization-context';
import { History } from 'lucide-react';

export default function HistoryPage() {
  const { t } = useLocalization();

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('history.title')}</h1>
        <p className="text-muted-foreground">{t('history.description')}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t('history.recentActivity')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('history.noActivity')}</p>
          {/* In a real application, a list of historical events would be rendered here. */}
        </CardContent>
      </Card>
    </div>
  );
}
