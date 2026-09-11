from app.vision import process_image_file, extract_face_embedding, compute_cosine_similarity
from app.nlp import compute_phonetic_score, compute_demographic_score

def evaluate_match_pair(image1 , image2 , name1 , name2 , age1 , age2):

    # Image Processing and facial embeddding cosine similarity

    face_tensor1 = process_image_file(image1) if image1 else None
    face_tensor2 = process_image_file(image2) if image2 else None

    face_similarity = 0.0
    has_face = False

    if face_tensor1 is not None and face_tensor2 is not None:
        embedding1 = extract_face_embedding(face_tensor1)
        embedding2 = extract_face_embedding(face_tensor2)
        face_similarity = compute_cosine_similarity(embedding1 , embedding2)
        has_face = True

    # Name Processing and phonetic score
    phonetic_sim = compute_phonetic_score(name1 , name2) if name1 and name2 else 0.0
    demographic_sim = compute_demographic_score(age1 , age2) if age1 is not None and age2 is not None else 0.5

    if has_face :
        composite =(0.5 * face_similarity) + (0.35 * phonetic_sim) + (0.15 * demographic_sim)
    else :
        composite =(0.70 * phonetic_sim) + (0.30 * demographic_sim)

    return {
        "composite_score": round(composite, 4),
        "face_similarity": round(face_similarity, 4) if has_face else None,
        "phonetic_similarity": round(phonetic_sim, 4),
        "demographic_similarity": round(demographic_sim, 4),
        "has_face": has_face
    }

