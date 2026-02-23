import re
from typing import List, Dict, Any

class VCFParser:
    def __init__(self, content: bytes):
        self.content = content.decode('utf-8')
        self.lines = self.content.splitlines()
        self.variants = []
        self.metadata = {}
        
    def validate(self) -> bool:
        """Validates if the file is a valid VCF v4.2"""
        if not self.lines:
            return False
            
        header_found = False
        for line in self.lines:
            if line.startswith('##fileformat=VCFv4.2'):
                header_found = True
                break
        
        # Basic check, can be relaxed if needed but requirement says strict
        return header_found

    def parse(self) -> Dict[str, Any]:
        """Parses the VCF content"""
        # Iterate relevant lines
        # In a real scenario, we'd look for specific positions.
        # For this hackathon/MVP, we'll scan for our target genes if annotated, 
        # or simplified variant detection.
        
        extracted_data = []

        data_started = False
        header = []
        
        for line in self.lines:
            if line.startswith('#CHROM'):
                header = line.strip().split('\t')
                data_started = True
                continue
            
            if line.startswith('#'):
                continue
                
            if data_started:
                parts = line.strip().split('\t')
                if len(parts) < 5:
                    continue
                    
                chrom = parts[0]
                pos = parts[1]
                rsid = parts[2]
                ref = parts[3]
                alt = parts[4]
                info = parts[7] if len(parts) > 7 else ""
                
                # Check for target genes in INFO if available, or just collect all
                # In a real VCF, GENE might be in INFO like GENE=CYP2D6
                
                # Minimal struct
                variant = {
                    "rsid": rsid if rsid != "." else f"{chrom}:{pos}",
                    "chromosome": chrom,
                    "position": pos,
                    "reference": ref,
                    "alternate": alt,
                    "info": info
                }
                
                extracted_data.append(variant)
                
        return extracted_data

    def find_variants_for_gene(self, gene: str, variants: List[Dict]) -> List[Dict]:
        """
        Filter variants relevant to a gene.
        This is a heuristic since proper mapping requires genomic coordinates.
        For the prompt's sake, we assume the VCF might interpretatively have gene names 
        OR we match known RSIDs.
        """
        # Mocking the gene lookup for the MVP if INFO tags aren't perfect
        # In production: Use an interval tree or strict coordinate lookup.
        
        relevant = []
        for v in variants:
            # Simple substring check in INFO or look up by RSID list (ommitted for brevity)
            if gene in v.get("info", ""):
                relevant.append(v)
        
        return relevant
