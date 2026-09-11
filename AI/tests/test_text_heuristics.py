from app.services.phonetic_service import compute_phonetic_similarity, normalize_text
from app.services.demographic_service import compute_demographic_similarity
from app.services.marks_service import compute_marks_similarity


def test_name_transliteration_matching():
    # Specification benchmark: "Arun Kumar" vs "Aroon Kumaar"
    score, keys_a, keys_b = compute_phonetic_similarity("Arun Kumar", "Aroon Kumaar")
    assert score >= 0.90
    assert len(keys_a) > 0
    assert set(keys_a) == set(keys_b)


def test_completely_different_names():
    score, _, _ = compute_phonetic_similarity("Arun Kumar", "Jennifer Lawrence")
    assert score < 0.50


def test_unicode_and_punctuation_handling():
    norm = normalize_text("  Dr. René D'Souza-Smith  ")
    assert norm == "dr rene d souza-smith"


def test_empty_or_null_names():
    score, keys_a, keys_b = compute_phonetic_similarity("", None)
    assert score == 0.0
    assert keys_a == []
    assert keys_b == []


def test_demographic_exact_age():
    score, delta = compute_demographic_similarity(28, 28)
    assert score == 1.0
    assert delta == 0


def test_demographic_acceptable_delta():
    # delta = 2 -> score = 1.0 - (2/10) = 0.80
    score, delta = compute_demographic_similarity(28, 30)
    assert score == 0.80
    assert delta == 2


def test_demographic_large_delta():
    # delta = 15 -> score = max(0.0, 1.0 - 1.5) = 0.0
    score, delta = compute_demographic_similarity(20, 35)
    assert score == 0.0
    assert delta == 15


def test_demographic_missing_ages():
    score_a, delta_a = compute_demographic_similarity(28, None)
    score_b, delta_b = compute_demographic_similarity(None, None)
    assert score_a == 0.50
    assert delta_a is None
    assert score_b == 0.50
    assert delta_b is None


def test_distinguishing_marks_overlap():
    desc_a = "scar on left eyebrow"
    desc_b = "small scar near left eyebrow"
    score, overlap = compute_marks_similarity(desc_a, desc_b)
    # Common tokens: 'eyebrow', 'left', 'scar'
    assert score > 0.60
    assert "eyebrow" in overlap
    assert "scar" in overlap


def test_distinguishing_marks_disjoint_and_empty():
    score_disjoint, overlap_disjoint = compute_marks_similarity("tattoo on arm", "burn mark on leg")
    score_empty, overlap_empty = compute_marks_similarity("", None)
    assert score_disjoint == 0.0
    assert overlap_disjoint == []
    assert score_empty == 0.0
    assert overlap_empty == []