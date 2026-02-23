"""
PharmaGuard Knowledge Base — CPIC v2024 Aligned
================================================
Real RSID → Star-Allele mappings and comprehensive CPIC guidelines.
Based on official CPIC gene-drug guidelines.
"""

# ── Drug → Primary Gene mapping ──────────────────────────────────────────────
DRUG_GENE_MAP = {
    "CODEINE":     "CYP2D6",
    "WARFARIN":    "CYP2C9",
    "CLOPIDOGREL": "CYP2C19",
    "SIMVASTATIN": "SLCO1B1",
    "AZATHIOPRINE":"TPMT",
    "FLUOROURACIL":"DPYD",
}

# ── Star-Allele Defining Variants ─────────────────────────────────────────────
# Source: PharmVar, PharmGKB, CPIC official tables
# Each entry: rsid -> list of (gene, star_allele, function_impact)
# function_impact: "no_function" | "decreased_function" | "increased_function" | "normal_function"

STAR_ALLELE_VARIANTS = {
    # ── CYP2D6 ──────────────────────────────────────────────────────────────
    "rs3892097":  ("CYP2D6", "*4",  "no_function"),        # CYP2D6*4 — most common PM allele
    "rs35742686": ("CYP2D6", "*3",  "no_function"),        # CYP2D6*3 frameshift
    "rs5030655":  ("CYP2D6", "*6",  "no_function"),        # CYP2D6*6 frameshift
    "rs16947":    ("CYP2D6", "*2",  "normal_function"),    # CYP2D6*2 (activity ~1.0)
    "rs28371725": ("CYP2D6", "*41", "decreased_function"), # CYP2D6*41 splice defect
    "rs1065852":  ("CYP2D6", "*10", "decreased_function"), # CYP2D6*10 — common in Asians
    "rs5030867":  ("CYP2D6", "*8",  "no_function"),        # CYP2D6*8
    "rs769258":   ("CYP2D6", "*29", "decreased_function"), # CYP2D6*29

    # ── CYP2C9 ──────────────────────────────────────────────────────────────
    "rs1799853":  ("CYP2C9", "*2",  "decreased_function"), # CYP2C9*2 (R144C) ~12% activity
    "rs1057910":  ("CYP2C9", "*3",  "decreased_function"), # CYP2C9*3 (I359L) ~5% activity
    "rs28371686": ("CYP2C9", "*5",  "decreased_function"), # CYP2C9*5
    "rs9332131":  ("CYP2C9", "*6",  "no_function"),        # CYP2C9*6 splicing

    # ── CYP2C19 ─────────────────────────────────────────────────────────────
    "rs4244285":  ("CYP2C19", "*2",  "no_function"),       # CYP2C19*2 — most common loss-of-function
    "rs4986893":  ("CYP2C19", "*3",  "no_function"),       # CYP2C19*3 — common in Asians
    "rs28399504": ("CYP2C19", "*4",  "no_function"),       # CYP2C19*4
    "rs12248560": ("CYP2C19", "*17", "increased_function"),# CYP2C19*17 — rapid metabolizer allele
    "rs72552267": ("CYP2C19", "*35", "no_function"),       # CYP2C19*35

    # ── SLCO1B1 ──────────────────────────────────────────────────────────────
    "rs4149056":  ("SLCO1B1", "*5",  "decreased_function"),# SLCO1B1*5 — key simvastatin risk variant
    "rs2306283":  ("SLCO1B1", "*1b", "normal_function"),   # SLCO1B1*1b
    "rs11045819": ("SLCO1B1", "*14", "decreased_function"),# SLCO1B1*14

    # ── TPMT ─────────────────────────────────────────────────────────────────
    "rs1800462":  ("TPMT", "*2",   "no_function"),         # TPMT*2 (A80P)
    "rs1800460":  ("TPMT", "*3B",  "no_function"),         # TPMT*3B (G460A)
    "rs1142345":  ("TPMT", "*3C",  "no_function"),         # TPMT*3C (A719G) — most common


    # ── DPYD ─────────────────────────────────────────────────────────────────
    "rs3918290":  ("DPYD", "*2A",  "no_function"),         # DPYD*2A (IVS14+1G>A) — deadly
    "rs55886062": ("DPYD", "*13",  "no_function"),         # DPYD*13 (I560S)
    "rs67376798": ("DPYD", "c.2846A>T", "decreased_function"), # Key risk variant
    "rs1801159":  ("DPYD", "c.1627A>G", "decreased_function"), # c.1627A>G
}

# ── Diplotype → Activity Score → Phenotype rules ──────────────────────────────
# For each gene, define diplotype classification logic:
# Activity score approach (CYP2D6 standard):
# 0 = PM, 0.25-0.75 = IM, 1.0-2.25 = NM, >2.25 = URM
ALLELE_ACTIVITY_SCORES = {
    "CYP2D6": {
        "*1": 1.0, "*2": 1.0, "*10": 0.25, "*17": 0.5, "*41": 0.5, "*29": 0.5,
        "*3": 0.0, "*4": 0.0, "*5": 0.0, "*6": 0.0, "*8": 0.0,
        "*1xN": 2.0, "*2xN": 2.0,  # gene duplications → URM
        "default": 1.0  # unknown = assume *1
    },
    "CYP2C9": {
        "*1": 1.0, "*2": 0.5, "*3": 0.25, "*5": 0.25, "*6": 0.0,
        "default": 1.0
    },
    "CYP2C19": {
        "*1": 1.0, "*17": 1.5,
        "*2": 0.0, "*3": 0.0, "*4": 0.0, "*35": 0.0,
        "default": 1.0
    },
    "SLCO1B1": {
        "*1a": 1.0, "*1b": 1.0, "*5": 0.0, "*14": 0.5,
        "default": 1.0
    },
    "TPMT": {
        "*1": 1.0, "*2": 0.0, "*3A": 0.0, "*3B": 0.0, "*3C": 0.0,
        "default": 1.0
    },
    "DPYD": {
        "wt": 1.0, "*2A": 0.0, "*13": 0.0, "c.2846A>T": 0.5, "c.1627A>G": 0.5,
        "default": 1.0
    },
}

def activity_score_to_phenotype(gene: str, allele1: str, allele2: str) -> str:
    """Convert two alleles into phenotype using activity scores."""
    scores = ALLELE_ACTIVITY_SCORES.get(gene, {})
    s1 = scores.get(allele1, scores.get("default", 1.0))
    s2 = scores.get(allele2, scores.get("default", 1.0))
    total = s1 + s2

    if gene == "CYP2D6":
        if total == 0: return "PM"
        elif total < 1.25: return "IM"
        elif total >= 2.25: return "URM"
        else: return "NM"

    elif gene == "CYP2C19":
        if total == 0: return "PM"
        elif 0 < total < 1.0: return "IM"
        elif total >= 2.5: return "URM"
        elif total >= 1.5: return "RM"
        else: return "NM"

    elif gene in ("CYP2C9", "SLCO1B1", "TPMT", "DPYD"):
        if total == 0: return "PM"
        elif total < 1.0: return "IM"
        else: return "NM"

    return "NM"


def diplotype_string(allele1: str, allele2: str) -> str:
    return f"{allele1}/{allele2}"


# ── CPIC Guidelines — Complete Coverage ───────────────────────────────────────
CPIC_GUIDELINES = {
    "CODEINE": {
        "URM": {
            "risk": "Toxic",
            "severity": "critical",
            "recommendation": (
                "AVOID CODEINE. Ultra-rapid CYP2D6 metabolism converts codeine to morphine "
                "at dangerously high rates. Risk of life-threatening respiratory depression and "
                "morphine toxicity. Select an alternative opioid (e.g., morphine, oxycodone) "
                "NOT metabolized by CYP2D6."
            ),
            "mechanism": "CYP2D6 URM phenotype causes excessive O-demethylation of codeine to morphine. Plasma morphine concentrations can reach 50x normal, causing respiratory depression, coma, or death.",
        },
        "PM": {
            "risk": "Ineffective",
            "severity": "high",
            "recommendation": (
                "AVOID CODEINE. Poor CYP2D6 metabolism means codeine cannot be converted "
                "to its active metabolite morphine. No analgesic benefit expected. "
                "Select a non-CYP2D6 metabolized opioid (e.g., oxymorphone, buprenorphine)."
            ),
            "mechanism": "CYP2D6 PM phenotype prevents O-demethylation of codeine to morphine (active metabolite). Patient receives no analgesia.",
        },
        "IM": {
            "risk": "Adjust Dosage",
            "severity": "moderate",
            "recommendation": (
                "Use codeine with caution. Intermediate metabolism results in reduced but "
                "variable morphine production. Monitor pain control effectiveness. "
                "Consider alternative if pain is not controlled."
            ),
            "mechanism": "Reduced CYP2D6 activity leads to subtherapeutic morphine levels in most cases.",
        },
        "NM": {
            "risk": "Safe",
            "severity": "none",
            "recommendation": "Use standard codeine dose per label. Normal analgesic response expected.",
            "mechanism": "Normal CYP2D6 activity converts codeine to morphine at expected rates.",
        },
        "RM": {
            "risk": "Adjust Dosage",
            "severity": "moderate",
            "recommendation": "Monitor for increased morphine effect. Consider reduced dose.",
            "mechanism": "Slightly elevated CYP2D6 activity may lead to higher-than-expected morphine levels.",
        },
    },

    "WARFARIN": {
        "PM": {
            "risk": "Toxic",
            "severity": "high",
            "recommendation": (
                "START with significantly lower warfarin dose (typically 30-50% reduction). "
                "INR target weekly or more frequently. Use clinical decision support algorithms "
                "(IWPC, EU-PACT) incorporating CYP2C9 genotype for personalized dosing."
            ),
            "mechanism": "CYP2C9 PM reduces S-warfarin (more potent enantiomer) clearance by >80%. Drug accumulates causing supratherapeutic INR and hemorrhage risk.",
        },
        "IM": {
            "risk": "Adjust Dosage",
            "severity": "moderate",
            "recommendation": (
                "Consider lower starting warfarin dose (20-30% reduction). "
                "More frequent INR monitoring especially in first 4 weeks. "
                "Titrate carefully to therapeutic INR (2.0-3.0)."
            ),
            "mechanism": "Reduced CYP2C9 activity leads to higher warfarin exposure. *2 reduces activity to ~12% of *1/*1.",
        },
        "NM": {
            "risk": "Safe",
            "severity": "none",
            "recommendation": "Standard warfarin dosing per CPIC algorithm. Target INR 2.0-3.0. Standard monitoring schedule.",
            "mechanism": "Normal CYP2C9 activity maintains expected warfarin clearance.",
        },
    },

    "CLOPIDOGREL": {
        "PM": {
            "risk": "Ineffective",
            "severity": "high",
            "recommendation": (
                "AVOID CLOPIDOGREL. Two loss-of-function CYP2C19 alleles severely impair "
                "bioactivation. Use prasugrel or ticagrelor as alternatives. "
                "Prasugrel preferred in ACS with PCI (check for bleeding risk contraindications)."
            ),
            "mechanism": "CYP2C19 PM (*2/*2, *2/*3) reduces clopidogrel active thienopyridine formation by >70%. High platelet reactivity and major adverse cardiovascular events (MACE) risk.",
        },
        "IM": {
            "risk": "Ineffective",
            "severity": "moderate",
            "recommendation": (
                "Consider alternative antiplatelet (prasugrel, ticagrelor) especially for ACS/PCI. "
                "One loss-of-function allele still reduces active metabolite formation significantly. "
                "If clopidogrel must be used, monitor platelet function if available."
            ),
            "mechanism": "Single CYP2C19 loss-of-function allele reduces active metabolite by ~30-40%. Increased but less severe platelet reactivity.",
        },
        "NM": {
            "risk": "Safe",
            "severity": "none",
            "recommendation": "Standard clopidogrel dosing. Normal antiplatelet response expected.",
            "mechanism": "Normal CYP2C19 bioactivation of clopidogrel prodrug.",
        },
        "RM": {
            "risk": "Safe",
            "severity": "none",
            "recommendation": "Standard clopidogrel dosing. Enhanced bioactivation, monitor for bleeding.",
            "mechanism": "CYP2C19*17 increases active metabolite formation. Potentially enhanced antiplatelet effect.",
        },
        "URM": {
            "risk": "Adjust Dosage",
            "severity": "low",
            "recommendation": "Monitor for increased bleeding risk. Standard dose typically appropriate.",
            "mechanism": "Enhanced clopidogrel bioactivation may increase active metabolite exposure.",
        },
    },

    "SIMVASTATIN": {
        "PM": {
            "risk": "Toxic",
            "severity": "high",
            "recommendation": (
                "AVOID SIMVASTATIN 40mg or higher. SLCO1B1*5/*5 homozygous dramatically "
                "reduces hepatic uptake, increasing systemic simvastatin exposure. "
                "If statin required: use pravastatin or rosuvastatin (not SLCO1B1-dependent). "
                "Alternatively, simvastatin ≤20mg with intensive CK monitoring."
            ),
            "mechanism": "SLCO1B1 PM (*5/*5) reduces hepatic organic anion transporter (OATP1B1) function, increasing systemic simvastatin acid AUC by ~220%. Severe myopathy and rhabdomyolysis risk.",
        },
        "IM": {
            "risk": "Adjust Dosage",
            "severity": "moderate",
            "recommendation": (
                "AVOID SIMVASTATIN 80mg. Use maximum dose of 20mg with monitoring. "
                "Consider rosuvastatin or pravastatin for equivalent LDL-reduction with less risk. "
                "Monitor CK levels at baseline and 6-12 weeks."
            ),
            "mechanism": "One SLCO1B1*5 allele increases simvastatin AUC by ~60-100%, moderately elevating myopathy risk especially at doses ≥40mg.",
        },
        "NM": {
            "risk": "Safe",
            "severity": "none",
            "recommendation": "Standard simvastatin dosing per clinical guidelines. Maximum 40mg/day per FDA guidance.",
            "mechanism": "Normal OATP1B1 transport function maintains expected hepatic uptake and systemic exposure.",
        },
    },

    "AZATHIOPRINE": {
        "PM": {
            "risk": "Toxic",
            "severity": "critical",
            "recommendation": (
                "CONTRAINDICATED at standard doses. TPMT PM phenotype leads to extreme accumulation "
                "of toxic thioguanine nucleotides (TGNs). Risk of life-threatening hematopoietic toxicity. "
                "If azathioprine/6-MP is required: reduce dose to 10% of normal (e.g., 10mg/day) with "
                "weekly CBC monitoring. Consider mycophenolate as alternative."
            ),
            "mechanism": "TPMT PM (*2/*2, *3A/*3A, *3C/*3C) cannot inactivate thiopurine via S-methylation. All drug shunted to cytotoxic TGN pathway. Myelosuppression in first 2-4 weeks.",
        },
        "IM": {
            "risk": "Adjust Dosage",
            "severity": "moderate",
            "recommendation": (
                "Start with 30-70% of standard dose. Monitor CBC every 2 weeks for first 2 months, "
                "then monthly. Target TGN levels 235-450 pmol/8x10^8 RBC if measurable. "
                "Reduce dose or discontinue if WBC <3000 cells/μL."
            ),
            "mechanism": "Single TPMT loss-of-function allele reduces enzyme activity by ~50%. Intermediate TGN accumulation. Risk of delayed myelosuppression.",
        },
        "NM": {
            "risk": "Safe",
            "severity": "none",
            "recommendation": "Standard azathioprine dosing per clinical indication. CBC at baseline and at 1-3 months.",
            "mechanism": "Normal TPMT activity efficiently inactivates thiopurines via methylation pathway.",
        },
    },

    "FLUOROURACIL": {
        "PM": {
            "risk": "Toxic",
            "severity": "critical",
            "recommendation": (
                "CONTRAINDICATED. DPYD PM (*2A/*2A) blocks >80% of 5-FU catabolism. "
                "Even standard doses cause severe and potentially fatal toxicity (neutropenia, "
                "mucositis, diarrhea, hand-foot syndrome, neurotoxicity). "
                "Select an alternative non-fluoropyrimidine chemotherapy regimen."
            ),
            "mechanism": "DPYD enzyme (dihydropyrimidine dehydrogenase) is responsible for ~80% of 5-FU degradation. PM phenotype causes massive systemic 5-FU accumulation with catastrophic multi-organ toxicity.",
        },
        "IM": {
            "risk": "Adjust Dosage",
            "severity": "high",
            "recommendation": (
                "Reduce 5-FU/capecitabine starting dose by 50%. Monitor closely for toxicity (CBC, "
                "diarrhea, stomatitis). If grade 1-2 toxicity, proceed cautiously with escalation "
                "based on tolerability. DPYD*2A heterozygotes can often tolerate reduced doses."
            ),
            "mechanism": "One DPYD loss-of-function allele halves catabolism capacity. 5-FU exposure approximately doubles, causing severe but often manageable toxicity with dose reduction.",
        },
        "NM": {
            "risk": "Safe",
            "severity": "none",
            "recommendation": "Standard 5-FU/capecitabine dosing per oncology protocol. Normal toxicity monitoring.",
            "mechanism": "Normal DPYD activity (~80% of 5-FU catabolized in liver) maintains expected drug exposure.",
        },
    },
}

# ── Extended drug info for frontend display ────────────────────────────────────
DRUG_INFO = {
    "CODEINE": {
        "class": "Opioid Analgesic",
        "mechanism_short": "Prodrug converted to morphine via CYP2D6",
        "cpic_tier": "A",
        "cpic_url": "https://cpicpgx.org/guidelines/cpic-guideline-for-codeine-and-cyp2d6/",
        "common_uses": "Mild-moderate pain, cough suppression",
    },
    "WARFARIN": {
        "class": "Vitamin K Antagonist Anticoagulant",
        "mechanism_short": "Inhibits VKORC1; metabolism via CYP2C9 (S-form)",
        "cpic_tier": "A",
        "cpic_url": "https://cpicpgx.org/guidelines/guideline-for-warfarin-and-cyp2c9-and-vkorc1/",
        "common_uses": "DVT prophylaxis, atrial fibrillation, mechanical heart valves",
    },
    "CLOPIDOGREL": {
        "class": "P2Y12 Antiplatelet",
        "mechanism_short": "Prodrug activated by CYP2C19 to irreversible P2Y12 blocker",
        "cpic_tier": "A",
        "cpic_url": "https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/",
        "common_uses": "Acute coronary syndrome, PCI, stroke prevention",
    },
    "SIMVASTATIN": {
        "class": "HMG-CoA Reductase Inhibitor (Statin)",
        "mechanism_short": "Hepatic uptake via OATP1B1 (SLCO1B1); cholesterol lowering",
        "cpic_tier": "A",
        "cpic_url": "https://cpicpgx.org/guidelines/guideline-for-simvastatin-and-slco1b1/",
        "common_uses": "Hypercholesterolemia, cardiovascular risk reduction",
    },
    "AZATHIOPRINE": {
        "class": "Thiopurine Immunosuppressant",
        "mechanism_short": "Converted to active thioguanine nucleotides; inactivated by TPMT",
        "cpic_tier": "A",
        "cpic_url": "https://cpicpgx.org/guidelines/guideline-for-azathioprine-and-tpmt-and-nudt15/",
        "common_uses": "Inflammatory bowel disease, organ transplant, autoimmune disorders",
    },
    "FLUOROURACIL": {
        "class": "Fluoropyrimidine Antineoplastic",
        "mechanism_short": "Pyrimidine analog; 80% catabolized by DPYD in liver",
        "cpic_tier": "A",
        "cpic_url": "https://cpicpgx.org/guidelines/cpic-guideline-for-fluoropyrimidines-and-dpyd/",
        "common_uses": "Colorectal, breast, head and neck cancers; also capecitabine prodrug",
    },
}
