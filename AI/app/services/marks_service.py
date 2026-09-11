import re
from app.services.phonetic_service import normalize_text

MARKS_STOPWORDS = {"a", "an", "the", "and", "or", "on", "in", "at", "near", "of", "with", "has", "have", "had", "no", "none", "body", "person", "side", "mark", "marks", "visible", "apparent", "approx"}

def tokenize_marks(description : str | None) -> set[str]:
    if not description:
        return set()
    
    normalized = normalize_text(description)
    if not normalized:
        return set()
    
    tokens = re.findall(r"\b[a-z]{3,}\b", normalized)
    return {t for t in tokens if t not in MARKS_STOPWORDS}

def compute_marks_similarity(marks1: str | None, marks2: str | None) -> tuple[float, list[str]]:
    """
    Computes deterministic Jaccard-style token overlap for distinguishing physical marks.
    
    Returns:
       (marks_score, list_of_overlapping_tokens)
    """
    
    set1 = tokenize_marks(marks1)
    set2 = tokenize_marks(marks2)
    
    if not set1 or not set2:
        return (0.0, [])
    
    intersection = set1.intersection(set2)
    union = set1.union(set2)
    
    if not union:
        return (0.0, [])
    
    jaccard_score = len(intersection) / len(union)
    clamped_score = max(0.0, min(1.0, jaccard_score))
    
    return (round(clamped_score, 4), sorted(list(intersection)))