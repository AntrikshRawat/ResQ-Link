import pytest
from app.nlp import compute_phonetic_score, compute_demographic_score
from app.vision import process_image_file, extract_face_embedding, compute_cosine_similarity


def test_phonetic_transliterations():
    score = compute_phonetic_score("John", "Jon")
    assert score >= 0.8

    score2 = compute_phonetic_score("Smith", "Smyth")
    assert score2 >=0.80


def test_identical_faces_score_high():
    v1 = [0.5]*512
    v2 = [0.5]*512

    score = compute_cosine_similarity(v1 , v2)
    assert score >= 0.50

def test_demographic_age_penalty():
    same_age = compute_demographic_score(25 , 25)
    assert same_age == 1.0

    different_age = compute_demographic_score(25 , 35)
    assert different_age == 0.0
