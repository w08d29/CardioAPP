
'use server';
/**
 * @fileOverview An AI-driven diagnostic assistance flow for heart vessel conditions.
 *
 * - analyzePatientData - Analyzes patient data and provides a diagnosis and assessment of the necessity for surgical intervention.
 * - AnalyzePatientDataInput - The input type for the analyzePatientData function.
 * - AnalyzePatientDataOutput - The return type for the analyzePatientData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ArterySchema = z.object({
  LM: z.number().optional().describe('Left Main Trunk lesion percentage'),
  LADprox: z.number().optional().describe('Left Anterior Descending proximal segment lesion percentage'),
  LADmid: z.number().optional().describe('Left Anterior Descending mid segment lesion percentage'),
  LADdist: z.number().optional().describe('Left Anterior Descending distal segment lesion percentage'),
  D1: z.number().optional().describe('Diagonal branch 1 lesion percentage'),
  D2: z.number().optional().describe('Diagonal branch 2 lesion percentage'),
  LCxprox: z.number().optional().describe('Left Circumflex proximal segment lesion percentage'),
  LCxdist: z.number().optional().describe('Left Circumflex distal segment lesion percentage'),
  OM1: z.number().optional().describe('Obtuse Marginal branch 1 lesion percentage'),
  OM2: z.number().optional().describe('Obtuse Marginal branch 2 lesion percentage'),
  RCAprox: z.number().optional().describe('Right Coronary Artery proximal segment lesion percentage'),
  RCAmid: z.number().optional().describe('Right Coronary Artery mid segment lesion percentage'),
  RCAdist: z.number().optional().describe('Right Coronary Artery distal segment lesion percentage'),
  PDA: z.number().optional().describe('Posterior Descending Artery branch lesion percentage'),
  PL: z.number().optional().describe('Posterolateral branches lesion percentage'),
});

const CoronaryAngiographySchema = z.object({
  affectedArteries: ArterySchema.optional().describe('Details of affected arteries from coronary angiography.'),
  ejectionFraction: z.number().optional().describe('Ejection Fraction (EF, %)'),
});

const EchoCGDataSchema = z.object({
  globalContractility: z.enum(['Impaired', 'Not impaired']).optional().describe('Global contractility assessment.'),
  aorticStenosis: z.number().optional().describe('Aortic valve stenosis grade (0-4)'),
  aorticRegurgitation: z.number().optional().describe('Aortic valve regurgitation (insufficiency) grade (0-4)'),
  mitralStenosis: z.number().optional().describe('Mitral valve stenosis grade (0-4)'),
  mitralRegurgitation: z.number().optional().describe('Mitral valve regurgitation (insufficiency) grade (0-4)'),
  tricuspidStenosis: z.number().optional().describe('Tricuspid valve stenosis grade (0-4)'),
  tricuspidRegurgitation: z.number().optional().describe('Tricuspid valve regurgitation (insufficiency) grade (0-4)'),
  pulmonaryStenosis: z.number().optional().describe('Pulmonary valve stenosis grade (0-4)'),
  pulmonaryRegurgitation: z.number().optional().describe('Pulmonary valve regurgitation (insufficiency) grade (0-4)'),
});

const BloodCountSchema = z.object({
  hemoglobin: z.number().optional().describe('Hemoglobin (Hb) level (g/L)'),
  redBloodCells: z.number().optional().describe('Red blood cells (RBC) count (×10¹²/L)'),
  hematocrit: z.number().optional().describe('Hematocrit (Ht) percentage (%)'),
  colorIndex: z.number().optional().describe('Color index (MCH, MCHC)'),
  meanCorpuscularVolume: z.number().optional().describe('Mean corpuscular volume (MCV) (fL)'),
  platelets: z.number().optional().describe('Platelets (PLT) count (×10⁹/L)'),
  whiteBloodCells: z.number().optional().describe('White blood cells (WBC) count (×10⁹/L)'),
});

const WBCDifferentialSchema = z.object({
    bandNeutrophils: z.number().optional().describe('Band neutrophils (%)'),
    segmentedNeutrophils: z.number().optional().describe('Segmented neutrophils (%)'),
    eosinophils: z.number().optional().describe('Eosinophils (%)'),
    basophils: z.number().optional().describe('Basophils (%)'),
    lymphocytes: z.number().optional().describe('Lymphocytes (%)'),
    monocytes: z.number().optional().describe('Monocytes (%)'),
});

const AdditionalMarkersSchema = z.object({
    ESR: z.number().optional().describe('Erythrocyte sedimentation rate (ESR) (mm/h)'),
    reticulocytes: z.number().optional().describe('Reticulocytes (%)'),
});

const CardioMarkersSchema = z.object({
  troponinT: z.number().optional().describe('Troponin T (cTnT) level (ng/mL)'),
  creatineKinase: z.number().optional().describe('Creatine kinase (CK) level (U/L)'),
  ckMB: z.number().optional().describe('CK-MB level (U/L)'),
});

const BloodTestsSchema = z.object({
  completeBloodCount: BloodCountSchema.optional().describe('Complete blood count (CBC / OAK) parameters'),
  wbcDifferential: WBCDifferentialSchema.optional().describe('WBC differential parameters'),
  additionalMarkers: AdditionalMarkersSchema.optional().describe('Additional markers'),
  cardiomarkers: CardioMarkersSchema.optional().describe('Cardiomarker levels'),
});

const AnalyzePatientDataInputSchema = z.object({
  coronaryAngiography: CoronaryAngiographySchema.optional().describe('Coronary angiography data'),
  echoCGData: EchoCGDataSchema.optional().describe('Echo CG data'),
  bloodTests: BloodTestsSchema.optional().describe('Blood test results'),
  language: z.enum(['English', 'Russian']).default('English').describe('Preferred language for the analysis'),
});

export type AnalyzePatientDataInput = z.infer<typeof AnalyzePatientDataInputSchema>;

const AnalyzePatientDataOutputSchema = z.object({
  diagnosis: z.string().describe('The likely diagnosis based on the provided data.'),
  surgicalInterventionNeeded: z.boolean().describe('Whether surgical intervention is likely needed.'),
  rationale: z.string().describe('The rationale behind the diagnosis and intervention assessment.'),
});

export type AnalyzePatientDataOutput = z.infer<typeof AnalyzePatientDataOutputSchema>;

export async function analyzePatientData(input: AnalyzePatientDataInput): Promise<AnalyzePatientDataOutput> {
  return analyzePatientDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDrivenDiagnosticAssistancePrompt',
  input: {schema: AnalyzePatientDataInputSchema},
  output: {schema: AnalyzePatientDataOutputSchema},
  prompt: `You are an expert cardiologist providing diagnostic assistance based on patient data.

Analyze the following patient data to determine a likely diagnosis and assess the necessity for surgical intervention.
Provide a clear rationale for your assessment. Respond in {{{language}}}.

Coronary Angiography Data:
{{#if coronaryAngiography}}
  {{#if coronaryAngiography.affectedArteries}}
    Affected Arteries:
    {{#each (keys coronaryAngiography.affectedArteries)}}
      {{@key}}: {{lookup ../coronaryAngiography.affectedArteries @key}}%
    {{/each}}
  {{else}}
    No significant arterial lesions detected.
  {{/if}}
  Ejection Fraction (EF): {{coronaryAngiography.ejectionFraction}}%
{{else}}
  No coronary angiography data provided.
{{/if}}

Echo CG Data:
{{#if echoCGData}}
  Global Contractility: {{echoCGData.globalContractility}}
  Aortic Stenosis: {{echoCGData.aorticStenosis}}
  Aortic Failure (Insufficiency / Недостаточность): {{echoCGData.aorticRegurgitation}}
  Mitral Stenosis: {{echoCGData.mitralStenosis}}
  Mitral Failure (Insufficiency / Недостаточность): {{echoCGData.mitralRegurgitation}}
  Tricuspid Stenosis: {{echoCGData.tricuspidStenosis}}
  Tricuspid Failure (Insufficiency / Недостаточность): {{echoCGData.tricuspidRegurgitation}}
  Pulmonary Stenosis: {{echoCGData.pulmonaryStenosis}}
  Pulmonary Failure (Insufficiency / Недостаточность): {{echoCGData.pulmonaryRegurgitation}}
{{else}}
  No Echo CG data provided.
{{/if}}

Blood Test Results:
{{#if bloodTests}}
  Complete Blood Count:
  {{#if bloodTests.completeBloodCount}}
    Hemoglobin: {{bloodTests.completeBloodCount.hemoglobin}} g/L
    Red Blood Cells: {{bloodTests.completeBloodCount.redBloodCells}} ×10¹²/L
    Hematocrit: {{bloodTests.completeBloodCount.hematocrit}}%
    Color Index: {{bloodTests.completeBloodCount.colorIndex}}
    Mean Corpuscular Volume: {{bloodTests.completeBloodCount.meanCorpuscularVolume}} fL
    Platelets: {{bloodTests.completeBloodCount.platelets}} ×10⁹/L
    White Blood Cells: {{bloodTests.completeBloodCount.whiteBloodCells}} ×10⁹/L
  {{else}}
    No complete blood count data provided.
  {{/if}}
  WBC Differential:
  {{#if bloodTests.wbcDifferential}}
    Band Neutrophils: {{bloodTests.wbcDifferential.bandNeutrophils}}%
    Segmented Neutrophils: {{bloodTests.wbcDifferential.segmentedNeutrophils}}%
    Eosinophils: {{bloodTests.wbcDifferential.eosinophils}}%
    Basophils: {{bloodTests.wbcDifferential.basophils}}%
    Lymphocytes: {{bloodTests.wbcDifferential.lymphocytes}}%
    Monocytes: {{bloodTests.wbcDifferential.monocytes}}%
  {{else}}
    No WBC differential data provided.
  {{/if}}
  Additional Markers:
  {{#if bloodTests.additionalMarkers}}
    ESR: {{bloodTests.additionalMarkers.ESR}} mm/h
    Reticulocytes: {{bloodTests.additionalMarkers.reticulocytes}}%
  {{else}}
    No additional marker data provided.
  {{/if}}
  Cardiomarkers:
  {{#if bloodTests.cardiomarkers}}
    Troponin T: {{bloodTests.cardiomarkers.troponinT}} ng/mL
    Creatine Kinase: {{bloodTests.cardiomarkers.creatineKinase}} U/L
    CK-MB: {{bloodTests.cardiomarkers.ckMB}} U/L
  {{else}}
    No cardiomarker data provided.
  {{/if}}
{{else}}
  No blood test data provided.
{{/if}}

Based on this information, provide a diagnosis, whether surgical intervention is needed, and a rationale.
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
