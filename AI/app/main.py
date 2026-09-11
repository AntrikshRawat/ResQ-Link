import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.schemas.match import (
    EvaluateMatchRequest,
    EvaluateMatchResponse,
    ReportCandidateInput
)
from app.services.face_service import (
    extract_face_embedding,
    compute_cosine_similarity,
    get_mtcnn,
    get_resnet
)
from app.services.phonetic_service import compute_phonetic_similarity
from app.services.demographic_service import compute_demographic_similarity
from app.services.marks_service import compute_marks_similarity
from app.services.scoring_service import calculate_composite_score

logger = logging.getLogger("resqlink_ai")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} v{settings.VERSION}")
    logger.info(f"Upload directory resolved to: {settings.UPLOAD_DIR}")
    try:
        get_mtcnn()
        get_resnet()
        logger.info("Face models (MTCNN & FaceNet) loaded and ready.")
    except Exception as e:
        logger.warning(f"Could not pre-warm face models: {e}")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "device": settings.DEVICE,
        "reviewThreshold": settings.REVIEW_THRESHOLD
    }


def _execute_matching_pipeline(
    rep_a: ReportCandidateInput,
    rep_b: ReportCandidateInput,
    image_a_source: bytes | str | None,
    image_b_source: bytes | str | None
) -> EvaluateMatchResponse:
    """Core multimodal matching execution pipeline."""
    # 1. Visual Facial Evaluation (Inception-ResNet-v1 + MTCNN)
    emb_a, face_detected_a = extract_face_embedding(image_a_source)
    emb_b, face_detected_b = extract_face_embedding(image_b_source)

    if face_detected_a and face_detected_b:
        face_sim = compute_cosine_similarity(emb_a, emb_b)
    else:
        face_sim = 0.0

    # 2. Text / Double Metaphone + Jaro-Winkler Phonetic Evaluation
    full_name_a = f"{rep_a.firstName} {rep_a.lastName or ''}".strip()
    full_name_b = f"{rep_b.firstName} {rep_b.lastName or ''}".strip()
    phonetic_score, keys_a, keys_b = compute_phonetic_similarity(full_name_a, full_name_b)

    # 3. Demographic Age Heuristic Evaluation
    demographic_score, age_delta = compute_demographic_similarity(
        rep_a.approximateAge,
        rep_b.approximateAge
    )

    # 4. Distinguishing Physical Marks Evaluation (Jaccard Overlap)
    marks_score, marks_overlap = compute_marks_similarity(
        rep_a.distinguishingMarks,
        rep_b.distinguishingMarks
    )

    # 5. Composite Scoring & Dynamic Fallback Reweighting
    breakdown = calculate_composite_score(
        face_similarity=face_sim,
        face_detected_a=face_detected_a,
        face_detected_b=face_detected_b,
        phonetic_similarity=phonetic_score,
        demographic_score=demographic_score,
        marks_score=marks_score,
        age_delta=age_delta,
        marks_overlap=marks_overlap,
        phonetic_keys_a=keys_a,
        phonetic_keys_b=keys_b,
        name_a=full_name_a,
        name_b=full_name_b
    )

    return EvaluateMatchResponse(
        compositeScore=breakdown.composite_score,
        faceSimilarity=breakdown.face_similarity,
        phoneticSimilarity=breakdown.phonetic_similarity,
        demographicScore=breakdown.demographic_score,
        marksScore=breakdown.marks_score,
        isEligibleForReview=breakdown.is_eligible_for_review,
        isDegradedTextOnly=breakdown.is_degraded_text_only,
        faceDetectedA=face_detected_a,
        faceDetectedB=face_detected_b,
        phoneticKeysA=keys_a,
        phoneticKeysB=keys_b,
        ageDelta=age_delta,
        discrepancies=breakdown.discrepancy_summary
    )


@app.post("/api/v1/evaluate-match", response_model=EvaluateMatchResponse, status_code=status.HTTP_200_OK)
async def evaluate_match_json(payload: EvaluateMatchRequest):
    """Primary JSON endpoint invoked by Node.js/Express backend."""
    try:
        return _execute_matching_pipeline(
            rep_a=payload.reportA,
            rep_b=payload.reportB,
            image_a_source=payload.reportA.photoPath,
            image_b_source=payload.reportB.photoPath
        )
    except Exception as e:
        logger.error(f"Error during match evaluation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evaluation failed: {str(e)}"
        )


@app.post("/api/v1/evaluate-match/multipart", response_model=EvaluateMatchResponse, status_code=status.HTTP_200_OK)
async def evaluate_match_multipart(
    firstNameA: str = Form(...),
    lastNameA: str = Form(None),
    ageA: int = Form(None),
    marksA: str = Form(None),
    imageA: UploadFile = File(None),
    firstNameB: str = Form(...),
    lastNameB: str = Form(None),
    ageB: int = Form(None),
    marksB: str = Form(None),
    imageB: UploadFile = File(None)
):
    """Multipart fallback endpoint for Swagger testing with direct file uploads."""
    try:
        bytes_a = await imageA.read() if imageA else None
        bytes_b = await imageB.read() if imageB else None

        rep_a = ReportCandidateInput(
            firstName=firstNameA,
            lastName=lastNameA,
            approximateAge=ageA,
            distinguishingMarks=marksA
        )
        rep_b = ReportCandidateInput(
            firstName=firstNameB,
            lastName=lastNameB,
            approximateAge=ageB,
            distinguishingMarks=marksB
        )

        return _execute_matching_pipeline(
            rep_a=rep_a,
            rep_b=rep_b,
            image_a_source=bytes_a,
            image_b_source=bytes_b
        )
    except Exception as e:
        logger.error(f"Error in multipart match evaluation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Multipart evaluation failed: {str(e)}"
        )