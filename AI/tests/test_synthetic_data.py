from data.seed_synthetic_data import SYNTHETIC_PAIRS
from app.schemas.match import ReportCandidateInput
from app.main import _execute_matching_pipeline


def test_synthetic_dataset_count_and_structure():
    assert len(SYNTHETIC_PAIRS) == 25
    for pair in SYNTHETIC_PAIRS:
        assert "pair_id" in pair
        assert "reportA" in pair
        assert "reportB" in pair
        assert "expected_eligible" in pair


def test_synthetic_pairs_pipeline_execution():
    """Verifies that all 25 pairs evaluate without uncaught exceptions and stay within [0.0, 1.0]."""
    for pair in SYNTHETIC_PAIRS:
        rep_a = ReportCandidateInput(**pair["reportA"])
        rep_b = ReportCandidateInput(**pair["reportB"])

        result = _execute_matching_pipeline(
            rep_a=rep_a,
            rep_b=rep_b,
            image_a_source=pair["reportA"]["photoPath"],
            image_b_source=pair["reportB"]["photoPath"]
        )

        assert 0.0 <= result.compositeScore <= 1.0
        assert 0.0 <= result.phoneticSimilarity <= 1.0
        assert 0.0 <= result.demographicScore <= 1.0
        assert 0.0 <= result.marksScore <= 1.0
        assert isinstance(result.isEligibleForReview, bool)
        assert isinstance(result.discrepancies, dict)