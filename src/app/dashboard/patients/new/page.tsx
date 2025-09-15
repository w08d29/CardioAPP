
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
  CardDescription,
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

const arterySchema = z.object({
  LM: z.coerce.number().optional(),
  LADprox: z.coerce.number().optional(),
  LADmid: z.coerce.number().optional(),
  LADdist: z.coerce.number().optional(),
  D1: z.coerce.number().optional(),
  D2: z.coerce.number().optional(),
  LCxprox: z.coerce.number().optional(),
  LCxdist: z.coerce.number().optional(),
  OM1: z.coerce.number().optional(),
  OM2: z.coerce.number().optional(),
  RCAprox: z.coerce.number().optional(),
  RCAmid: z.coerce.number().optional(),
  RCAdist: z.coerce.number().optional(),
  PDA: z.coerce.number().optional(),
  PL: z.coerce.number().optional(),
});

const formSchema = z.object({
  coronaryAngiography: z.object({
    affectedArteries: arterySchema.optional(),
    ejectionFraction: z.coerce.number().optional(),
  }).optional(),
  echoCGData: z.object({
    globalContractility: z.enum(['Impaired', 'Not impaired']).optional(),
    aorticStenosis: z.coerce.number().optional(),
    aorticRegurgitation: z.coerce.number().optional(),
    mitralStenosis: z.coerce.number().optional(),
    mitralRegurgitation: z.coerce.number().optional(),
    tricuspidStenosis: z.coerce.number().optional(),
    tricuspidRegurgitation: z.coerce.number().optional(),
    pulmonaryStenosis: z.coerce.number().optional(),
    pulmonaryRegurgitation: z.coerce.number().optional(),
  }).optional(),
  bloodTests: z.object({
    completeBloodCount: z.object({
      hemoglobin: z.coerce.number().optional(),
      redBloodCells: z.coerce.number().optional(),
      hematocrit: z.coerce.number().optional(),
      platelets: z.coerce.number().optional(),
      whiteBloodCells: z.coerce.number().optional(),
      ESR: z.coerce.number().optional(),
    }).optional(),
    cardiomarkers: z.object({
      troponinT: z.coerce.number().optional(),
      creatineKinase: z.coerce.number().optional(),
      ckMB: z.coerce.number().optional(),
    }).optional(),
  }).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NewPatientPage() {
  const { t, language } = useLocalization();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<AnalyzePatientDataOutput | null>(null);

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
        title: 'Error',
        description: 'Failed to analyze patient data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const renderArteryFields = (arteryType: 'LCA' | 'RCA' | 'LCx') => {
    const fields = {
        LCA: ['LM', 'LADprox', 'LADmid', 'LADdist', 'D1', 'D2'],
        LCx: ['LCxprox', 'LCxdist', 'OM1', 'OM2'],
        RCA: ['RCAprox', 'RCAmid', 'RCAdist', 'PDA', 'PL'],
    };
    const fieldNames = fields[arteryType];

    return fieldNames.map((fieldName) => (
      <FormField
        key={fieldName}
        control={form.control}
        name={`coronaryAngiography.affectedArteries.${fieldName as keyof z.infer<typeof arterySchema>}`}
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0">
            <FormLabel className="w-20 min-w-[5rem] text-sm">{fieldName}</FormLabel>
            <FormControl>
              <Input type="number" placeholder={t('newPatient.lesion')} {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ));
  };
  
  const renderValveFields = (valveName: 'aortic' | 'mitral' | 'tricuspid' | 'pulmonary') => {
      const capitalizedValveName = valveName.charAt(0).toUpperCase() + valveName.slice(1);
      return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                  control={form.control}
                  name={`echoCGData.${valveName}Stenosis`}
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>{t(`newPatient.${valveName}`)} {t('newPatient.stenosis')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
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
                      <FormLabel>{t(`newPatient.${valveName}`)} {t('newPatient.regurgitation')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
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
          </div>
      );
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('newPatient.title')}
        </h1>
      </div>
      <Tabs defaultValue="emergency">
        <TabsList>
          <TabsTrigger value="emergency">{t('newPatient.emergencyTab')}</TabsTrigger>
          <TabsTrigger value="scheduled" disabled>{t('newPatient.scheduledTab')}</TabsTrigger>
        </TabsList>
        <TabsContent value="emergency">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>{t('newPatient.coronaryAngiography')}</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <Card>
                      <CardHeader><CardTitle className="text-lg">{t('newPatient.lca')}</CardTitle></CardHeader>
                      <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{renderArteryFields('LCA')}</CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="text-lg">LCx</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{renderArteryFields('LCx')}</CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle className="text-lg">{t('newPatient.rca')}</CardTitle></CardHeader>
                      <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{renderArteryFields('RCA')}</CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                         <FormField
                            control={form.control}
                            name="coronaryAngiography.ejectionFraction"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t('newPatient.ef')}</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
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
                                                <SelectValue placeholder="Select..." />
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
                                {renderValveFields('aortic')}
                                {renderValveFields('mitral')}
                                {renderValveFields('tricuspid')}
                                {renderValveFields('pulmonary')}
                            </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                    <AccordionTrigger>{t('newPatient.bloodTests')}</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">{t('newPatient.cbc')}</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="bloodTests.completeBloodCount.hemoglobin" render={({ field }) => (<FormItem><FormLabel>Hemoglobin</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/></FormControl></FormItem>)} />
                                <FormField control={form.control} name="bloodTests.completeBloodCount.redBloodCells" render={({ field }) => (<FormItem><FormLabel>Red Blood Cells</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/></FormControl></FormItem>)} />
                                <FormField control={form.control} name="bloodTests.completeBloodCount.hematocrit" render={({ field }) => (<FormItem><FormLabel>Hematocrit</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/></FormControl></FormItem>)} />
                                <FormField control={form.control} name="bloodTests.completeBloodCount.platelets" render={({ field }) => (<FormItem><FormLabel>Platelets</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/></FormControl></FormItem>)} />
                                <FormField control={form.control} name="bloodTests.completeBloodCount.whiteBloodCells" render={({ field }) => (<FormItem><FormLabel>White Blood Cells</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/></FormControl></FormItem>)} />
                                <FormField control={form.control} name="bloodTests.completeBloodCount.ESR" render={({ field }) => (<FormItem><FormLabel>ESR</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/></FormControl></FormItem>)} />
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader><CardTitle className="text-lg">{t('newPatient.cardiomarkers')}</CardTitle></CardHeader>
                             <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="bloodTests.cardiomarkers.troponinT" render={({ field }) => (<FormItem><FormLabel>Troponin T</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/></FormControl></FormItem>)} />
                                <FormField control={form.control} name="bloodTests.cardiomarkers.creatineKinase" render={({ field }) => (<FormItem><FormLabel>Creatine Kinase</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/></FormControl></FormItem>)} />
                                <FormField control={form.control} name="bloodTests.cardiomarkers.ckMB" render={({ field }) => (<FormItem><FormLabel>CK-MB</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)}/></FormControl></FormItem>)} />
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

    