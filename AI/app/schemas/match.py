from typing import Any
from pydantic import BaseModel, Field

class ReportCandidateInput(BaseModel):
    id: str | None = Field(default = None, description = "UUID of the report record")
    firstName: str = Field(..., min_length = 1, description = "First name of the individual")
    lastName: str | None = Field(default = None, description = "Last name of the individual")
    approximateAge: int | None = Field(default = None, ge = 0, le = 130, description = "Estimated age")
    distinguishingMarks: str | None = Field(default = None, description = "Scars, birthmarks, tattoos")
    clothingDescription: str | None = Field(default = None, description = "Clothing worn at intake")
    photoPath: str | None = Field(default = None, description = "Relative path or filename in uploads directory")
    
class EvaluateMatchRequest(BaseModel):
    reportA: ReportCandidateInput
    reportB: ReportCandidateInput
    
class DiscrepancySummary(BaseModel):
    ageDelta: int | None
    marksOverlap: list[str]
    nameDiscrepancy: str
    phoneticKeysA: list[str]
    phoneticKeysB: list[str]
    faceDetectedA: bool
    faceDetectedB: bool
    isDegradedTextOnly: bool
    reviewThreshold: float
    
class EvaluateMatchResponse(BaseModel):
    compositeScore: float = Field(..., ge = 0.0, le = 1.0)
    faceSimilarity: float = Field(..., ge = 0.0, le = 1.0)
    phoneticSimilarity: float = Field(..., ge = 0.0, le = 1.0)
    demographicScore: float = Field(..., ge = 0.0, le = 1.0)
    marksScore: float = Field(..., ge = 0.0, le = 1.0)
    isEligibleForReview: bool
    isDegradedTextOnly: bool
    faceDetectedA: bool
    faceDetectedB: bool
    phoneticKeysA: list[str]
    phoneticKeysB: list[str]
    ageDelta: int | None
    discrepancies: dict[str, Any]