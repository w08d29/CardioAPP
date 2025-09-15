
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/context/localization-context';
import { PlusCircle, User, Calendar, Stethoscope } from 'lucide-react';
import Link from 'next/link';

// Mock data for patients
const mockPatients = [
  { id: 1, name: 'John Doe', age: 58, lastVisit: '2024-05-10', diagnosis: 'Coronary Artery Disease' },
  { id: 2, name: 'Jane Smith', age: 65, lastVisit: '2024-05-12', diagnosis: 'Needs further analysis' },
  { id: 3, name: 'Peter Jones', age: 72, lastVisit: '2024-05-15', diagnosis: 'Valvular Heart Disease' },
];

export default function DashboardPage() {
  const { t } = useLocalization();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.description')}</p>
        </div>
        <Link href="/dashboard/patients/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('dashboard.addPatient')}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.patientListTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {mockPatients.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockPatients.map((patient) => (
                <Card key={patient.id} className="flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="h-5 w-5 text-primary" />
                            {patient.name}
                        </CardTitle>
                    </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold w-20">{t('dashboard.age')}:</span>
                        <span className="text-muted-foreground">{patient.age}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground"/>
                        <span className="font-semibold w-20">{t('dashboard.lastVisit')}:</span>
                        <span className="text-muted-foreground">{patient.lastVisit}</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Stethoscope className="h-4 w-4 text-muted-foreground mt-1"/>
                        <div className="flex flex-col">
                            <span className="font-semibold">{t('dashboard.diagnosis')}:</span>
                            <span className="text-muted-foreground">{patient.diagnosis}</span>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">{t('dashboard.noPatients')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
