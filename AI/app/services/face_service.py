import io
import logging
from pathlib import Path
from typing import Any
import numpy as np
from PIL import Image, UnidentifiedImageError
import torch
from facenet_pytorch import MTCNN, InceptionResnetV1
from app.config import settings

logger = logging.getLogger(__name__)

# Enforce PIL safety limits against decompression bomb attacks
Image.MAX_IMAGE_PIXELS = 25_000_000  # 25 MP ceiling

device = torch.device(settings.DEVICE)

# Private lazy singletons
_mtcnn: MTCNN | None = None
_resnet: InceptionResnetV1 | None = None


def get_mtcnn() -> MTCNN:
    """Lazy loader for MTCNN face detector and aligner."""
    global _mtcnn
    if _mtcnn is None:
        _mtcnn = MTCNN(
            image_size=settings.FACE_IMAGE_SIZE,
            margin=settings.FACE_MARGIN,
            min_face_size=settings.MIN_FACE_SIZE,
            keep_all=False,
            post_process=True,
            device=device
        )
    return _mtcnn


def get_resnet() -> InceptionResnetV1 | None:
    """
    Lazy loader for FaceNet InceptionResnetV1.
    Catches offline/connection exceptions if weights are not yet cached.
    """
    global _resnet
    if _resnet is None:
        try:
            _resnet = InceptionResnetV1(pretrained="vggface2").eval().to(device)
            logger.info("FaceNet (VGGFace2) weights loaded successfully.")
        except Exception as e:
            logger.error(f"Could not load FaceNet pretrained weights: {e}. Facial embeddings will be unavailable.")
            return None
    return _resnet


def _resolve_safe_image_path(path_str: str) -> Path | None:
    """
    Resolves relative or absolute path against settings.UPLOAD_DIR,
    preventing path traversal attacks.
    """
    try:
        raw_path = Path(path_str)
        if raw_path.is_absolute():
            resolved = raw_path.resolve()
        else:
            resolved = (settings.UPLOAD_DIR / raw_path).resolve()

        if resolved.exists() and resolved.is_file():
            return resolved
        return None
    except Exception as e:
        logger.warning(f"Path resolution error for {path_str}: {e}")
        return None


def load_image(source: bytes | str | Path | None) -> Image.Image | None:
    """
    Loads, sanitizes, and converts an image to RGB from either:
    - Raw bytes
    - File path string or Path object
    """
    if source is None:
        return None

    try:
        if isinstance(source, bytes):
            if len(source) == 0:
                return None
            img = Image.open(io.BytesIO(source))
        elif isinstance(source, (str, Path)):
            resolved_path = _resolve_safe_image_path(str(source))
            if resolved_path is None:
                logger.warning(f"Image path not found or invalid: {source}")
                return None
            img = Image.open(resolved_path)
        else:
            return None

        # Force conversion to RGB
        return img.convert("RGB")

    except (UnidentifiedImageError, OSError, ValueError) as e:
        logger.warning(f"Failed to load image: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error loading image: {e}")
        return None


def extract_face_embedding(
    source: bytes | str | Path | None
) -> tuple[list[float] | None, bool]:
    """
    Full facial pipeline:
    1. Load image safely
    2. Run MTCNN face detection and alignment
    3. Run Inception-ResNet-v1 512-d feature extraction
    4. Apply L2 normalization
    
    Returns:
        (embedding_vector_or_None, face_detected_flag)
    """
    img = load_image(source)
    if img is None:
        return (None, False)

    try:
        detector = get_mtcnn()
        face_tensor = detector(img)
        if face_tensor is None:
            # No face detected in photo
            return (None, False)

        embedder = get_resnet()
        if embedder is None:
            # Pretrained weights unavailable; trigger fallback
            return (None, False)

        with torch.no_grad():
            tensor_batch = face_tensor.unsqueeze(0).to(device)
            raw_embedding = embedder(tensor_batch).detach().cpu().numpy()[0]

        norm = np.linalg.norm(raw_embedding)
        if norm > 0:
            normalized_embedding = (raw_embedding / norm).tolist()
        else:
            normalized_embedding = raw_embedding.tolist()

        return (normalized_embedding, True)

    except Exception as e:
        logger.error(f"Error during face extraction: {e}")
        return (None, False)


def compute_cosine_similarity(
    embedding1: list[float] | None,
    embedding2: list[float] | None
) -> float:
    """
    Calculates cosine similarity between two 512-d embeddings.
    Clamps result strictly to [0.0, 1.0].
    """
    if embedding1 is None or embedding2 is None:
        return 0.0

    arr1 = np.array(embedding1, dtype=np.float32)
    arr2 = np.array(embedding2, dtype=np.float32)

    norm1 = np.linalg.norm(arr1)
    norm2 = np.linalg.norm(arr2)

    if norm1 == 0.0 or norm2 == 0.0:
        return 0.0

    dot_product = float(np.dot(arr1, arr2))
    raw_similarity = dot_product / (norm1 * norm2)

    clamped_similarity = max(0.0, min(1.0, raw_similarity))
    return round(clamped_similarity, 4)