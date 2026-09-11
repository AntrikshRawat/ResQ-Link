import io
import numpy as np
from PIL import Image
from unittest.mock import patch, MagicMock
from app.services.face_service import (
    load_image,
    compute_cosine_similarity,
    extract_face_embedding
)


def _generate_synthetic_image_bytes(color=(128, 128, 128), size=(200, 200)) -> bytes:
    """Generates an in-memory plain RGB JPEG image (no face)."""
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_load_image_valid_bytes():
    raw_bytes = _generate_synthetic_image_bytes()
    img = load_image(raw_bytes)
    assert img is not None
    assert img.mode == "RGB"
    assert img.size == (200, 200)


def test_load_image_corrupted_and_empty():
    assert load_image(b"") is None
    assert load_image(b"corrupted_header_data_not_an_image") is None
    assert load_image(None) is None


def test_no_face_detected_on_blank_image():
    # Plain solid background contains no facial landmarks; MTCNN returns None
    blank_bytes = _generate_synthetic_image_bytes(color=(255, 255, 255))
    embedding, face_detected = extract_face_embedding(blank_bytes)
    assert face_detected is False
    assert embedding is None


def test_cosine_similarity_identical_vectors():
    vec = [0.1] * 512
    sim = compute_cosine_similarity(vec, vec)
    assert sim == 1.0


def test_cosine_similarity_orthogonal_and_opposite():
    vec_a = [1.0, 0.0] + [0.0] * 510
    vec_b = [0.0, 1.0] + [0.0] * 510
    # Orthogonal vectors -> dot product 0.0
    assert compute_cosine_similarity(vec_a, vec_b) == 0.0

    # Opposite vectors -> clamped to 0.0
    vec_c = [-1.0, 0.0] + [0.0] * 510
    assert compute_cosine_similarity(vec_a, vec_c) == 0.0


def test_cosine_similarity_none_handling():
    vec = [0.2] * 512
    assert compute_cosine_similarity(None, vec) == 0.0
    assert compute_cosine_similarity(vec, None) == 0.0
    assert compute_cosine_similarity(None, None) == 0.0


def test_mocked_face_embedding_pipeline():
    """Verifies embedding extraction with a mocked FaceNet model (zero network calls)."""
    raw_bytes = _generate_synthetic_image_bytes()

    mock_tensor = MagicMock()
    mock_tensor.unsqueeze.return_value.to.return_value = MagicMock()

    mock_embedder = MagicMock()
    mock_embedder.return_value.detach.return_value.cpu.return_value.numpy.return_value = np.array([
        [0.5] * 512
    ])

    with patch("app.services.face_service.get_mtcnn") as mock_get_mtcnn, \
         patch("app.services.face_service.get_resnet") as mock_get_resnet:
        
        mock_detector = MagicMock()
        mock_detector.return_value = mock_tensor
        mock_get_mtcnn.return_value = mock_detector
        mock_get_resnet.return_value = mock_embedder

        embedding, detected = extract_face_embedding(raw_bytes)
        assert detected is True
        assert embedding is not None
        assert len(embedding) == 512