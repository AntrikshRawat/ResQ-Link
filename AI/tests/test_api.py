from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["reviewThreshold"] == 0.60


def test_evaluate_match_text_only_fallback():
    payload = {
        "reportA": {
            "firstName": "Arun",
            "lastName": "Kumar",
            "approximateAge": 28,
            "distinguishingMarks": "scar on left eyebrow",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Aroon",
            "lastName": "Kumaar",
            "approximateAge": 30,
            "distinguishingMarks": "small scar near left eyebrow",
            "photoPath": None
        }
    }

    response = client.post("/api/v1/evaluate-match", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Fallback mode validation
    assert data["isDegradedTextOnly"] is True
    assert data["faceDetectedA"] is False
    assert data["faceDetectedB"] is False
    assert data["faceSimilarity"] == 0.0

    # Sub-score and eligibility validation
    assert data["phoneticSimilarity"] >= 0.90
    assert data["demographicScore"] == 0.80  # delta = 2 -> 1.0 - 0.2
    assert data["marksScore"] > 0.50
    assert data["compositeScore"] >= 0.60
    assert data["isEligibleForReview"] is True

    # Discrepancy structure validation
    discrepancies = data["discrepancies"]
    assert discrepancies["ageDelta"] == 2
    assert "scar" in discrepancies["marksOverlap"]
    assert "ARN" in discrepancies["phoneticKeysA"]


def test_evaluate_match_disjoint_candidate_pair():
    payload = {
        "reportA": {
            "firstName": "Rajesh",
            "lastName": "Sharma",
            "approximateAge": 45,
            "distinguishingMarks": "mole on right cheek",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Sneha",
            "lastName": "Patel",
            "approximateAge": 22,
            "distinguishingMarks": "tattoo on wrist",
            "photoPath": None
        }
    }

    response = client.post("/api/v1/evaluate-match", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["compositeScore"] < 0.60
    assert data["isEligibleForReview"] is False
    assert data["demographicScore"] == 0.0
    assert data["marksScore"] == 0.0


def test_evaluate_match_validation_error():
    payload = {
        "reportA": {
            "lastName": "Kumar"  # Missing required firstName
        },
        "reportB": {
            "firstName": "Arun"
        }
    }
    response = client.post("/api/v1/evaluate-match", json=payload)
    assert response.status_code == 422