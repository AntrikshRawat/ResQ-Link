"""Pure-Python Double Metaphone implementation.
Derived from Lawrence Philips' original C++ algorithm.
Returns (primary_code, secondary_code) for resilient transliteration matching.
"""

def double_metaphone(name: str) -> tuple[str, str]:
    if not name:
        return ("", "")
    
    cleaned = "".join([c for c in name.upper() if c.isalpha()])
    length = len(cleaned)
    if length == 0:
        return ("", "")
    
    primary: list[str] = []
    secondary: list[str] = []
    current = 0
    
    if length >= 2 and cleaned[0:2] in ("GN", "KN", "PN", "WR", "PS"):
        current += 1
        
    if length > 0 and cleaned[0] == 'X':
        primary.append('S')
        secondary.append('S')
        current += 1
        
    while current < length and (len(primary) < 4 or len(secondary) < 4):
        ch = cleaned[current]
        
        if ch in ("A", "E", "I", "O", "U", "Y"):
            if current == 0:
                primary.append("A")
                secondary.append("A")
            current += 1
            continue
        
        if ch == "B":
            primary.append("P")
            secondary.append("P")
            if current + 1 < length and cleaned[current + 1] == 'B':
                current += 2
            else:
                current += 1
            continue
        
        if ch == "C":
            if current + 1 < length and cleaned[current + 1] == "H":
                primary.append("X")
                secondary.append("K")
                current += 2
            elif current + 1 < length and cleaned[current + 1] in ("I", "E", "Y"):
                primary.append("S")
                secondary.append("S")
                current += 2
            else:
                primary.append("K")
                secondary.append("K")
                if current + 1 < length and cleaned[current + 1] in ("C", "K", "Q"):
                    current += 2
                else:
                    current += 1
            continue
        
        if ch == "D":
            if current + 1 < length and cleaned[current + 1] == "G":
                if current + 2 < length and cleaned[current + 2] in ("I", "E", "Y"):
                    primary.append("J")
                    secondary.append("J")
                    current += 3
                    continue
                
            primary.append("T")
            secondary.append("T")
            if current + 1 < length and cleaned[current + 1] == "D":
                current += 2
            else:
                current += 1
            continue
        
        if ch == "G":
            if current + 1 < length and cleaned[current + 1] == "H":
                primary.append("K")
                secondary.append("K")
                current += 2
            elif current + 1 < length and cleaned[current + 1] in ("I", "E", "Y"):
                primary.append("J")
                secondary.append("K")
                current += 2
            else:
                primary.append("K")
                secondary.append("K")
                if current + 1 < length and cleaned[current + 1] == "G":
                    current += 2
                else:
                    current += 1
            continue
        
        if ch == "H":
            if (current == 0 or cleaned[current - 1] not in ("A", "E", "I", "O", "U", "Y")) and (current + 1 < length and cleaned[current + 1] in ("A", "E", "I", "O", "U", "Y")):
                primary.append("H")
                secondary.append("H")
            current += 1
            continue
        
        if ch in ("J", "K"):
            primary.append("K" if ch == "K" else "J")
            secondary.append("K" if ch == "K" else "J")
            current += 2 if (current + 1 < length and cleaned[current + 1] == ch) else 1
            continue
        
        if ch == "L":
            primary.append("L")
            secondary.append("L")
            current += 2 if (current + 1 < length and cleaned[current + 1] == "L") else 1
            continue
        
        if ch == "M":
            primary.append("M")
            secondary.append("M")
            current += 2 if (current + 1 < length and cleaned[current + 1] == "M") else 1
            continue
        
        if ch == "N":
            primary.append("N")
            secondary.append("N")
            current += 2 if (current + 1 < length and cleaned[current + 1] == "N") else 1
            continue
        
        if ch == "P":
            if current + 1 < length and cleaned[current + 1] == "H":
                primary.append("F")
                secondary.append("F")
                current += 2
            else:
                primary.append("P")
                secondary.append("P")
                current +=2 if (current + 1 < length and cleaned[current + 1] == "P") else 1
                
            continue
        
        if ch == "Q":
            primary.append("K")
            secondary.append("K")
            current += 2 if (current + 1 < length and cleaned[current + 1] == "Q") else 1
            continue
        
        if ch == "R":
            primary.append("R")
            secondary.append("R")
            current += 2 if (current + 1 < length and cleaned[current + 1] == "R") else 1
            continue
        
        if ch == "S":
            if current + 1 < length and cleaned[current + 1] == "H":
                primary.append("X")
                secondary.append("X")
                current += 2
            else:
                primary.append("S")
                secondary.append("S")
                current += 2 if (current + 1 < length and cleaned[current + 1] == "S") else 1
            continue
        
        if ch == "T":
            if current + 1 < length and cleaned[current + 1] == "H":
                primary.append("0")
                secondary.append("T")
                current += 2
            else:
                primary.append("T")
                secondary.append("T")
                current += 2 if (current + 1 < length and cleaned[current + 1] == "T") else 1
            continue
        
        if ch == "V":
            primary.append("F")
            secondary.append("F")
            current += 2 if (current + 1 < length and cleaned[current + 1] == "V") else 1
            continue
        
        if ch == "W":
            if current + 1 < length and cleaned[current + 1] in ("A", "E", "I", "O", "U", "Y"):
                primary.append("A")
                secondary.append("F")
            current += 1
            continue
        
        if ch == "Z":
            primary.append("S")
            secondary.append("S")
            current += 2 if (current + 1 < length and cleaned[current + 1] == "Z") else 1
            continue
        
    p_code = "".join(primary)[:4]
    s_code = "".join(secondary)[:4]
    return (p_code, s_code)