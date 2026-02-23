from pydantic import BaseModel, Field
from typing import List, Optional

class RiskAssessment(BaseModel):
    risk_label: str = Field(..., pattern="^(Safe|Adjust Dosage|Toxic|Ineffective|Unknown)$")
    confidence_score: float
    severity: str = Field(..., pattern="^(none|low|moderate|high|critical)$")

class Variant(BaseModel):
    rsid: str
    chromosome: str
    position: str
    reference: str
    alternate: str

class PharmacogenomicProfile(BaseModel):
    primary_gene: str
    diplotype: str
    phenotype: str = Field(..., pattern="^(PM|IM|NM|RM|URM|Unknown)$")
    detected_variants: List[Variant]

class ClinicalRecommendation(BaseModel):
    cpic_guideline_reference: str
    dose_adjustment: str
    monitoring_advice: str

class LLMExplanation(BaseModel):
    summary: str
    biological_mechanism: str
    variant_citations: List[str]
    confidence_reasoning: str

class QualityMetrics(BaseModel):
    vcf_parsing_success: bool
    missing_annotations: bool
    confidence_level: str

class AnalysisResult(BaseModel):
    patient_id: str
    drug: str
    timestamp: str
    risk_assessment: RiskAssessment
    pharmacogenomic_profile: PharmacogenomicProfile
    clinical_recommendation: ClinicalRecommendation
    llm_generated_explanation: LLMExplanation
    quality_metrics: QualityMetrics
