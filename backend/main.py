from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from schemas import AnalysisResult, RiskAssessment, PharmacogenomicProfile
from schemas import ClinicalRecommendation, LLMExplanation, QualityMetrics, Variant
from vcf_parser import VCFParser
from risk_engine import RiskEngine
from llm_service import LLMService
from knowledge_base import DRUG_GENE_MAP, CPIC_GUIDELINES

app = FastAPI(
    title="PharmaGuard API",
    version="2.0",
    description="CPIC-aligned pharmacogenomic risk prediction API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

risk_engine = RiskEngine()
llm_service = LLMService()


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_genomics(
    file: UploadFile = File(...),
    drug: str = Form(...),
    patient_id: str = Form("PATIENT_001")
):
    # 1. Validate file
    if not file.filename.lower().endswith('.vcf'):
        raise HTTPException(status_code=400, detail="Invalid file format. Only .vcf files are accepted.")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")

    drug_upper = drug.upper()

    # 2. Validate drug
    target_gene = DRUG_GENE_MAP.get(drug_upper)
    if not target_gene:
        raise HTTPException(
            status_code=400,
            detail=f"Drug '{drug}' is not supported. Supported drugs: {list(DRUG_GENE_MAP.keys())}"
        )

    # 3. Parse VCF
    parser = VCFParser(content)
    vcf_valid = parser.validate()
    all_variants = parser.parse()

    # 4. Risk Prediction (engine handles gene filtering internally)
    prediction = risk_engine.predict_risk(drug_upper, all_variants)

    # 5. Get gene-specific variants from prediction result
    gene_variants = prediction.get("gene_variants", [])

    # 6. Build diplotype string from alleles
    allele1 = prediction.get("allele1", "*1")
    allele2 = prediction.get("allele2", "*1")
    diplotype = f"{allele1}/{allele2}"
    activity_score = prediction.get("activity_score", 2.0)

    # 7. Build monitoring advice from CPIC guideline severity
    severity = prediction.get("severity", "none")
    monitoring_map = {
        "critical": "Immediate clinical review required. Do NOT administer without pharmacogenomics consultation.",
        "high": "Frequent monitoring required. Adjust dose before initiating therapy.",
        "moderate": "Monitor for drug response and adverse effects at each clinical visit.",
        "low": "Routine monitoring per standard of care.",
        "none": "Standard label monitoring. No additional pharmacogenomics-specific monitoring required.",
    }
    monitoring_advice = monitoring_map.get(severity, "Monitor per standard clinical protocol.")

    # 8. LLM Clinical Explanation
    explanation = llm_service.generate_explanation(
        drug=drug_upper,
        gene=target_gene,
        phenotype=prediction['phenotype'],
        risk=prediction['risk'],
        variants=gene_variants,
        recommendation=prediction['recommendation'],
        mechanism=prediction['mechanism'],
        diplotype=diplotype,
        activity_score=activity_score,
    )

    # 9. Confidence level text
    confidence = prediction.get("confidence", 0.85)
    confidence_text = (
        "High" if confidence >= 0.88
        else "Moderate" if confidence >= 0.65
        else "Low"
    )

    # 10. Build and return result
    return AnalysisResult(
        patient_id=patient_id,
        drug=drug_upper,
        timestamp=datetime.now(timezone.utc).isoformat(),
        risk_assessment=RiskAssessment(
            risk_label=prediction['risk'],
            confidence_score=confidence,
            severity=severity,
        ),
        pharmacogenomic_profile=PharmacogenomicProfile(
            primary_gene=target_gene,
            diplotype=diplotype,
            phenotype=prediction['phenotype'],
            detected_variants=[
                Variant(
                    rsid=v['rsid'],
                    chromosome=v['chromosome'],
                    position=str(v['position']),
                    reference=v['reference'],
                    alternate=v['alternate'],
                ) for v in gene_variants
            ]
        ),
        clinical_recommendation=ClinicalRecommendation(
            cpic_guideline_reference=f"CPIC Guideline for {drug.title()} and {target_gene} (Tier A)",
            dose_adjustment=prediction['recommendation'],
            monitoring_advice=monitoring_advice,
        ),
        llm_generated_explanation=LLMExplanation(**explanation),
        quality_metrics=QualityMetrics(
            vcf_parsing_success=vcf_valid,
            missing_annotations=len(gene_variants) == 0,
            confidence_level=confidence_text,
        )
    )


@app.get("/")
def read_root():
    return {
        "status": "PharmaGuard Backend Operational",
        "version": "2.0",
        "supported_drugs": list(DRUG_GENE_MAP.keys()),
        "supported_genes": list(set(DRUG_GENE_MAP.values())),
    }


@app.get("/drugs")
def get_drugs():
    """Return list of supported drug-gene pairs."""
    from knowledge_base import DRUG_INFO
    result = []
    for drug, gene in DRUG_GENE_MAP.items():
        info = DRUG_INFO.get(drug, {})
        result.append({
            "drug": drug,
            "gene": gene,
            "class": info.get("class", ""),
            "mechanism_short": info.get("mechanism_short", ""),
            "cpic_tier": info.get("cpic_tier", "A"),
            "cpic_url": info.get("cpic_url", "https://cpicpgx.org"),
            "common_uses": info.get("common_uses", ""),
        })
    return {"drugs": result}


@app.get("/genes")
def get_genes():
    """Return pharmacogene information."""
    genes = {
        "CYP2D6":  {"variants_catalogued": 150, "population_frequency_pm": "5-10%", "cpic_drugs": 30},
        "CYP2C9":  {"variants_catalogued": 60,  "population_frequency_pm": "3-5%",  "cpic_drugs": 15},
        "CYP2C19": {"variants_catalogued": 35,  "population_frequency_pm": "2-15%", "cpic_drugs": 12},
        "SLCO1B1": {"variants_catalogued": 28,  "population_frequency_pm": "5-15%", "cpic_drugs": 4},
        "TPMT":    {"variants_catalogued": 40,  "population_frequency_pm": "0.3%",  "cpic_drugs": 3},
        "DPYD":    {"variants_catalogued": 18,  "population_frequency_pm": "0.5-3%","cpic_drugs": 3},
    }
    return {"genes": genes}


@app.get("/stats")
def get_stats():
    """Usage statistics endpoint."""
    return {
        "total_analyses_supported": "Unlimited",
        "drug_gene_pairs": len(DRUG_GENE_MAP),
        "known_variants": 24,
        "cpic_tier": "A",
        "accuracy_mode": "RSID-based star-allele + activity-score phenotyping",
        "guidelines_version": "CPIC v2024",
    }
