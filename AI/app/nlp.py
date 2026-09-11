import jellyfish

def get_double_metaphone(name: str) -> tuple[str, str]:
    if not name or not name.strip():
        return ("", "")
    code = jellyfish.metaphone(name.strip())
    return (code, code)

def compute_phonetic_score(name1: str, name2: str) -> float:
    if not name1 or not name2:
        return 0.0

    n1, n2 = name1.lower().strip(), name2.lower().strip()

    # 1. Jaro-Winkler similarity
    jw_score = jellyfish.jaro_winkler_similarity(n1, n2)

    # 2. Metaphone code match check
    m1_primary, m1_sec = get_double_metaphone(n1)
    m2_primary, m2_sec = get_double_metaphone(n2)

    metaphone_match = (
        (m1_primary and m1_primary == m2_primary) or
        (m1_sec and m1_sec == m2_primary) or
        (m1_primary and m1_primary == m2_sec)
    )

    if metaphone_match:
        final_score = max(jw_score, 0.85)
    else:
        final_score = jw_score

    return float(final_score)

def compute_demographic_score(age1: int | None, age2: int | None) -> float:
    if age1 is None or age2 is None:
        return 0.5
    delta = abs(age1 - age2)
    return float(max(0.0, 1.0 - (delta / 10.0)))