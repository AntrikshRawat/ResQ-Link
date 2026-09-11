from fastapi import FastAPI , UploadFile , File , Form , HTTPException
from app.matcher import evaluate_match_pair

app = FastAPI(title="ResQ-Link AI Sidecar", version="1.0.0")

@app.get("/health")
async def health_check():
    return {"status": "healthy" , "service" : "ResQ-Link AI Sidecar"}

@app.post("/api/v1/evaluate-match")
async def evaluate_match(
    image1: UploadFile = File(None),
    image2: UploadFile = File(None),
    name1: str = Form(...),
    name2: str = Form(...),
    age1: int = Form(None),
    age2: int = Form(None)
):
   try :
       image1_bytes = await image1.read() if image1 else None
       image2_bytes = await image2.read() if image2 else None

       result = evaluate_match_pair(
          image1_bytes , image2_bytes , name1 , name2 , age1 , age2 
       )
       return result

   except Exception as e:
       raise HTTPException(status_code=500 , detail=str(e))
       