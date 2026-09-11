from app.config import settings

def test_standard_weights_sum_to_one():
    total_normal_weight = (settings.WEIGHT_FACE_NORMAL + settings.WEIGHT_PHONETIC_NORMAL + settings.WEIGHT_DEMOGRAPHIC_NORMAL + settings.WEIGHT_MARKS_NORMAL)
    assert round(total_normal_weight, 5) == 1.00
    
def test_fallback_weights_sum_to_one():
    total_fallback_weight = (settings.WEIGHT_PHONETIC_FALLBACK + settings.WEIGHT_DEMOGRAPHIC_FALLBACK + settings.WEIGHT_MARKS_FALLBACK)
    assert round(total_fallback_weight, 5) == 1.00
    
def test_triage_review_threshold():
    assert settings.REVIEW_THRESHOLD == 0.60
    assert settings.MAX_AGE_DELTA_TOLERANCE == 10.0