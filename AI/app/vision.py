import io
import os
import torch
import kagglehub
import numpy as np
from PIL import Image
from facenet_pytorch import MTCNN, InceptionResnetV1

device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

mtcnn = MTCNN(
    image_size = 160 , margin = 20 , min_face_size = 20 , keep_all = False , device = device
)

resnet = InceptionResnetV1(pretrained = 'vggface2').eval().to(device)

def load_kaggle_lfw_dataset() :
    path = kagglehub.dataset_download("jessicali9530/lfw-dataset")

    return path

def process_image(image_bytes):
    try :
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        face_tensor = mtcnn(img)
        return face_tensor
    except Exception as e:
        print(f"Error processing image: {e}")
        return None

def process_image_file(image_path):
    if not os.path.exists(image_path):
        return None
    try :
        img = Image.open(image_path).convert('RGB')
        face_tensor = mtcnn(img)
        return face_tensor
    except Exception as e:
        print(f"Error processing image file: {e}")
        return None

def extract_face_embedding(face_tensor):
    with torch.no_grad():
        face_tensor = face_tensor.unsqueeze(0).to(device)

        embeddings = resnet(face_tensor).detach().cpu().numpy()[0]

        norm = np.linalg.norm(embeddings)
        if norm >0:
            embeddings = embeddings / norm
        return embeddings.tolist()

def compute_cosine_similarity(embedding1 , embedding2):
    embedding1 = np.array(embedding1)
    embedding2 = np.array(embedding2)

    dot_product = np.dot(embedding1 , embedding2)
    norm1 = np.linalg.norm(embedding1)
    norm2 = np.linalg.norm(embedding2)

    if norm1 == 0 or norm2 == 0:
        return 0.0

    similarity = dot_product / (norm1 * norm2)
    return similarity
