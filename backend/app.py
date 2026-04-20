from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import logging
from supabase import create_client, Client
from datetime import datetime

# Cargar variables de entorno
load_dotenv()

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Conectar Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Crear app FastAPI
app = FastAPI(
    title="Cattleya Collection API",
    description="API para gestión de colección de orquídeas Cattleya",
    version="1.0.0"
)

# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://cattleya-collection.netlify.app",
    os.getenv("FRONTEND_URL", "http://localhost:3000")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ RUTAS ============

@app.get("/")
async def root():
    return {
        "name": "Cattleya Collection API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    try:
        result = supabase.table("cattleya_species").select("id").limit(1).execute()
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.error(f"Error conectando BD: {e}")
        return {"status": "error", "database": "disconnected"}, 500

@app.get("/api/species")
async def get_species(skip: int = 0, limit: int = 50):
    """Obtener todas las especies"""
    try:
        data = supabase.table("cattleya_species").select("*").range(skip, skip + limit - 1).execute()
        return {"data": data.data, "count": len(data.data)}
    except Exception as e:
        logger.error(f"Error obteniendo especies: {e}")
        return {"error": str(e)}, 500

@app.get("/api/species/search")
async def search_species(q: str = ""):
    """Buscar especies por nombre"""
    try:
        if not q:
            return {"results": [], "count": 0}
        
        data = supabase.table("cattleya_species").select("*").ilike("nombre_completo", f"%{q}%").limit(50).execute()
        
        return {"results": data.data, "count": len(data.data)}
    except Exception as e:
        logger.error(f"Error buscando: {e}")
        return {"error": str(e)}, 500

@app.get("/api/species/{species_id}")
async def get_species_by_id(species_id: int):
    """Obtener especie por ID"""
    try:
        data = supabase.table("cattleya_species").select("*").eq("id", species_id).single().execute()
        return {"data": data.data}
    except Exception as e:
        logger.error(f"Error obteniendo especie: {e}")
        return {"error": "Especie no encontrada"}, 404

@app.post("/api/collection/add")
async def add_to_collection(request: Request, species_id: int):
    """Agregar especie a colección"""
    try:
        user_ip = request.client.host
        
        supabase.table("user_collection").upsert(
            {
                "species_id": species_id,
                "user_ip": user_ip,
                "en_coleccion": True,
                "fecha_añadida": datetime.now().isoformat()
            }
        ).execute()
        
        return {"message": "Añadido a colección"}
    except Exception as e:
        logger.error(f"Error añadiendo a colección: {e}")
        return {"error": str(e)}, 500

@app.post("/api/collection/remove")
async def remove_from_collection(request: Request, species_id: int):
    """Remover especie de colección"""
    try:
        user_ip = request.client.host
        
        supabase.table("user_collection").delete().eq("species_id", species_id).eq("user_ip", user_ip).execute()
        
        return {"message": "Removido de colección"}
    except Exception as e:
        logger.error(f"Error removiendo: {e}")
        return {"error": str(e)}, 500

@app.get("/api/collection/my-collection")
async def get_my_collection(request: Request):
    """Obtener colección del usuario actual"""
    try:
        user_ip = request.client.host
        
        data = supabase.table("user_collection").select("species_id").eq("user_ip", user_ip).eq("en_coleccion", True).execute()
        
        species_ids = [item["species_id"] for item in data.data]
        
        if not species_ids:
            return {"count": 0, "species": []}
        
        species_data = supabase.table("cattleya_species").select("*").in_("id", species_ids).execute()
        
        return {"count": len(species_data.data), "species": species_data.data}
    except Exception as e:
        logger.error(f"Error obteniendo colección: {e}")
        return {"error": str(e)}, 500

# Iniciar servidor
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
