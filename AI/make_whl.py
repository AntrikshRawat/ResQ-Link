import os
import zipfile
import hashlib
import base64

record_lines = []
for root, dirs, files in os.walk('temp_whl'):
    for file in files:
        if file == 'RECORD':
            continue
        p = os.path.join(root, file)
        rel = os.path.relpath(p, 'temp_whl').replace('\\', '/')
        data = open(p, 'rb').read()
        digest = base64.urlsafe_b64encode(hashlib.sha256(data).digest()).decode().rstrip('=')
        record_lines.append(f"{rel},sha256={digest},{len(data)}")

record_lines.append("jellyfish-1.1.0.dist-info/RECORD,,")

with open('temp_whl/jellyfish-1.1.0.dist-info/RECORD', 'w', encoding='utf-8') as rec:
    rec.write("\n".join(record_lines) + "\n")

with zipfile.ZipFile('jellyfish-1.1.0-py3-none-any.whl', 'w') as z:
    for root, dirs, files in os.walk('temp_whl'):
        for file in files:
            p = os.path.join(root, file)
            arc = os.path.relpath(p, 'temp_whl')
            z.write(p, arc)

print("Wheel built with RECORD successfully.")
