import json
from pathlib import Path
from typing import Any
from app.schemas.match import ReportCandidateInput
from app.main import _execute_matching_pipeline

DATA_DIR = Path(__file__).resolve().parent
DATA_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = DATA_DIR / "synthetic_reports.json"

# 25 Paired Disaster Identity Profiles
SYNTHETIC_PAIRS: list[dict[str, Any]] = [
    # ── Category 1: High-Confidence Transliteration Matches (1 - 10) ──
    {
        "pair_id": 1,
        "description": "Indian Transliteration - Arun Kumar / Aroon Kumaar",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Arun",
            "lastName": "Kumar",
            "approximateAge": 28,
            "distinguishingMarks": "deep scar on left eyebrow",
            "clothingDescription": "blue polo shirt, dark jeans",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Aroon",
            "lastName": "Kumaar",
            "approximateAge": 30,
            "distinguishingMarks": "small scar near left eyebrow",
            "clothingDescription": "blue torn shirt",
            "photoPath": None
        }
    },
    {
        "pair_id": 2,
        "description": "Spelling Variant - Lakshmi Devi / Laxmi Davee",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Lakshmi",
            "lastName": "Devi",
            "approximateAge": 45,
            "distinguishingMarks": "mole on right collarbone",
            "clothingDescription": "red and gold saree",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Laxmi",
            "lastName": "Davee",
            "approximateAge": 46,
            "distinguishingMarks": "small black mole near collarbone",
            "clothingDescription": "red traditional dress",
            "photoPath": None
        }
    },
    {
        "pair_id": 3,
        "description": "Arabic/Persian Variant - Mohammed Rizwan / Mohamed Rezwan",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Mohammed",
            "lastName": "Rizwan",
            "approximateAge": 34,
            "distinguishingMarks": "surgical scar on right forearm",
            "clothingDescription": "grey hooded sweatshirt",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Mohamed",
            "lastName": "Rezwan",
            "approximateAge": 33,
            "distinguishingMarks": "surgical scar forearm",
            "clothingDescription": "grey torn hoodie",
            "photoPath": None
        }
    },
    {
        "pair_id": 4,
        "description": "Double Vowel Variant - Priyanka Sharma / Preeyanka Sharma",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Priyanka",
            "lastName": "Sharma",
            "approximateAge": 22,
            "distinguishingMarks": "star tattoo behind left ear",
            "clothingDescription": "yellow kurti, black leggings",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Preeyanka",
            "lastName": "Sharma",
            "approximateAge": 23,
            "distinguishingMarks": "tattoo behind left ear",
            "clothingDescription": "yellow top",
            "photoPath": None
        }
    },
    {
        "pair_id": 5,
        "description": "Bengali/Assamese Transliteration - Debabrata Mukherjee / Devabrata Mookerjee",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Debabrata",
            "lastName": "Mukherjee",
            "approximateAge": 52,
            "distinguishingMarks": "burn mark on left wrist",
            "clothingDescription": "white cotton kurta",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Devabrata",
            "lastName": "Mookerjee",
            "approximateAge": 50,
            "distinguishingMarks": "burn mark wrist",
            "clothingDescription": "white shirt",
            "photoPath": None
        }
    },
    {
        "pair_id": 6,
        "description": "Compound Surname Variant - Rajesh Choudhary / Rajeesh Chowdhury",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Rajesh",
            "lastName": "Choudhary",
            "approximateAge": 39,
            "distinguishingMarks": "missing tip of left index finger",
            "clothingDescription": "plaid flannel shirt",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Rajeesh",
            "lastName": "Chowdhury",
            "approximateAge": 40,
            "distinguishingMarks": "partial index finger amputation left hand",
            "clothingDescription": "checked shirt",
            "photoPath": None
        }
    },
    {
        "pair_id": 7,
        "description": "South Indian Transliteration - Venkatasubramanian / Venkat Subramaniam",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Venkatasubramanian",
            "lastName": "Iyer",
            "approximateAge": 61,
            "distinguishingMarks": "cardiac surgery chest scar",
            "clothingDescription": "grey vest, white dhoti",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Venkat",
            "lastName": "Subramaniam",
            "approximateAge": 60,
            "distinguishingMarks": "sternum surgical scar",
            "clothingDescription": "white dhoti",
            "photoPath": None
        }
    },
    {
        "pair_id": 8,
        "description": "Consonant Cluster Variant - Vikas Agarwal / Vikash Aggarwal",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Vikas",
            "lastName": "Agarwal",
            "approximateAge": 29,
            "distinguishingMarks": "small birthmark on right cheek",
            "clothingDescription": "green sports jersey",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Vikash",
            "lastName": "Aggarwal",
            "approximateAge": 29,
            "distinguishingMarks": "brown birthmark on cheek",
            "clothingDescription": "green jersey",
            "photoPath": None
        }
    },
    {
        "pair_id": 9,
        "description": "Spanish/Portuguese Variant - Sofia Hernandez / Sophia Hernandes",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Sofia",
            "lastName": "Hernandez",
            "approximateAge": 17,
            "distinguishingMarks": "small anchor tattoo on ankle",
            "clothingDescription": "denim jacket, white sneakers",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Sophia",
            "lastName": "Hernandes",
            "approximateAge": 17,
            "distinguishingMarks": "anchor tattoo ankle",
            "clothingDescription": "blue jacket",
            "photoPath": None
        }
    },
    {
        "pair_id": 10,
        "description": "Slavic Transliteration - Alexander Volkov / Aleksandr Volkoff",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Alexander",
            "lastName": "Volkov",
            "approximateAge": 41,
            "distinguishingMarks": "cleft chin, scar over nose",
            "clothingDescription": "black winter jacket",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Aleksandr",
            "lastName": "Volkoff",
            "approximateAge": 42,
            "distinguishingMarks": "facial scar bridge of nose",
            "clothingDescription": "black coat",
            "photoPath": None
        }
    },

    # ── Category 2: No-Face Fallback Robustness (11 - 15) ──
    {
        "pair_id": 11,
        "description": "Fallback Match - Gurpreet Singh / Gurprit Sing (No Photos Available)",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Gurpreet",
            "lastName": "Singh",
            "approximateAge": 31,
            "distinguishingMarks": "lion tattoo right bicep",
            "clothingDescription": "orange turban, white kurta",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Gurprit",
            "lastName": "Sing",
            "approximateAge": 30,
            "distinguishingMarks": "lion tattoo on arm",
            "clothingDescription": "orange turban",
            "photoPath": None
        }
    },
    {
        "pair_id": 12,
        "description": "Fallback Match - Ananya Sen / Anannya Shen (Missing Photos)",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Ananya",
            "lastName": "Sen",
            "approximateAge": 19,
            "distinguishingMarks": "pierced nose, birthmark on neck",
            "clothingDescription": "purple cardigan",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Anannya",
            "lastName": "Shen",
            "approximateAge": 20,
            "distinguishingMarks": "piercing nose, mark on neck",
            "clothingDescription": "purple sweater",
            "photoPath": None
        }
    },
    {
        "pair_id": 13,
        "description": "Fallback Match - Deepak Joshi / Deepuck Joshy (Trauma Intake)",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Deepak",
            "lastName": "Joshi",
            "approximateAge": 37,
            "distinguishingMarks": "mole under right eye",
            "clothingDescription": "blue track jacket",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Deepuck",
            "lastName": "Joshy",
            "approximateAge": 38,
            "distinguishingMarks": "small dark mole near right eye",
            "clothingDescription": "blue sportswear",
            "photoPath": None
        }
    },
    {
        "pair_id": 14,
        "description": "Fallback Match - Fatima Zahra / Fatimah Al-Zahra",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Fatima",
            "lastName": "Zahra",
            "approximateAge": 26,
            "distinguishingMarks": "freckles across nose and cheeks",
            "clothingDescription": "green abaya",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Fatimah",
            "lastName": "Al-Zahra",
            "approximateAge": 25,
            "distinguishingMarks": "freckles on face",
            "clothingDescription": "dark green gown",
            "photoPath": None
        }
    },
    {
        "pair_id": 15,
        "description": "Fallback Match - Harish Chandra / Hareesh Chander",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Harish",
            "lastName": "Chandra",
            "approximateAge": 55,
            "distinguishingMarks": "silver ring on left thumb",
            "clothingDescription": "beige safari suit",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Hareesh",
            "lastName": "Chander",
            "approximateAge": 56,
            "distinguishingMarks": "thumb ring left hand",
            "clothingDescription": "beige formal jacket",
            "photoPath": None
        }
    },

    # ── Category 3: Deliberate Hard Negatives (16 - 20) ──
    {
        "pair_id": 16,
        "description": "Hard Negative - Completely Disjoint Demographics and Names",
        "expected_eligible": False,
        "reportA": {
            "firstName": "Rajendra",
            "lastName": "Prasad",
            "approximateAge": 68,
            "distinguishingMarks": "bald with white mustache",
            "clothingDescription": "khadi vest",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Kavita",
            "lastName": "Reddy",
            "approximateAge": 19,
            "distinguishingMarks": "butterfly tattoo on wrist",
            "clothingDescription": "pink t-shirt",
            "photoPath": None
        }
    },
    {
        "pair_id": 17,
        "description": "Hard Negative - Same Common Surname, Totally Different First Names",
        "expected_eligible": False,
        "reportA": {
            "firstName": "Amit",
            "lastName": "Sharma",
            "approximateAge": 30,
            "distinguishingMarks": "scar on chin",
            "clothingDescription": "black polo",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Suresh",
            "lastName": "Sharma",
            "approximateAge": 58,
            "distinguishingMarks": "tattoo on chest",
            "clothingDescription": "white t-shirt",
            "photoPath": None
        }
    },
    {
        "pair_id": 18,
        "description": "Hard Negative - Different People With Completely Opposite Ages",
        "expected_eligible": False,
        "reportA": {
            "firstName": "Rohan",
            "lastName": "Mehta",
            "approximateAge": 14,
            "distinguishingMarks": "braces on teeth",
            "clothingDescription": "school uniform",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Ramesh",
            "lastName": "Mistry",
            "approximateAge": 72,
            "distinguishingMarks": "walking cane, spectacles",
            "clothingDescription": "brown sweater",
            "photoPath": None
        }
    },
    {
        "pair_id": 19,
        "description": "Hard Negative - Similar Sounds but Entirely Different Families",
        "expected_eligible": False,
        "reportA": {
            "firstName": "David",
            "lastName": "Miller",
            "approximateAge": 44,
            "distinguishingMarks": "cross tattoo neck",
            "clothingDescription": "grey thermal",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Daniel",
            "lastName": "Milner",
            "approximateAge": 21,
            "distinguishingMarks": "no apparent marks",
            "clothingDescription": "red football jersey",
            "photoPath": None
        }
    },
    {
        "pair_id": 20,
        "description": "Hard Negative - Coarse Trigram Collision with False Corroboration",
        "expected_eligible": False,
        "reportA": {
            "firstName": "Kiran",
            "lastName": "Bedi",
            "approximateAge": 48,
            "distinguishingMarks": "mole on forehead",
            "clothingDescription": "blue salwar",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Karan",
            "lastName": "Bir",
            "approximateAge": 16,
            "distinguishingMarks": "scar on knee",
            "clothingDescription": "grey shorts",
            "photoPath": None
        }
    },

    # ── Category 4: Borderline / Boundary Cases (21 - 25) ──
    {
        "pair_id": 21,
        "description": "Borderline - Name matches, but Age Difference is exactly 9 Years",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Manish",
            "lastName": "Tiwari",
            "approximateAge": 25,
            "distinguishingMarks": "small scar on cheek",
            "clothingDescription": "navy t-shirt",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Maneesh",
            "lastName": "Tiwary",
            "approximateAge": 34,
            "distinguishingMarks": "scar cheek",
            "clothingDescription": "blue shirt",
            "photoPath": None
        }
    },
    {
        "pair_id": 22,
        "description": "Boundary Case - Age difference exceeds 10 years (delta penalty maxed)",
        "expected_eligible": False,
        "reportA": {
            "firstName": "Sunita",
            "lastName": "Rao",
            "approximateAge": 20,
            "distinguishingMarks": "none",
            "clothingDescription": "green dress",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Suneeta",
            "lastName": "Rao",
            "approximateAge": 38,
            "distinguishingMarks": "none",
            "clothingDescription": "green dress",
            "photoPath": None
        }
    },
    {
        "pair_id": 23,
        "description": "Missing Demographic Case - Both Ages Unknown",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Ashok",
            "lastName": "Verma",
            "approximateAge": None,
            "distinguishingMarks": "tribal tattoo right forearm",
            "clothingDescription": "black jacket",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Ashoke",
            "lastName": "Varma",
            "approximateAge": None,
            "distinguishingMarks": "tattoo on forearm",
            "clothingDescription": "dark jacket",
            "photoPath": None
        }
    },
    {
        "pair_id": 24,
        "description": "Partial Mark Match with Minor Phonetic Variance",
        "expected_eligible": True,
        "reportA": {
            "firstName": "Siddharth",
            "lastName": "Malhotra",
            "approximateAge": 31,
            "distinguishingMarks": "burn scar right forearm near elbow",
            "clothingDescription": "checked blue shirt",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Sidharth",
            "lastName": "Mehrotra",
            "approximateAge": 32,
            "distinguishingMarks": "burn scar on arm",
            "clothingDescription": "blue shirt",
            "photoPath": None
        }
    },
    {
        "pair_id": 25,
        "description": "Borderline Gate - Very Weak Mark Match, Moderate Phonetics",
        "expected_eligible": False,
        "reportA": {
            "firstName": "Vijay",
            "lastName": "Shekhar",
            "approximateAge": 42,
            "distinguishingMarks": "mole left cheek",
            "clothingDescription": "brown coat",
            "photoPath": None
        },
        "reportB": {
            "firstName": "Vicky",
            "lastName": "Thakur",
            "approximateAge": 40,
            "distinguishingMarks": "scar right shoulder",
            "clothingDescription": "brown sweater",
            "photoPath": None
        }
    }
]


def export_synthetic_dataset():
    """Exports structured profiles to synthetic_reports.json."""
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(SYNTHETIC_PAIRS, f, indent=2)
    print(f"Exported {len(SYNTHETIC_PAIRS)} synthetic candidate pairs to: {OUTPUT_FILE}")


def run_evaluation_benchmark():
    """Runs all 25 candidate pairs through the matching pipeline and prints results."""
    print("\n" + "=" * 95)
    print(f"{'ID':<3} | {'Description':<38} | {'Composite':<9} | {'Review?':<7} | {'Expected':<8} | {'Status'}")
    print("=" * 95)

    passed_classifications = 0

    for pair in SYNTHETIC_PAIRS:
        rep_a = ReportCandidateInput(**pair["reportA"])
        rep_b = ReportCandidateInput(**pair["reportB"])

        result = _execute_matching_pipeline(
            rep_a=rep_a,
            rep_b=rep_b,
            image_a_source=pair["reportA"]["photoPath"],
            image_b_source=pair["reportB"]["photoPath"]
        )

        is_eligible = result.isEligibleForReview
        expected = pair["expected_eligible"]
        status_flag = "PASS" if is_eligible == expected else "MISMATCH"

        if status_flag == "PASS":
            passed_classifications += 1

        print(
            f"{pair['pair_id']:<3} | "
            f"{pair['description'][:38]:<38} | "
            f"{result.compositeScore:<9.4f} | "
            f"{str(is_eligible):<7} | "
            f"{str(expected):<8} | "
            f"{status_flag}"
        )

    print("=" * 95)
    print(f"Benchmark Complete: {passed_classifications}/{len(SYNTHETIC_PAIRS)} pairs matched expected eligibility.")
    print("=" * 95 + "\n")


if __name__ == "__main__":
    export_synthetic_dataset()
    run_evaluation_benchmark()