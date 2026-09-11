from app.services.scoring_service import calculate_composite_score


def test_standard_composite_calculation():
    # face: 0.90 * 0.40 = 0.36
    # phonetic: 0.95 * 0.35 = 0.3325
    # demographic: 0.80 * 0.15 = 0.12
    # marks: 0.70 * 0.10 = 0.07
    # Expected composite = 0.36 + 0.3325 + 0.12 + 0.07 = 0.8825
    result = calculate_composite_score(
        face_similarity=0.90,
        face_detected_a=True,
        face_detected_b=True,
        phonetic_similarity=0.95,
        demographic_score=0.80,
        marks_score=0.70,
        age_delta=2,
        marks_overlap=["scar"]
    )
    assert result.composite_score == 0.8825
    assert result.face_similarity == 0.90
    assert result.is_degraded_text_only is False
    assert result.is_eligible_for_review is True
    assert result.discrepancy_summary["ageDelta"] == 2
    assert result.discrepancy_summary["marksOverlap"] == ["scar"]


def test_no_face_fallback_dynamic_reweighting():
    # Fallback weights: 0.70 phonetic, 0.20 demographic, 0.10 marks
    # phonetic: 0.90 * 0.70 = 0.63
    # demographic: 0.80 * 0.20 = 0.16
    # marks: 0.50 * 0.10 = 0.05
    # Expected composite = 0.63 + 0.16 + 0.05 = 0.84
    result = calculate_composite_score(
        face_similarity=None,
        face_detected_a=False,
        face_detected_b=True,
        phonetic_similarity=0.90,
        demographic_score=0.80,
        marks_score=0.50
    )
    assert result.composite_score == 0.84
    assert result.face_similarity == 0.0
    assert result.is_degraded_text_only is True
    assert result.is_eligible_for_review is True
    assert result.discrepancy_summary["isDegradedTextOnly"] is True


def test_threshold_boundary_evaluation():
    # Result exactly 0.60 -> True
    res_pass = calculate_composite_score(
        face_similarity=None,
        face_detected_a=False,
        face_detected_b=False,
        phonetic_similarity=0.60 / 0.70,  # 0.60 from phonetic alone
        demographic_score=0.0,
        marks_score=0.0
    )
    assert res_pass.composite_score == 0.60
    assert res_pass.is_eligible_for_review is True

    # Result 0.599 -> False
    res_fail = calculate_composite_score(
        face_similarity=None,
        face_detected_a=False,
        face_detected_b=False,
        phonetic_similarity=0.59 / 0.70,
        demographic_score=0.0,
        marks_score=0.0
    )
    assert res_fail.composite_score < 0.60
    assert res_fail.is_eligible_for_review is False


def test_score_clamping_upper_and_lower():
    # Force overflow
    res_overflow = calculate_composite_score(
        face_similarity=1.5,
        face_detected_a=True,
        face_detected_b=True,
        phonetic_similarity=2.0,
        demographic_score=1.5,
        marks_score=1.1
    )
    assert res_overflow.composite_score == 1.0
    assert res_overflow.face_similarity == 1.0

    # Force underflow
    res_underflow = calculate_composite_score(
        face_similarity=-0.5,
        face_detected_a=True,
        face_detected_b=True,
        phonetic_similarity=-1.0,
        demographic_score=-0.2,
        marks_score=-0.5
    )
    assert res_underflow.composite_score == 0.0
    assert res_underflow.face_similarity == 0.0