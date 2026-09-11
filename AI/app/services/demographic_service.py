from app.config import settings

def compute_demographic_similarity(age1: int | None, age2: int | None) -> tuple[float, int | None]:
    """
    Implements the documented age heuristic:
    delta_age = abs(age_A - age_B)
    demographic_score = max(0.0, 1.0 - delta_age / 10.0)
    
    Policy for missing ages:
       If age1 or age2 is missing/invalid (<= 0), missing data is treated neutrally (0.50) and age_delta is returned as None so discrepencies are not falsely reported.
    """
    
    if age1 is None or age2 is None or age1 <= 0 or age2 <= 0:
        return (0.50, None)
    
    delta = abs(age1 - age2)
    score = max(0.0, 1.0 - delta / settings.MAX_AGE_DELTA_TOLERANCE)
    score = min(1.0, score)
    
    return (round(score, 4), delta)