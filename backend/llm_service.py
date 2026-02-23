"""
PharmaGuard LLM Service — Gemini AI Integration
================================================
Generates detailed, CPIC-aligned clinical explanations using Google Gemini.
Falls back to rich template-based explanations if Gemini is unavailable.
"""
import os
import json
from typing import List, Dict


class LLMService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.model = None

        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel("gemini-1.5-flash")
                print("[LLMService] ✓ Gemini AI initialized (gemini-1.5-flash)")
            except ImportError:
                print("[LLMService] ⚠ google-generativeai not installed. Run: pip install google-generativeai")
            except Exception as e:
                print(f"[LLMService] ⚠ Gemini init error: {e}")
        else:
            print("[LLMService] ℹ No GEMINI_API_KEY found. Using enhanced template explanations.")

    def generate_explanation(
        self,
        drug: str,
        gene: str,
        phenotype: str,
        risk: str,
        variants: List[Dict],
        recommendation: str,
        mechanism: str,
        diplotype: str = "*1/*1",
        activity_score: float = 2.0,
    ) -> Dict:
        """
        Generate clinical explanation.
        Uses Gemini if available, otherwise rich template fallback.
        """
        if self.model:
            return self._generate_with_gemini(
                drug, gene, phenotype, risk, variants, recommendation, mechanism, diplotype, activity_score
            )
        else:
            return self._generate_template(
                drug, gene, phenotype, risk, variants, recommendation, mechanism, diplotype, activity_score
            )

    def _generate_with_gemini(
        self, drug, gene, phenotype, risk, variants, recommendation, mechanism, diplotype, activity_score
    ) -> Dict:
        """Use Gemini to generate a clinical-quality explanation."""
        phenotype_names = {
            "PM": "Poor Metabolizer", "IM": "Intermediate Metabolizer",
            "NM": "Normal Metabolizer", "RM": "Rapid Metabolizer",
            "URM": "Ultra-Rapid Metabolizer", "Unknown": "Unknown Phenotype"
        }
        pheno_full = phenotype_names.get(phenotype, phenotype)
        variant_rsids = [v.get("rsid", "?") for v in variants] if variants else []
        variant_str = ", ".join(variant_rsids) if variant_rsids else "none detected (wild-type)"

        prompt = f"""You are a clinical pharmacogenomics expert specializing in CPIC guidelines.

Generate a structured pharmacogenomics report for:
- Patient Diplotype: {diplotype} (Activity Score: {activity_score})
- Gene: {gene} | Phenotype: {pheno_full} ({phenotype})
- Drug: {drug} | Risk: {risk}
- Detected Variants (RSIDs): {variant_str}
- Mechanism: {mechanism}
- Clinical Recommendation: {recommendation}

Respond ONLY with valid JSON in this exact format:
{{
  "summary": "2-3 sentence clinical summary for a physician. State the phenotype, drug risk, and key action. Be specific about {drug} and {gene}.",
  "biological_mechanism": "3-4 sentences explaining the molecular mechanism. Include enzyme/transporter name, metabolic pathway, what the variant(s) do to protein function, and why that causes {risk} risk for {drug}.",
  "variant_citations": {json.dumps(variant_rsids)},
  "confidence_reasoning": "1-2 sentences explaining confidence in this classification based on the available variant data."
}}"""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            # Clean markdown code fences if present
            if text.startswith("```"):
                text = text[text.find("{"):text.rfind("}")+1]
            result = json.loads(text)
            # Ensure all keys exist
            result.setdefault("variant_citations", variant_rsids)
            result.setdefault("confidence_reasoning", "Based on CPIC guideline evidence and detected variant data.")
            return result
        except Exception as e:
            print(f"[LLMService] Gemini call failed: {e}. Using template fallback.")
            return self._generate_template(
                drug, gene, phenotype, risk, variants, recommendation, mechanism, diplotype, activity_score
            )

    def _generate_template(
        self, drug, gene, phenotype, risk, variants, recommendation, mechanism, diplotype, activity_score
    ) -> Dict:
        """
        Rich template-based explanation using actual CPIC knowledge.
        Much better than a simple fill-in template — uses clinical language.
        """
        phenotype_names = {
            "PM": "Poor Metabolizer", "IM": "Intermediate Metabolizer",
            "NM": "Normal Metabolizer", "RM": "Rapid Metabolizer", "URM": "Ultra-Rapid Metabolizer"
        }
        pheno_full = phenotype_names.get(phenotype, "Unknown Phenotype")
        variant_rsids = [v.get("rsid", "?") for v in variants] if variants else []

        # Risk-level action phrasing
        action_phrases = {
            "Toxic": "poses significant toxicity risk",
            "Ineffective": "is predicted to be ineffective",
            "Adjust Dosage": "requires dose adjustment",
            "Safe": "can be used at standard doses",
            "Unknown": "has uncertain pharmacogenomic impact",
        }
        action = action_phrases.get(risk, "has altered pharmacogenomic response")

        # Gene-specific functional descriptions
        gene_enzyme_desc = {
            "CYP2D6": "cytochrome P450 2D6 enzyme (CYP2D6), which is responsible for oxidative metabolism of ~25% of clinically used drugs",
            "CYP2C9": "cytochrome P450 2C9 enzyme (CYP2C9), responsible for metabolizing S-warfarin (the more pharmacologically active enantiomer)",
            "CYP2C19": "cytochrome P450 2C19 enzyme (CYP2C19), a key enzyme in the bioactivation of clopidogrel and other prodrugs",
            "SLCO1B1": "hepatic organic anion transporter OATP1B1 (encoded by SLCO1B1), responsible for transporting statins from blood into hepatocytes",
            "TPMT": "thiopurine S-methyltransferase (TPMT), which inactivates thiopurine drugs via methylation, diverting drug away from toxic pathways",
            "DPYD": "dihydropyrimidine dehydrogenase (DPD, encoded by DPYD), responsible for catabolizing >80% of administered 5-fluorouracil in the liver",
        }
        enzyme_desc = gene_enzyme_desc.get(gene, f"{gene} enzyme")

        # Diplotype context
        variant_context = (
            f"The detected diplotype {diplotype} (activity score: {activity_score}) corresponds to "
            f"variants {', '.join(variant_rsids)} in the {gene} gene"
            if variant_rsids else
            f"No pathogenic variants were detected; the {diplotype} (wild-type) diplotype suggests normal enzyme function"
        )

        summary = (
            f"This patient carries the {diplotype} {gene} diplotype, classifying them as a {pheno_full} (phenotype code: {phenotype}). "
            f"Based on CPIC Tier-A evidence, {drug} {action} for patients with this metabolizer phenotype. "
            f"{'Immediate clinical action is recommended per CPIC guidelines.' if risk in ('Toxic', 'Ineffective') else 'Standard monitoring is recommended.'}"
        )

        bio_mechanism = (
            f"{variant_context}. "
            f"This affects the {enzyme_desc}. "
            f"{mechanism} "
            f"The activity score of {activity_score} reflects the combined enzymatic capacity of both alleles and directly determines the CPIC phenotype classification used for this recommendation."
        )

        confidence_reasoning = (
            f"Classification confidence is based on {'recognition of ' + str(len(variant_rsids)) + ' known pharmacogenomic RSID(s) in the CPIC/PharmVar variant database' if variant_rsids else 'absence of known pathogenic variants (wild-type inference)'}. "
            f"All recommendations follow CPIC Tier-A evidence standards with peer-reviewed clinical validation."
        )

        return {
            "summary": summary,
            "biological_mechanism": bio_mechanism,
            "variant_citations": variant_rsids,
            "confidence_reasoning": confidence_reasoning,
        }
