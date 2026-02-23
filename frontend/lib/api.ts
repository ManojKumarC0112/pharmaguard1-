const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export interface AnalysisResult {
    patient_id: string;
    drug: string;
    timestamp: string;
    risk_assessment: {
        risk_label: string;
        confidence_score: number;
        severity: string;
    };
    pharmacogenomic_profile: {
        primary_gene: string;
        diplotype: string;
        phenotype: string;
        detected_variants: Array<{
            rsid: string;
            chromosome: string;
            position: string;
            reference: string;
            alternate: string;
        }>;
    };
    clinical_recommendation: {
        cpic_guideline_reference: string;
        dose_adjustment: string;
        monitoring_advice: string;
    };
    llm_generated_explanation: {
        summary: string;
        biological_mechanism: string;
        variant_citations: string[];
        confidence_reasoning: string;
    };
    quality_metrics: {
        vcf_parsing_success: boolean;
        missing_annotations: boolean;
        confidence_level: string;
    };
}

export async function analyzeVCF(file: File, drug: string, patientId?: string): Promise<AnalysisResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("drug", drug);
    formData.append("patient_id", patientId || "PATIENT_" + Math.random().toString(36).substr(2, 9).toUpperCase());

    const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Analysis failed");
    }

    return response.json();
}
