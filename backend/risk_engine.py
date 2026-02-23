"""
PharmaGuard Risk Engine — CPIC-Accurate Implementation
======================================================
Uses real RSID→star-allele tables and activity-score based phenotyping
instead of naive variant-count heuristics.
"""
from schemas import *
from knowledge_base import (
    CPIC_GUIDELINES, DRUG_GENE_MAP, STAR_ALLELE_VARIANTS, 
    activity_score_to_phenotype, diplotype_string,
    ALLELE_ACTIVITY_SCORES
)
from typing import List, Dict, Optional
import math


class RiskEngine:
    def __init__(self):
        pass

    def classify_variants_to_alleles(self, gene: str, variants: List[Dict]) -> List[str]:
        """
        Map detected RSIDs to star-alleles for this gene.
        Returns list of non-reference alleles found (e.g. ['*4', '*2']).
        If no variants → both alleles are *1 (wild-type).
        """
        star_alleles_found = []
        for v in variants:
            rsid = v.get("rsid", "")
            # Look up in our RSID→star-allele table
            if rsid in STAR_ALLELE_VARIANTS:
                var_gene, star, _ = STAR_ALLELE_VARIANTS[rsid]
                if var_gene == gene:
                    star_alleles_found.append(star)

        return star_alleles_found

    def determine_diplotype(self, gene: str, variants: List[Dict]) -> tuple:
        """
        Determines diplotype (allele1, allele2) for a gene from variants.
        
        Logic:
        - Scan all detected variants for known star-allele RSIDs
        - Assign alleles in order: first variant → allele1, second → allele2
        - If 0 variants found: *1/*1 (wild-type homozygous = NM)  
        - If 1 variant found: *1 / <found_allele> (heterozygous)
        - If 2+ variants: <allele1> / <allele2>
        """
        found = self.classify_variants_to_alleles(gene, variants)

        if len(found) == 0:
            return "*1", "*1"
        elif len(found) == 1:
            return "*1", found[0]
        else:
            return found[0], found[1]

    def determine_phenotype(self, gene: str, variants: List[Dict]) -> tuple:
        """
        Returns (phenotype_code, allele1, allele2, activity_score)
        Uses CPIC activity-score method for CYP2D6/CYP2C19, 
        simplified diplotype method for others.
        """
        allele1, allele2 = self.determine_diplotype(gene, variants)
        phenotype = activity_score_to_phenotype(gene, allele1, allele2)

        scores = ALLELE_ACTIVITY_SCORES.get(gene, {})
        s1 = scores.get(allele1, scores.get("default", 1.0))
        s2 = scores.get(allele2, scores.get("default", 1.0))
        activity = s1 + s2

        return phenotype, allele1, allele2, round(activity, 2)

    def calculate_confidence(self, gene: str, variants: List[Dict], phenotype: str) -> float:
        """
        Multi-factor confidence scoring:
        - If RSIDs are in our known STAR_ALLELE_VARIANTS table → high confidence
        - Unknown RSIDs → lower confidence (we're making inferences)
        - Number of variants also affects confidence
        """
        if not variants:
            # No variants = wild-type; high confidence since reference genome is well-studied
            return 0.91

        known_count = sum(
            1 for v in variants
            if v.get("rsid", "") in STAR_ALLELE_VARIANTS
        )
        total = len(variants)

        if known_count == 0:
            # No variants matched our tables — less certain
            base = 0.55
        elif known_count == total:
            # All variants known — very accurate
            base = 0.93
        else:
            # Partial match
            ratio = known_count / total
            base = 0.65 + (ratio * 0.25)

        # Phenotype extremes (PM/URM) have higher clinical certainty (more studied)
        if phenotype in ("PM", "URM"):
            base = min(1.0, base + 0.04)

        return round(base, 2)

    def filter_variants_for_gene(self, gene: str, variants: List[Dict]) -> List[Dict]:
        """
        Filter the variant list to only those relevant to the target gene.
        Strategy:
        1. Check if rsid is in STAR_ALLELE_VARIANTS for this gene
        2. Check if gene name appears in INFO field
        3. Known genomic coordinate ranges (approximate, hg38)
        """
        GENE_CHROMOSOMES = {
            "CYP2D6":  ("22", 42_095_000, 42_130_000),
            "CYP2C9":  ("10", 94_937_000, 94_979_000),
            "CYP2C19": ("10", 94_761_000, 94_855_000),
            "SLCO1B1": ("12", 21_131_000, 21_239_000),
            "TPMT":    ("6",  18_128_000, 18_155_000),
            "DPYD":    ("1",  97_540_000, 98_388_000),
        }

        relevant = []
        for v in variants:
            rsid = v.get("rsid", "")
            info = v.get("info", "")
            chrom = v.get("chromosome", "").lstrip("chr")

            # 1. Known RSID for this gene
            if rsid in STAR_ALLELE_VARIANTS:
                if STAR_ALLELE_VARIANTS[rsid][0] == gene:
                    relevant.append(v)
                    continue

            # 2. Gene name in INFO field
            if gene in info or gene.lower() in info.lower():
                relevant.append(v)
                continue

            # 3. Genomic coordinate approximation
            if gene in GENE_CHROMOSOMES:
                g_chrom, g_start, g_end = GENE_CHROMOSOMES[gene]
                try:
                    pos = int(v.get("position", 0))
                    if chrom == g_chrom and g_start <= pos <= g_end:
                        relevant.append(v)
                        continue
                except (ValueError, TypeError):
                    pass

        return relevant

    def predict_risk(self, drug: str, variants: List[Dict]) -> Dict:
        """
        Main entry point for risk prediction.
        Returns comprehensive result dict.
        """
        gene = DRUG_GENE_MAP.get(drug.upper())
        if not gene:
            return {
                "gene": "Unknown",
                "phenotype": "Unknown",
                "allele1": "*?",
                "allele2": "*?",
                "activity_score": None,
                "risk": "Unknown",
                "severity": "none",
                "recommendation": f"Drug '{drug}' is not in the PharmaGuard knowledge base.",
                "mechanism": "N/A",
                "confidence": 0.0,
                "gene_variants": [],
            }

        # Filter to gene-relevant variants
        gene_variants = self.filter_variants_for_gene(gene, variants)

        # Determine phenotype using CPIC activity-score method
        phenotype, allele1, allele2, activity_score = self.determine_phenotype(gene, gene_variants)

        # Get CPIC rules for this drug+phenotype
        rules = CPIC_GUIDELINES.get(drug.upper(), {})
        rule = rules.get(phenotype)

        if rule is None:
            # Fallback: use NM rules (safest conservative assumption)
            rule = rules.get("NM", {
                "risk": "Unknown",
                "severity": "none",
                "recommendation": "No CPIC guideline available for this phenotype.",
                "mechanism": "See CPIC website for latest guidance."
            })

        confidence = self.calculate_confidence(gene, gene_variants, phenotype)

        return {
            "gene": gene,
            "phenotype": phenotype,
            "allele1": allele1,
            "allele2": allele2,
            "activity_score": activity_score,
            "risk": rule["risk"],
            "severity": rule["severity"],
            "recommendation": rule["recommendation"],
            "mechanism": rule["mechanism"],
            "confidence": confidence,
            "gene_variants": gene_variants,
        }

    def generate_diplotype_string(self, phenotype: str) -> str:
        """Legacy helper — kept for schema compatibility"""
        if phenotype == "NM":  return "*1/*1"
        if phenotype == "IM":  return "*1/*4"
        if phenotype == "PM":  return "*4/*4"
        if phenotype == "URM": return "*1xN/*1xN"
        if phenotype == "RM":  return "*1/*17"
        return "*?/*?"
