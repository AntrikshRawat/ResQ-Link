import re
import unicodedata
import jellyfish
from app.utils.metaphone import double_metaphone

def normalize_text(text: str | None) -> str:
    """
    Applies NFKD Unicode normalization, lowercase transformation, and collapses extra whitespace while removing non-alphanumeric punctuation.
    """
    if not text:
        return ""
    norm = unicodedata.normalize("NFKD", text)
    
    norm = "".join(c for c in norm if not unicodedata.combining(c))
    norm = norm.lower()
    
    norm = re.sub(r"[^\w\s-]", " ", norm)
    norm = re.sub(r"\s+", " ", norm).strip()
    return norm

def extract_name_phonetic_keys(name: str) -> list[str]:
    """
    Tokenizes a full name and returns all distinct primary and secondary Double Metaphone keys across all tokens.
    """
    
    normalized = normalize_text(name)
    if not normalized:
        return []
    
    tokens = [t for t in normalized.replace("-", " ").split() if t]
    keys: set[str] = set()
    for token in tokens:
        p, s = double_metaphone(token)
        if p:
            keys.add(p)
        if s:
            keys.add(s)
            
    return sorted(list(keys))

def compute_phonetic_similarity(name1: str | None, name2: str | None) -> tuple[float, list[str], list[str]]:
    """
    Calculates phonetic and textual similarity across two names.
    Returns:
    (phonetic_score, phonetic_keys_A, phonetic_keys_B)
    """
    norm1 = normalize_text(name1)
    norm2 = normalize_text(name2)
    
    if not norm1 or not norm2:
        return (0.0, [], [])
    
    keys1 = extract_name_phonetic_keys(norm1)
    keys2 = extract_name_phonetic_keys(norm2)
    
    jw_score = float(jellyfish.jaro_winkler_similarity(norm1, norm2))
    
    set1 = set(keys1)
    set2 = set(keys2)
    common_keys = set1.intersection(set2)
    
    if set1 and set2:
        overlap_ratio = len(common_keys) / max(len(set1), len(set2))
    else:
        overlap_ratio = 0.0
        
    if overlap_ratio > 0.80:
        final_score = max(jw_score, 0.92)
    elif overlap_ratio > 0.50:
        final_score = max(jw_score, 0.85)
    elif common_keys:
        final_score = max(jw_score, 0.75)
    else:
        final_score = jw_score
        
    final_score = max(0.0, min(1.0, final_score))
    return (round(final_score, 4), keys1, keys2)    