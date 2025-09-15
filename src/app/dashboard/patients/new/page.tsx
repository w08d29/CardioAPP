
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  analyzePatientData,
  AnalyzePatientDataInput,
  AnalyzePatientDataOutput,
} from '@/ai/flows/ai-driven-diagnostic-assistance';
import { useLocalization } from '@/context/localization-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const arterySchema = z.object({
  LM: z.coerce.number().min(0).max(100).optional(),
  LADprox: z.coerce.number().min(0).max(100).optional(),
  LADmid: z.coerce.number().min(0).max(100).optional(),
  LADdist: z.coerce.number().min(0).max(100).optional(),
  D1: z.coerce.number().min(0).max(100).optional(),
  D2: z.coerce.number().min(0).max(100).optional(),
  LCxprox: z.coerce.number().min(0).max(100).optional(),
  LCxdist: z.coerce.number().min(0).max(100).optional(),
  OM1: z.coerce.number().min(0).max(100).optional(),
  OM2: z.coerce.number().min(0).max(100).optional(),
  RCAprox: z.coerce.number().min(0).max(100).optional(),
  RCAmid: z.coerce.number().min(0).max(100).optional(),
  RCAdist: z.coerce.number().min(0).max(100).optional(),
  PDA: z.coerce.number().min(0).max(100).optional(),
  PL: z.coerce.number().min(0).max(100).optional(),
});

const formSchema = z.object({
  coronaryAngiography: z.object({
    affectedArteries: arterySchema.optional(),
    ejectionFraction: z.coerce.number().min(0).max(100).optional(),
  }).optional(),
  echoCGData: z.object({
    globalContractility: z.enum(['Impaired', 'Not impaired']).optional(),
    aorticStenosis: z.coerce.number().min(0).max(4).optional(),
    aorticRegurgitation: z.coerce.number().min(0).max(4).optional(),
    mitralStenosis: z.coerce.number().min(0).max(4).optional(),
    mitralRegurgitation: z.coerce.number().min(0).max(4).optional(),
    tricuspidStenosis: z.coerce.number().min(0).max(4).optional(),
    tricuspidRegurgitation: z.coerce.number().min(0).max(4).optional(),
    pulmonaryStenosis: z.coerce.number().min(0).max(4).optional(),
    pulmonaryRegurgitation: z.coerce.number().min(0).max(4).optional(),
  }).optional(),
  bloodTests: z.object({
    completeBloodCount: z.object({
      hemoglobin: z.coerce.number().optional(),
      redBloodCells: z.coerce.number().optional(),
      hematocrit: z.coerce.number().optional(),
      colorIndex: z.coerce.number().optional(),
      meanCorpuscularVolume: z.coerce.number().optional(),
      platelets: z.coerce.number().optional(),
      whiteBloodCells: z.coerce.number().optional(),
    }).optional(),
    wbcDifferential: z.object({
      bandNeutrophils: z.coerce.number().optional(),
      segmentedNeutrophils: z.coerce.number().optional(),
      eosinophils: z.coerce.number().optional(),
      basophils: z.coerce.number().optional(),
      lymphocytes: z.coerce.number().optional(),
      monocytes: z.coerce.number().optional(),
    }).optional(),
    additionalMarkers: z.object({
      ESR: z.coerce.number().optional(),
      reticulocytes: z.coerce.number().optional(),
    }).optional(),
    cardiomarkers: z.object({
      troponinT: z.coerce.number().optional(),
      creatineKinase: z.coerce.number().optional(),
      ckMB: z.coerce.number().optional(),
    }).optional(),
  }).optional(),
});

type FormData = z.infer<typeof formSchema>;

const lcaArteries: (keyof z.infer<typeof arterySchema>)[] = ['LM', 'LADprox', 'LADmid', 'LADdist', 'D1', 'D2', 'LCxprox', 'LCxdist', 'OM1', 'OM2'];
const rcaArteries: (keyof z.infer<typeof arterySchema>)[] = ['RCAprox', 'RCAmid', 'RCAdist', 'PDA', 'PL'];
const valves: ('aortic' | 'mitral' | 'tricuspid' | 'pulmonary')[] = ['aortic', 'mitral', 'tricuspid', 'pulmonary'];
const cbcFields: (keyof z.infer<typeof formSchema>['bloodTests']['completeBloodCount'])[] = ['hemoglobin', 'redBloodCells', 'hematocrit', 'colorIndex', 'meanCorpuscularVolume', 'platelets', 'whiteBloodCells'];
const wbcFields: (keyof z.infer<typeof formSchema>['bloodTests']['wbcDifferential'])[] = ['bandNeutrophils', 'segmentedNeutrophils', 'eosinophils', 'basophils', 'lymphocytes', 'monocytes'];
const additionalMarkerFields: (keyof z.infer<typeof formSchema>['bloodTests']['additionalMarkers'])[] = ['ESR', 'reticulocytes'];
const cardiomarkerFields: (keyof z.infer<typeof formSchema>['bloodTests']['cardiomarkers'])[] = ['troponinT', 'creatineKinase', 'ckMB'];

export default function NewPatientPage() {
  const { t, language } = useLocalization();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzePatientDataOutput | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setAnalysisResult(null);

    const input: AnalyzePatientDataInput = {
      ...values,
      language: language === 'ru' ? 'Russian' : 'English',
    };
    
    try {
      const result = await analyzePatientData(input);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing patient data:', error);
      toast({
        title: t('general.error'),
        description: t('newPatient.analysisError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const renderArteryFields = (arteryList: (keyof z.infer<typeof arterySchema>)[]) => {
    return arteryList.map((fieldName) => (
      <FormField
        key={fieldName}
        control={form.control}
        name={`coronaryAngiography.affectedArteries.${fieldName}`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fieldName}</FormLabel>
            <FormControl>
              <Input type="number" placeholder={t('newPatient.lesion')} {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ));
  };
  
  const renderValveFields = (valveName: 'aortic' | 'mitral' | 'tricuspid' | 'pulmonary') => {
      return (
        <Card key={valveName}>
            <CardHeader>
                <CardTitle className="text-lg">{t(`newPatient.${valveName}`)}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                    control={form.control}
                    name={`echoCGData.${valveName}Stenosis`}
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('newPatient.stenosis')}</FormLabel>
                        <Select onValueChange={value => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('newPatient.grade')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {[0, 1, 2, 3, 4].map(grade => <SelectItem key={grade} value={String(grade)}>{grade}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name={`echoCGData.${valveName}Regurgitation`}
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('newPatient.regurgitation')}</FormLabel>
                        <Select onValueChange={value => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('newPatient.grade')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {[0, 1, 2, 3, 4].map(grade => <SelectItem key={grade} value={String(grade)}>{grade}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
          </CardContent>
        </Card>
      );
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('newPatient.title')}</h1>
      </div>
      <Tabs defaultValue="emergency">
        <TabsList>
          <TabsTrigger value="emergency">{t('newPatient.emergencyTab')}</TabsTrigger>
          <TabsTrigger value="scheduled" disabled>{t('newPatient.scheduledTab')}</TabsTrigger>
        </TabsList>
        <TabsContent value="emergency">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Accordion type="multiple" defaultValue={['coronary-angiography']} className="w-full">
                <AccordionItem value="coronary-angiography">
                  <AccordionTrigger>{t('newPatient.coronaryAngiography')}</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <Card>
                      <CardHeader><CardTitle className="text-lg">{t('newPatient.lca')}</CardTitle></CardHeader>
                      <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{renderArteryFields(lcaArteries)}</CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle className="text-lg">{t('newPatient.rca')}</CardTitle></CardHeader>
                      <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{renderArteryFields(rcaArteries)}</CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <FormField
                                control={form.control}
                                name="coronaryAngiography.ejectionFraction"
                                render={({ field }) => (
                                    <FormItem>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <FormLabel className="cursor-help">{t('newPatient.ef')}</FormLabel>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="whitespace-pre-line text-sm">{t('newPatient.efTooltip')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="echo-cg">
                    <AccordionTrigger>{t('newPatient.echoCG')}</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <FormField
                                    control={form.control}
                                    name="echoCGData.globalContractility"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('newPatient.globalContractility')}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('newPatient.selectStatus')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Impaired">{t('newPatient.impaired')}</SelectItem>
                                                    <SelectItem value="Not impaired">{t('newPatient.notImpaired')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                        {valves.map(renderValveFields)}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="blood-tests">
                    <AccordionTrigger>{t('newPatient.bloodTests')}</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">{t('newPatient.cbc')}</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {cbcFields.map(field => (
                                    <FormField key={field} control={form.control} name={`bloodTests.completeBloodCount.${field}`} render={({ field: formField }) => (<FormItem><FormLabel>{t(`newPatient.cbcFields.${field}`)}</FormLabel><FormControl><Input type="number" {...formField} onChange={e => formField.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-lg">{t('newPatient.wbcDifferential')}</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {wbcFields.map(field => (
                                    <FormField key={field} control={form.control} name={`bloodTests.wbcDifferential.${field}`} render={({ field: formField }) => (<FormItem><FormLabel>{t(`newPatient.wbcDifferentialFields.${field}`)}</FormLabel><FormControl><Input type="number" {...formField} onChange={e => formField.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-lg">{t('newPatient.additionalMarkers')}</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {additionalMarkerFields.map(field => (
                                    <FormField key={field} control={form.control} name={`bloodTests.additionalMarkers.${field}`} render={({ field: formField }) => (<FormItem><FormLabel>{t(`newPatient.additionalMarkerFields.${field}`)}</FormLabel><FormControl><Input type="number" {...formField} onChange={e => formField.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader><CardTitle className="text-lg">{t('newPatient.cardiomarkers')}</CardTitle></CardHeader>
                             <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {cardiomarkerFields.map(field => (
                                     <FormField key={field} control={form.control} name={`bloodTests.cardiomarkers.${field}`} render={({ field: formField }) => (<FormItem><FormLabel>{t(`newPatient.cardiomarkerFields.${field}`)}</FormLabel><FormControl><Input type="number" {...formField} onChange={e => formField.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
                                ))}
                             </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? t('newPatient.analyzing') : t('newPatient.analyze')}
              </Button>
            </form>
          </Form>

          {analysisResult && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-primary" />
                  {t('newPatient.aiResponse')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">{t('newPatient.diagnosis')}</h3>
                  <p>{analysisResult.diagnosis}</p>
                </div>
                <div>
                  <h3 className="font-semibold">{t('newPatient.surgicalIntervention')}</h3>
                  <p className={`font-bold ${analysisResult.surgicalInterventionNeeded ? 'text-destructive' : 'text-green-600'}`}>
                    {analysisResult.surgicalInterventionNeeded ? t('newPatient.yes') : t('newPatient.no')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">{t('newPatient.rationale')}</h3>
                  <p className="text-sm text-muted-foreground">{analysisResult.rationale}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
