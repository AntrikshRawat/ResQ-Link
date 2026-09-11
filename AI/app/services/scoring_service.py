from dataclasses import dataclass
from typing import Any
from app.config import settings

@dataclass(frozen = True)
class ScoringBreakdown:
    composite_score: float
    face_similarity: float
    phonetic_similarity: float
    demographic_score: float
    marks_score: float
    is_eligible_for_review: bool
    is_degraded_text_only: bool
    discrepancy_summary: dict[str, Any]
    
def calculate_composite_score(face_similarity: float | None, face_detected_a: bool, face_detected_b: bool, phonetic_similarity: float, demographic_score: float, marks_score: float, age_delta: int | None = None, marks_overlap: list[str] | None = None, phonetic_keys_a: list[str] | None = None, phonetic_keys_b: list[str] | None = None, name_a: str = "", name_b: str = "") -> ScoringBreakdown:
    """
    Computes composite similarity scores using deterministic linear models.
    
    Normal Formula (Both faces detected):
        composite = (0.40 * face + 0.35 * phonetic + 0.15 * demographic + 0.10 * marks)
        
    Fallback Formula (One or both faces missing/undetected):
        composite = 0.70 * phonetic + 0.20 * demographic + 0.10 * marks
    """
    
    p_score = max(0.0, min(1.0, float(phonetic_similarity)))
    d_score = max(0.0, min(1.0, float(demographic_score)))
    m_score = max(0.0, min(1.0, float(marks_score)))
    
    has_valid_face = (face_detected_a and face_detected_b and face_similarity is not None)
    
    if has_valid_face:
        f_score = max(0.0, min(1.0, float(face_similarity)))
        raw_composite = ((settings.WEIGHT_FACE_NORMAL * f_score) + (settings.WEIGHT_PHONETIC_NORMAL * p_score) + (settings.WEIGHT_DEMOGRAPHIC_NORMAL * d_score) + (settings.WEIGHT_MARKS_NORMAL * m_score))
        is_degraded = False
        final_face_score = round(f_score, 4)
    else:
        raw_composite = ((settings.WEIGHT_PHONETIC_FALLBACK * p_score) + (settings.WEIGHT_DEMOGRAPHIC_FALLBACK * d_score) + (settings.WEIGHT_MARKS_FALLBACK * m_score))
        is_degraded = True
        final_face_score = 0.0
        
    final_composite = round(max(0.0, min(1.0, raw_composite)), 4)
    is_eligible = final_composite >= settings.REVIEW_THRESHOLD
    
    discrepancy_summary = {
        "ageDelta": age_delta,
        "marksOverlap": marks_overlap,
        "nameDiscrepancy": f"{name_a} vs {name_b}",
        "phoneticKeysA": phonetic_keys_a or [],
        "phoneticKeysB": phonetic_keys_b or [],
        "faceDetectedA": face_detected_a,
        "faceDetectedB": face_detected_b,
        "isDegradedTextOnly": is_degraded,
        "reviewThreshold": settings.REVIEW_THRESHOLD
    }
    
    return ScoringBreakdown(composite_score = final_composite, face_similarity = final_face_score, phonetic_similarity = round(p_score, 4), demographic_score = round(d_score, 4), marks_score = round(m_score, 4), is_eligible_for_review = is_eligible, is_degraded_text_only = is_degraded, discrepancy_summary = discrepancy_summary)
    