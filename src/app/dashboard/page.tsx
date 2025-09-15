
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLocalization } from '@/context/localization-context';
import { PlusCircle, User, Calendar, Stethoscope, HeartPulse, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

type Patient = {
  id: number;
  name: string;
  lastVisit: string;
  diagnosis: string;
  status: 'New' | 'Analyzed' | 'Urgent';
};

const getPatients = async (): Promise<Patient[]> => {
    // In a real application, this would fetch data from an API.
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return [
        { id: 1, name: 'Michael Williams', lastVisit: '2024-07-05', diagnosis: 'Arrhythmia', status: 'Analyzed' },
    ];
}


export default function DashboardPage() {
  const { t } = useLocalization();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatients = async () => {
        setLoading(true);
        const data = await getPatients();
        setPatients(data);
        setLoading(false);
    }
    loadPatients();
  }, []);

  const getStatusVariant = (status: Patient['status']) => {
    switch (status) {
      case 'Urgent':
        return 'destructive';
      case 'New':
        return 'secondary';
      case 'Analyzed':
      default:
        return 'default';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
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
          <CardDescription>{t('dashboard.patientListDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
                <HeartPulse className="h-8 w-8 animate-pulse text-primary" />
            </div>
          ) : patients.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('dashboard.patientName')}</TableHead>
                        <TableHead>{t('dashboard.lastVisit')}</TableHead>
                        <TableHead>{t('dashboard.status')}</TableHead>
                        <TableHead className="text-right">{t('dashboard.diagnosis')}</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {patients.map((patient) => (
                        <TableRow key={patient.id}>
                            <TableCell className="font-medium">{patient.name}</TableCell>
                            <TableCell>{patient.lastVisit}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(patient.status)}>{patient.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">{patient.diagnosis}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>{t('dashboard.viewPatient')}</DropdownMenuItem>
                                        <DropdownMenuItem>{t('dashboard.editPatient')}</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
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
