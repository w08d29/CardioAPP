'use server';

/**
 * @fileOverview A data analysis AI agent for patient data.
 *
 * - analyzePatientData - A function that handles the patient data analysis process.
 * - AnalyzePatientDataInput - The input type for the analyzePatientData function.
 * - AnalyzePatientDataOutput - The return type for the analyzePatientData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CoronaryAngiographySchema = z.object({
  LCA: z.object({
    LM: z.number().optional().describe('Left main trunk lesion percentage'),
    LADprox: z.number().optional().describe('Left anterior descending proximal segment lesion percentage'),
    LADmid: z.number().optional().describe('Left anterior descending mid segment lesion percentage'),
    LADdist: z.number().optional().describe('Left anterior descending distal segment lesion percentage'),
    D1: z.number().optional().describe('Diagonal branch 1 lesion percentage'),
    D2: z.number().optional().describe('Diagonal branch 2 lesion percentage'),
  }).optional().describe('Left coronary artery data'),
  LCx: z.object({
    LCxprox: z.number().optional().describe('Left circumflex proximal segment lesion percentage'),
    LCxdist: z.number().optional().describe('Left circumflex distal segment lesion percentage'),
    OM1: z.number().optional().describe('Obtuse marginal branch 1 lesion percentage'),
    OM2: z.number().optional().describe('Obtuse marginal branch 2 lesion percentage'),
  }).optional().describe('Left circumflex data'),
  RCA: z.object({
    RCAprox: z.number().optional().describe('Right coronary proximal segment lesion percentage'),
    RCAmid: z.number().optional().describe('Right coronary mid segment lesion percentage'),
    RCAdist: z.number().optional().describe('Right coronary distal segment lesion percentage'),
    PDA: z.number().optional().describe('Posterior descending artery branch lesion percentage'),
    PL: z.number().optional().describe('Posterolateral branches lesion percentage'),
  }).optional().describe('Right coronary artery data'),
  EF: z.number().describe('Ejection Fraction percentage'),
});

const EchoCGDataSchema = z.object({
  globalContractility: z.enum(['Impaired', 'Not impaired']).describe('Global contractility status'),
  valves: z.object({
    aortic: z.object({
      stenosis: z.number().min(0).max(4).optional().describe('Aortic valve stenosis grade (0-4)'),
      regurgitation: z.number().min(0).max(4).optional().describe('Aortic valve regurgitation grade (0-4)'),
    }).optional().describe('Aortic valve data'),
    mitral: z.object({
      stenosis: z.number().min(0).max(4).optional().describe('Mitral valve stenosis grade (0-4)'),
      regurgitation: z.number().min(0).max(4).optional().describe('Mitral valve regurgitation grade (0-4)'),
    }).optional().describe('Mitral valve data'),
    tricuspid: z.object({
      stenosis: z.number().min(0).max(4).optional().describe('Tricuspid valve stenosis grade (0-4)'),
      regurgitation: z.number().min(0).max(4).optional().describe('Tricuspid valve regurgitation grade (0-4)'),
    }).optional().describe('Tricuspid valve data'),
    pulmonary: z.object({
      stenosis: z.number().min(0).max(4).optional().describe('Pulmonary valve stenosis grade (0-4)'),
      regurgitation: z.number().min(0).max(4).optional().describe('Pulmonary valve regurgitation grade (0-4)'),
    }).optional().describe('Pulmonary valve data'),
  }).optional().describe('Valve data'),
});

const BloodTestsSchema = z.object({
  CBC: z.object({
    Hb: z.number().optional().describe('Hemoglobin level (g/L)'),
    RBC: z.number().optional().describe('Red blood cell count (x10^12/L)'),
    Ht: z.number().optional().describe('Hematocrit (%)'),
    MCH: z.number().optional().describe('Mean corpuscular hemoglobin (pg)'),
    MCHC: z.number().optional().describe('Mean corpuscular hemoglobin concentration (g/L)'),
    MCV: z.number().optional().describe('Mean corpuscular volume (fL)'),
    PLT: z.number().optional().describe('Platelet count (x10^9/L)'),
    WBC: z.number().optional().describe('White blood cell count (x10^9/L)'),
  }).optional().describe('Complete blood count data'),
  WBCDifferential: z.object({
    bandNeutrophils: z.number().optional().describe('Band neutrophils (%)'),
    segmentedNeutrophils: z.number().optional().describe('Segmented neutrophils (%)'),
    eosinophils: z.number().optional().describe('Eosinophils (%)'),
    basophils: z.number().optional().describe('Basophils (%)'),
    lymphocytes: z.number().optional().describe('Lymphocytes (%)'),
    monocytes: z.number().optional().describe('Monocytes (%)'),
  }).optional().describe('WBC differential data'),
  additionalMarkers: z.object({
    ESR: z.number().optional().describe('Erythrocyte sedimentation rate (mm/h)'),
    reticulocytes: z.number().optional().describe('Reticulocyte count (%)'),
  }).optional().describe('Additional markers data'),
  cardioMarkers: z.object({
    troponinT: z.number().optional().describe('Troponin T level (ng/mL)'),
    creatineKinase: z.number().optional().describe('Creatine kinase level (U/L)'),
    CKMB: z.number().optional().describe('CK-MB level (U/L)'),
  }).optional().describe('Cardio markers data'),
});

const AnalyzePatientDataInputSchema = z.object({
  coronaryAngiography: CoronaryAngiographySchema.optional().describe('Coronary angiography data'),
  echoCGData: EchoCGDataSchema.optional().describe('Echo CG data'),
  bloodTests: BloodTestsSchema.optional().describe('Blood tests data'),
  language: z.enum(['en', 'ru']).default('en').describe('Language for the analysis'),
});

export type AnalyzePatientDataInput = z.infer<typeof AnalyzePatientDataInputSchema>;

const AnalyzePatientDataOutputSchema = z.object({
  diagnosis: z.string().describe('The likely diagnosis based on the provided data.'),
  surgicalInterventionRequired: z.boolean().describe('Whether surgical intervention is likely required.'),
  rationale: z.string().describe('The rationale behind the diagnosis and surgical intervention recommendation.'),
});

export type AnalyzePatientDataOutput = z.infer<typeof AnalyzePatientDataOutputSchema>;

export async function analyzePatientData(input: AnalyzePatientDataInput): Promise<AnalyzePatientDataOutput> {
  return analyzePatientDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePatientDataPrompt',
  input: {schema: AnalyzePatientDataInputSchema},
  output: {schema: AnalyzePatientDataOutputSchema},
  prompt: `You are an experienced cardiologist providing diagnostic assistance based on patient data.

You will receive data from coronary angiography, EchoCG, and blood tests. Your task is to analyze this data and provide a likely diagnosis, as well as an assessment of whether surgical intervention is required.
Provide a rationale for your diagnosis and recommendation.

Respond in the language specified in the input.

Coronary Angiography Data: {{{coronaryAngiography}}}
EchoCG Data: {{{echoCGData}}}
Blood Tests Data: {{{bloodTests}}}

Consider all available data points when making your assessment.

Output the diagnosis, surgicalInterventionRequired, and rationale fields.
`,
});

const analyzePatientDataFlow = ai.defineFlow(
  {
    name: 'analyzePatientDataFlow',
    inputSchema: AnalyzePatientDataInputSchema,
    outputSchema: AnalyzePatientDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
