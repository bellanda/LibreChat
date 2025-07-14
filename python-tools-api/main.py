# main.py
import datetime
import os

import dotenv
from app.converter import Converter
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pymongo import MongoClient

# Debug flag
# DEBUG = os.environ.get("DEBUG_CONSOLE_MARKDOWN_HTML_PDF_API") == "true"
DEBUG = True

app = FastAPI(title="Markdown to PDF/HTML Converter")
converter = Converter()


# Adicionar CORS para permitir o frontend acessar a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou ["*"] para liberar geral
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("[DEBUG] ATIVOU")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    print("[DEBUG] Health check endpoint")
    return {"status": "healthy", "service": "python-tools-api"}


@app.post("/convert/md-to-pdf", response_class=StreamingResponse)
async def convert_md_to_pdf(file: UploadFile = File(...)):
    """
    Upload a Markdown file and receive a PDF.
    """

    if DEBUG:
        print(f"[DEBUG] convert_pdf called with filename: {file.filename}")
    if not file.filename.lower().endswith((".md", ".markdown")):
        if DEBUG:
            print(f"[DEBUG] Invalid file type for PDF: {file.filename}")
        raise HTTPException(status_code=400, detail="Invalid file type. Use .md or .markdown files.")
    data = await file.read()
    if DEBUG:
        print(f"[DEBUG] Read {len(data)} bytes from uploaded file for PDF")
    try:
        pdf_bytes = await converter.to_pdf_bytes(data)
    except Exception as e:
        if DEBUG:
            print(f"[DEBUG] PDF conversion error: {e}")
        raise HTTPException(status_code=500, detail=f"PDF conversion failed: {e}")
    if DEBUG:
        print(f"[DEBUG] Returning PDF of size {len(pdf_bytes)} bytes")

    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{file.filename.rsplit(".", 1)[0]}.pdf"'},
    )


@app.post("/convert/md-to-html", response_class=StreamingResponse)
async def convert_md_to_html(file: UploadFile = File(...)):
    """
    Upload a Markdown file and receive an HTML.
    """
    if DEBUG:
        print(f"[DEBUG] convert_html called with filename: {file.filename}")
    if not file.filename.lower().endswith((".md", ".markdown")):
        if DEBUG:
            print(f"[DEBUG] Invalid file type for HTML: {file.filename}")
        raise HTTPException(status_code=400, detail="Invalid file type. Use .md or .markdown files.")
    data = await file.read()
    if DEBUG:
        print(f"[DEBUG] Read {len(data)} bytes from uploaded file for HTML")
    try:
        html_bytes = await converter.to_html_bytes(data)
    except Exception as e:
        if DEBUG:
            print(f"[DEBUG] HTML conversion error: {e}")
        raise HTTPException(status_code=500, detail=f"HTML conversion failed: {e}")
    if DEBUG:
        print(f"[DEBUG] Returning HTML of size {len(html_bytes)} bytes")

    return StreamingResponse(
        iter([html_bytes]),
        media_type="text/html",
        headers={"Content-Disposition": f'attachment; filename="{file.filename.rsplit(".", 1)[0]}.html"'},
    )


# -------------------------------------------------------------------------
# AUXILIAR IMPORTS AND FUNCTIONS


# MONGO CONNECTION
dotenv.load_dotenv(override=True)
SERVER_MONGO_URI = os.getenv("MONGO_URI_SERVER")
client = MongoClient(SERVER_MONGO_URI)

DEBUG_REPORTS = False


# GET USER DATA
def get_user_data(search_term, search_by="name"):
    if DEBUG_REPORTS:
        if client:
            print("[DEBUG] CLIENTE CONECTADO")
        else:
            print("[DEBUG] CLIENTE NÃO CONECTADO")

    if search_by == "name":
        user = client.LibreChat.users.find_one({"name": search_term})
    else:
        user = client.LibreChat.users.find_one({"username": search_term})
    if not user:
        return "Usuário não encontrado"
    return user


# -------------------------------------------------------------------------
# REPORTS ROUTES

# 🔧 CORREÇÃO IMPORTANTE DE CONTAGEM DE MENSAGENS:
#
# Cada conversa gera 2 transações na collection transactions:
# - tokenType: "prompt" = mensagem do usuário
# - tokenType: "completion" = resposta da IA
#
# ANTES DA CORREÇÃO:
# - get_usage_cost: ✅ CORRETO (já separava prompt/completion)
# - get_top_users_volume: ❌ ERRADO (contava prompt + completion = dobrava)
# - get_top_users_cost: ❌ ERRADO (contava prompt + completion = dobrava)
# - get_top_models: ❌ ERRADO (contava prompt + completion = dobrava)
# - get_user_efficiency: ❌ ERRADO (contava prompt + completion = dobrava)
#
# APÓS A CORREÇÃO:
# Todas as funções agora filtram por tokenType: 'prompt' para contar apenas
# mensagens reais de usuário, representando conversas verdadeiras.


# USAGE COST REPORT
# RETURNS: [{ date: '05/07', 'IA msgs': 100, 'IA custo': 12.50, 'USER msgs': 95, 'USER custo': 8.75 }]
@app.get("/reports/usage-cost")
async def get_usage_cost(
    user: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    models: str | None = None,
    search_by: str = "username",
):
    """
    Get usage cost report separated by token type.
    Returns data grouped by date with cost and CONVERSATION count (not individual transactions).
    Now counts unique conversations by conversationId, so USER msgs should match IA msgs closely.
    """
    pipeline = []
    match = {}
    # print("BATEU NA API")
    print(f"[DEBUG] user: {user}")
    print(f"[DEBUG] start_date: {start_date}")
    print(f"[DEBUG] end_date: {end_date}")
    print(f"[DEBUG] search_by: {search_by}")

    # Filtro por usuário
    if user:
        user_data = get_user_data(user, search_by)
        if not user_data or isinstance(user_data, str):
            print("Usuário não encontrado")
            return []
        match["user"] = user_data["_id"]
        user_name = user_data["username"]
        if DEBUG_REPORTS:
            print(f"[DEBUG] Filtrando por usuário: {user_name}")
    else:
        user_name = "Todos"

    # Filtro por período
    if start_date or end_date:
        match["createdAt"] = {}
        if start_date:
            match["createdAt"]["$gte"] = datetime.datetime.strptime(start_date, "%Y-%m-%d")
        if end_date:
            # Adiciona 23:59:59 para incluir todo o dia
            end_datetime = datetime.datetime.strptime(end_date, "%Y-%m-%d")
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
            match["createdAt"]["$lte"] = end_datetime
        # Remove o filtro se não foi preenchido corretamente
        if not match["createdAt"]:
            del match["createdAt"]
    else:
        # Se não especificar período, pega últimos 30 dias
        match["createdAt"] = {}
        match["createdAt"]["$gte"] = datetime.datetime.now() - datetime.timedelta(days=30)
        match["createdAt"]["$lte"] = datetime.datetime.now()

    # Filtro por modelos
    if models:
        try:
            models_list = [m.strip() for m in models.split(",") if m.strip()]
            if models_list:
                match["model"] = {"$in": models_list}
                if DEBUG_REPORTS:
                    print(f"[DEBUG] Filtro por modelos: {models_list}")
        except Exception as e:
            if DEBUG_REPORTS:
                print(f"[DEBUG] Erro ao processar filtro de modelos: {e}")

    if DEBUG_REPORTS:
        print(f"[DEBUG] Match filter: {match}")

    if match:
        pipeline.append({"$match": match})

    # Agrupa por data, tokenType e conversationId para contar conversas reais
    pipeline.extend(
        [
            {"$addFields": {"dateOnly": {"$dateToString": {"format": "%d/%m", "date": "$createdAt"}}}},
            {
                "$group": {
                    "_id": {"date": "$dateOnly", "tokenType": "$tokenType", "conversationId": "$conversationId"},
                    "Custo": {
                        "$sum": {
                            "$divide": ["$tokenValue", -1_000_000]  # Converte para valor positivo em reais
                        }
                    },
                    "date_sort": {"$first": "$createdAt"},  # Para ordenação
                }
            },
            {
                "$group": {
                    "_id": {"date": "$_id.date", "tokenType": "$_id.tokenType"},
                    "Custo": {"$sum": "$Custo"},
                    "Mensagens": {"$sum": 1},  # Agora conta conversas únicas por data/tipo
                    "date_sort": {"$first": "$date_sort"},
                }
            },
            {
                "$group": {
                    "_id": "$_id.date",
                    "data": {"$push": {"tokenType": "$_id.tokenType", "Custo": "$Custo", "Mensagens": "$Mensagens"}},
                    "date_sort": {"$first": "$date_sort"},
                }
            },
            {
                "$sort": {"date_sort": 1}  # Ordena por data crescente
            },
        ]
    )

    if DEBUG_REPORTS:
        print(f"[DEBUG] Pipeline para contar conversas (não transações): {pipeline}\n\n")

    result = list(client.LibreChat.transactions.aggregate(pipeline))

    if DEBUG_REPORTS:
        print(f"[DEBUG] Resultado bruto (conversas por data/tipo): {result}")

        # Debug adicional para entender a proporção USER vs IA
        for day_data in result:
            date = day_data["_id"]
            print(f"[DEBUG] Data {date}:")
            user_msgs = 0
            ia_msgs = 0
            for token_data in day_data.get("data", []):
                token_type = token_data["tokenType"]
                msgs = token_data["Mensagens"]
                print(f"[DEBUG]   {token_type}: {msgs} conversas")
                if token_type == "prompt":
                    user_msgs = msgs
                elif token_type == "completion":
                    ia_msgs = msgs
            print(f"[DEBUG]   Proporção USER/IA: {user_msgs}/{ia_msgs}")
            print()

    # Se não houver dados, retorna array vazio
    if not result:
        if DEBUG_REPORTS:
            print("[DEBUG] Nenhum dado encontrado")
        return []

    # Reorganiza os dados para o formato esperado pelo frontend
    formatted_result = []
    for day_data in result:
        date = day_data["_id"]

        # Inicializa valores padrão
        entry = {"date": date, "IA msgs": 0, "IA custo": 0.0, "USER msgs": 0, "USER custo": 0.0}

        # Processa os dados de cada tipo de token
        for token_data in day_data["data"]:
            token_type = token_data["tokenType"]
            custo = round(token_data["Custo"], 2)
            mensagens = token_data["Mensagens"]

            if token_type == "completion":  # IA
                entry["IA msgs"] = mensagens
                entry["IA custo"] = custo
            elif token_type == "prompt":  # USER
                entry["USER msgs"] = mensagens
                entry["USER custo"] = custo

        # Calcula o total de mensagens (USER + IA)
        entry["Total Mensagens"] = entry["IA msgs"] + entry["USER msgs"]

        formatted_result.append(entry)

    if DEBUG_REPORTS:
        print(f"[DEBUG] Resultado formatado (conversas por dia): {formatted_result}")
        print(f"[DEBUG] Retornando {len(formatted_result)} registros para usuário: {user_name}")

        # Resumo final das conversas
        total_user_conversations = sum(day["USER msgs"] for day in formatted_result)
        total_ia_conversations = sum(day["IA msgs"] for day in formatted_result)
        print("[DEBUG] 📊 RESUMO CONVERSAS:")
        print(f"[DEBUG]   Total USER conversas: {total_user_conversations}")
        print(f"[DEBUG]   Total IA conversas: {total_ia_conversations}")
        print(f"[DEBUG]   Diferença: {abs(total_user_conversations - total_ia_conversations)}")
        if total_user_conversations > 0:
            ratio = total_ia_conversations / total_user_conversations
            print(f"[DEBUG]   Proporção IA/USER: {ratio:.2f}")

    return formatted_result


# GET ALL AVAILABLE MODELS
@app.get("/reports/available-models")
async def get_available_models():
    """
    Get all available models from the database.
    """
    try:
        pipeline = [
            {"$group": {"_id": "$model", "count": {"$sum": 1}}},
            {"$project": {"_id": 0, "name": "$_id", "count": 1}},
            {"$sort": {"count": -1}},
        ]

        result = list(client.LibreChat.transactions.aggregate(pipeline))
        models = [model["name"] for model in result if model["name"]]  # Remove valores None/vazios

        if DEBUG_REPORTS:
            print(f"[DEBUG] Modelos disponíveis encontrados: {models}")

        return models
    except Exception as e:
        print(f"[DEBUG] Erro ao buscar modelos: {e}")
        return []


# TOP USERS BY MESSAGE VOLUME
# RETURNS: [{ username: 'rm810774', name: 'Rafael Da Silva Melo', Volume: 12450, Custo: 145.80 }]
@app.get("/reports/top-users-volume")
async def get_top_users_volume(
    user: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    search_by: str = "username",
    limit: int | None = None,
):
    """
    Get top users by message volume.
    If user is specified, returns that user's message volume over time.
    FIXED: Now counts only user messages (tokenType: 'prompt') instead of all transactions.
    """
    # Se limit for None, não aplicamos limit (busca todos)
    # Se limit for um número, aplica o limit
    if limit is not None:
        limit = int(limit)
        print(f"[DEBUG] TOP-USERS-VOLUME: aplicando limit={limit}")
    else:
        print("[DEBUG] TOP-USERS-VOLUME: sem limit - buscando todos os dados")

    pipeline = []
    match = {}

    # Filtro por usuário específico
    if user:
        user_data = get_user_data(user, search_by)
        if not user_data or isinstance(user_data, str):
            print("Usuário não encontrado")
            return []
        match["user"] = user_data["_id"]
        if DEBUG_REPORTS:
            print(f"[DEBUG] Filtrando por usuário: {user_data['username']}")

    # Filtro por período
    if start_date or end_date:
        match["createdAt"] = {}
        if start_date:
            match["createdAt"]["$gte"] = datetime.datetime.strptime(start_date, "%Y-%m-%d")
        if end_date:
            end_datetime = datetime.datetime.strptime(end_date, "%Y-%m-%d")
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
            match["createdAt"]["$lte"] = end_datetime
        if not match["createdAt"]:
            del match["createdAt"]
    else:
        # Últimos 30 dias se não especificar período
        match["createdAt"] = {}
        match["createdAt"]["$gte"] = datetime.datetime.now() - datetime.timedelta(days=30)
        match["createdAt"]["$lte"] = datetime.datetime.now()

    if match:
        pipeline.append({"$match": match})

    # Se for usuário específico, agrupa por data
    if user:
        pipeline.extend(
            [
                {"$addFields": {"dateOnly": {"$dateToString": {"format": "%d/%m", "date": "$createdAt"}}}},
                {
                    "$group": {
                        "_id": "$dateOnly",
                        # Volume: conta apenas mensagens de usuário (prompt)
                        "Volume": {"$sum": {"$cond": [{"$eq": ["$tokenType", "prompt"]}, 1, 0]}},
                        # Custo: soma TODOS os tipos de token (prompt + completion)
                        "Custo": {"$sum": {"$divide": ["$tokenValue", -1_000_000]}},
                        "date_sort": {"$first": "$createdAt"},
                    }
                },
                {"$project": {"_id": 0, "date": "$_id", "Volume": 1, "Custo": {"$round": ["$Custo", 2]}, "date_sort": 1}},
                {"$sort": {"date_sort": 1}},
                {"$project": {"date": 1, "Volume": 1, "Custo": 1}},
            ]
        )
    else:
        # Para ranking geral com filtros de data aplicados
        pipeline.extend(
            [
                {
                    "$group": {
                        "_id": "$user",
                        # Volume: conta apenas mensagens de usuário (prompt)
                        "Volume": {"$sum": {"$cond": [{"$eq": ["$tokenType", "prompt"]}, 1, 0]}},
                        # Custo: soma TODOS os tipos de token (prompt + completion)
                        "Custo": {"$sum": {"$divide": ["$tokenValue", -1_000_000]}},
                    }
                },
                {"$lookup": {"from": "users", "localField": "_id", "foreignField": "_id", "as": "user_info"}},
                {"$unwind": "$user_info"},
                {
                    "$project": {
                        "_id": 0,
                        "name": "$user_info.name",
                        "username": "$user_info.username",
                        "costCenter": "$user_info.costCenterCode",
                        "Volume": 1,
                        "Custo": {"$round": ["$Custo", 2]},
                    }
                },
                {"$sort": {"Volume": -1}},
            ]
        )

        # Aplica limit só se foi especificado
        if limit is not None:
            pipeline.append({"$limit": limit})

    if DEBUG_REPORTS:
        print(f"[DEBUG] Top Users Volume Pipeline: {pipeline}")

    result = list(client.LibreChat.transactions.aggregate(pipeline))

    print(f"[DEBUG] TOP-USERS-VOLUME: retornando {len(result)} usuários")

    if DEBUG_REPORTS:
        print(f"[DEBUG] Top Users Volume Result: {result}")

    return result


# TOP USERS BY COST
# RETURNS: [{ name: 'Ana S.', Volume: 12450, Custo: 145.80 }]
@app.get("/reports/top-users-cost")
async def get_top_users_cost(
    user: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    search_by: str = "username",
    limit: int | None = None,
):
    """
    Get top users by cost.
    If user is specified, returns that user's cost over time.
    FIXED: Now counts only user messages (tokenType: 'prompt') for volume to match real conversations.
    """
    # Se limit for None, não aplicamos limit (busca todos)
    if limit is not None:
        limit = int(limit)
    pipeline = []
    match = {}

    print(f"[DEBUG] Top Users Cost - user: {user}, start_date: {start_date}, end_date: {end_date}")

    # Filtro por usuário específico
    if user:
        user_data = get_user_data(user, search_by)
        if not user_data or isinstance(user_data, str):
            print("Usuário não encontrado")
            return []
        match["user"] = user_data["_id"]
        if DEBUG_REPORTS:
            print(f"[DEBUG] Filtrando por usuário: {user_data['username']}")

    # Filtro por período
    if start_date or end_date:
        match["createdAt"] = {}
        if start_date:
            match["createdAt"]["$gte"] = datetime.datetime.strptime(start_date, "%Y-%m-%d")
        if end_date:
            end_datetime = datetime.datetime.strptime(end_date, "%Y-%m-%d")
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
            match["createdAt"]["$lte"] = end_datetime
        if not match["createdAt"]:
            del match["createdAt"]
    else:
        # Últimos 30 dias se não especificar período
        match["createdAt"] = {}
        match["createdAt"]["$gte"] = datetime.datetime.now() - datetime.timedelta(days=30)
        match["createdAt"]["$lte"] = datetime.datetime.now()

    if match:
        pipeline.append({"$match": match})

    # Se for usuário específico, agrupa por data
    if user:
        pipeline.extend(
            [
                {"$addFields": {"dateOnly": {"$dateToString": {"format": "%d/%m", "date": "$createdAt"}}}},
                {
                    "$group": {
                        "_id": "$dateOnly",
                        # Volume: conta apenas mensagens de usuário (prompt)
                        "Volume": {"$sum": {"$cond": [{"$eq": ["$tokenType", "prompt"]}, 1, 0]}},
                        # Custo: soma TODOS os tipos de token (prompt + completion)
                        "Custo": {"$sum": {"$divide": ["$tokenValue", -1_000_000]}},
                        "date_sort": {"$first": "$createdAt"},
                    }
                },
                {"$project": {"_id": 0, "date": "$_id", "Volume": 1, "Custo": {"$round": ["$Custo", 2]}, "date_sort": 1}},
                {"$sort": {"date_sort": 1}},
                {"$project": {"date": 1, "Volume": 1, "Custo": 1}},
            ]
        )
    else:
        # Para ranking geral de custo com filtros de data aplicados
        pipeline.extend(
            [
                {
                    "$group": {
                        "_id": "$user",
                        # Volume: conta apenas mensagens de usuário (prompt)
                        "Volume": {"$sum": {"$cond": [{"$eq": ["$tokenType", "prompt"]}, 1, 0]}},
                        # Custo: soma TODOS os tipos de token (prompt + completion)
                        "Custo": {"$sum": {"$divide": ["$tokenValue", -1_000_000]}},
                    }
                },
                {"$lookup": {"from": "users", "localField": "_id", "foreignField": "_id", "as": "user_info"}},
                {"$unwind": "$user_info"},
                {
                    "$project": {
                        "_id": 0,
                        "name": "$user_info.name",
                        "username": "$user_info.username",
                        "costCenter": "$user_info.costCenterCode",
                        "Volume": 1,
                        "Custo": {"$round": ["$Custo", 2]},
                    }
                },
                {"$sort": {"Custo": -1}},
            ]
        )

        # Aplica limit só se foi especificado
        if limit is not None:
            pipeline.append({"$limit": limit})

    if DEBUG_REPORTS:
        print(f"[DEBUG] Top Users Cost Pipeline: {pipeline}")

    result = list(client.LibreChat.transactions.aggregate(pipeline))

    if DEBUG_REPORTS:
        print(f"[DEBUG] Top Users Cost Result: {result}")

    return result


# TOP MODELS USAGE
# RETURNS: [{ name: 'GPT-4o', value: 45, Volume: 12450, Custo: 145.80 }]
@app.get("/reports/top-models")
async def get_top_models(
    user: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    search_by: str = "username",
    limit: int | None = None,
):
    """
    Get top models by usage.
    If user is specified, returns that user's model usage.
    FIXED: Now counts only user messages (tokenType: 'prompt') for volume to match real conversations.
    """
    # Se limit for None, não aplicamos limit (busca todos)
    if limit is not None:
        limit = int(limit)

    pipeline = []
    match = {}

    print(f"[DEBUG] Top Models - user: {user}, start_date: {start_date}, end_date: {end_date}")

    # Filtro por usuário específico
    if user:
        user_data = get_user_data(user, search_by)
        if not user_data or isinstance(user_data, str):
            print("Usuário não encontrado")
            return []
        match["user"] = user_data["_id"]
        if DEBUG_REPORTS:
            print(f"[DEBUG] Filtrando por usuário: {user_data['username']}")

    # Filtro por período
    if start_date or end_date:
        match["createdAt"] = {}
        if start_date:
            match["createdAt"]["$gte"] = datetime.datetime.strptime(start_date, "%Y-%m-%d")
        if end_date:
            end_datetime = datetime.datetime.strptime(end_date, "%Y-%m-%d")
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
            match["createdAt"]["$lte"] = end_datetime
        if not match["createdAt"]:
            del match["createdAt"]
    else:
        # Últimos 30 dias se não especificar período
        match["createdAt"] = {}
        match["createdAt"]["$gte"] = datetime.datetime.now() - datetime.timedelta(days=30)
        match["createdAt"]["$lte"] = datetime.datetime.now()

    if match:
        pipeline.append({"$match": match})

    # Agrupa por modelo
    pipeline.extend(
        [
            {
                "$group": {
                    "_id": "$model",
                    # Volume: conta apenas mensagens de usuário (prompt)
                    "Volume": {"$sum": {"$cond": [{"$eq": ["$tokenType", "prompt"]}, 1, 0]}},
                    # Custo: soma TODOS os tipos de token (prompt + completion)
                    "Custo": {"$sum": {"$divide": ["$tokenValue", -1_000_000]}},
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "name": "$_id",
                    "Volume": 1,
                    "Custo": {"$round": ["$Custo", 2]},
                    "value": "$Volume",  # Para compatibilidade com gráficos radiais
                }
            },
            {"$sort": {"Volume": -1}},
        ]
    )

    # Aplica limit só se foi especificado
    if limit is not None:
        pipeline.append({"$limit": limit})

    if DEBUG_REPORTS:
        print(f"[DEBUG] Top Models Pipeline: {pipeline}")

    result = list(client.LibreChat.transactions.aggregate(pipeline))

    if DEBUG_REPORTS:
        print(f"[DEBUG] Top Models Result: {result}")

    # Se não houver dados, retorna array vazio
    if not result:
        if DEBUG_REPORTS:
            print("[DEBUG] Nenhum modelo encontrado")
        return []

    return result


# KPIS ENDPOINTS
@app.get("/reports/kpis")
async def get_kpis(start_date: str | None = None, end_date: str | None = None):
    """
    Get KPI data for the dashboard.
    Returns: {
        totalCost: float,
        newUsers: int,
        activeAccounts: int,
        growthRate: float
    }
    """
    try:
        # Filtros de data
        date_match = {}
        if start_date:
            try:
                date_match["$gte"] = datetime.datetime.strptime(start_date, "%Y-%m-%d")
            except ValueError:
                pass

        if end_date:
            try:
                end_datetime = datetime.datetime.strptime(end_date, "%Y-%m-%d")
                end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
                date_match["$lte"] = end_datetime
            except ValueError:
                pass

        # Se não tiver datas, usa últimos 30 dias
        if not date_match:
            date_match["$gte"] = datetime.datetime.now() - datetime.timedelta(days=30)
            date_match["$lte"] = datetime.datetime.now()

        # 1. CUSTO TOTAL DO PERÍODO
        cost_pipeline = []
        if date_match:
            cost_pipeline.append({"$match": {"createdAt": date_match}})

        cost_pipeline.extend([{"$group": {"_id": None, "totalCost": {"$sum": {"$divide": ["$tokenValue", -1_000_000]}}}}])

        cost_result = list(client.LibreChat.transactions.aggregate(cost_pipeline))
        total_cost = round(cost_result[0]["totalCost"], 2) if cost_result else 0.0

        # 2. USUÁRIOS NOVOS NO PERÍODO (criados na collection users)
        user_pipeline = []
        if date_match:
            user_pipeline.append({"$match": {"createdAt": date_match}})

        user_pipeline.extend([{"$count": "newUsers"}])

        new_users_result = list(client.LibreChat.users.aggregate(user_pipeline))
        new_users = new_users_result[0]["newUsers"] if new_users_result else 0

        # 3. CONTAS ATIVAS (todos os usuários cadastrados no sistema)
        active_pipeline = [{"$count": "name"}]

        active_result = list(client.LibreChat.users.aggregate(active_pipeline))
        active_accounts = active_result[0]["name"] if active_result else 0

        # if DEBUG_REPORTS:
        #     print(f"[DEBUG] KPIs calculados: {active_accounts}")

        result = {"totalCost": total_cost, "newUsers": new_users, "activeAccounts": active_accounts}

        if DEBUG_REPORTS:
            print(f"[DEBUG] KPIs calculados: {result}")

        return result

    except Exception as e:
        print(f"[DEBUG] Erro ao calcular KPIs: {e}")
        return {"totalCost": 0.0, "newUsers": 0, "activeAccounts": 0}


# USER EFFICIENCY - COST PER MESSAGE
@app.get("/reports/user-efficiency")
async def get_user_efficiency(
    user: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    search_by: str = "username",
    limit: int | None = None,
):
    """
    Get user efficiency data (cost per message ratio).
    Returns: [{ username: 'rm810774', name: 'Rafael Da Silva Melo', Volume: 100, Custo: 15.50, CostPerMessage: 0.155 }]
    FIXED: Now counts only user messages (tokenType: 'prompt') for volume to match real conversations.
    """
    # Se limit for None, não aplicamos limit (busca todos)
    if limit is not None:
        limit = int(limit)

    try:
        pipeline = []
        match = {}

        print(f"[DEBUG] User Efficiency - user: {user}, start_date: {start_date}, end_date: {end_date}")

        # Filtro por usuário específico
        if user:
            user_data = get_user_data(user, search_by)
            if not user_data or isinstance(user_data, str):
                print("Usuário não encontrado")
                return []
            match["user"] = user_data["_id"]
            if DEBUG_REPORTS:
                print(f"[DEBUG] Filtrando por usuário: {user_data['username']}")

        # Filtro por período
        if start_date or end_date:
            match["createdAt"] = {}
            if start_date:
                match["createdAt"]["$gte"] = datetime.datetime.strptime(start_date, "%Y-%m-%d")
            if end_date:
                end_datetime = datetime.datetime.strptime(end_date, "%Y-%m-%d")
                end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
                match["createdAt"]["$lte"] = end_datetime
            if not match["createdAt"]:
                del match["createdAt"]
        else:
            # Últimos 30 dias se não especificar período
            match["createdAt"] = {}
            match["createdAt"]["$gte"] = datetime.datetime.now() - datetime.timedelta(days=30)
            match["createdAt"]["$lte"] = datetime.datetime.now()

        if match:
            pipeline.append({"$match": match})

        # Agrupa por usuário e calcula eficiência
        pipeline.extend(
            [
                {
                    "$group": {
                        "_id": "$user",
                        # Volume: conta apenas mensagens de usuário (prompt)
                        "Volume": {"$sum": {"$cond": [{"$eq": ["$tokenType", "prompt"]}, 1, 0]}},
                        # Custo: soma TODOS os tipos de token (prompt + completion)
                        "Custo": {"$sum": {"$divide": ["$tokenValue", -1_000_000]}},
                    }
                },
                {
                    "$match": {
                        "Volume": {"$gt": 0},  # Só usuários com mensagens
                        "Custo": {"$gt": 0},  # Só usuários com custo > 0
                    }
                },
                {"$addFields": {"CostPerMessage": {"$divide": ["$Custo", "$Volume"]}}},
                {"$lookup": {"from": "users", "localField": "_id", "foreignField": "_id", "as": "user_info"}},
                {"$unwind": "$user_info"},
                {
                    "$project": {
                        "_id": 0,
                        "name": "$user_info.name",
                        "username": "$user_info.username",
                        "costCenter": "$user_info.costCenterCode",
                        "Volume": 1,
                        "Custo": {"$round": ["$Custo", 2]},
                        "CostPerMessage": {"$round": ["$CostPerMessage", 4]},
                    }
                },
                {
                    "$sort": {"CostPerMessage": -1}  # Ordena por maior custo por mensagem
                },
            ]
        )

        # Aplica limit só se foi especificado
        if limit is not None:
            pipeline.append({"$limit": limit})

        if DEBUG_REPORTS:
            print(f"[DEBUG] User Efficiency Pipeline: {pipeline}")

        result = list(client.LibreChat.transactions.aggregate(pipeline))

        if DEBUG_REPORTS:
            print(f"[DEBUG] User Efficiency Result: {result}")

        return result

    except Exception as e:
        print(f"[DEBUG] Erro ao calcular eficiência de usuários: {e}")
        return []


# -------------------------------------------------------------------------
# COST CENTER REPORTS - NEW FUNCTIONALITY
# -------------------------------------------------------------------------


# TOP COST CENTERS BY MESSAGE VOLUME
# RETURNS: [{ name: 'CC001', Volume: 12450, Custo: 145.80 }]
@app.get("/reports/top-cost-centers-volume")
async def get_top_cost_centers_volume(
    user: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    search_by: str = "username",
    limit: int | None = None,
):
    """
    Get top cost centers by message volume.
    Groups transactions by cost center and counts user messages (tokenType: 'prompt').
    """
    # Se limit for None, não aplicamos limit (busca todos)
    if limit is not None:
        limit = int(limit)
        print(f"[DEBUG] TOP-COST-CENTERS-VOLUME: aplicando limit={limit}")
    else:
        print("[DEBUG] TOP-COST-CENTERS-VOLUME: sem limit - buscando todos os dados")

    pipeline = []
    match = {}

    print(f"[DEBUG] Top Cost Centers Volume - user: {user}, start_date: {start_date}, end_date: {end_date}")

    # Filtro por usuário específico (se fornecido)
    if user:
        user_data = get_user_data(user, search_by)
        if not user_data or isinstance(user_data, str):
            print("Usuário não encontrado")
            return []
        match["user"] = user_data["_id"]
        if DEBUG_REPORTS:
            print(f"[DEBUG] Filtrando por usuário: {user_data['username']}")

    # Filtro por período
    if start_date or end_date:
        match["createdAt"] = {}
        if start_date:
            match["createdAt"]["$gte"] = datetime.datetime.strptime(start_date, "%Y-%m-%d")
        if end_date:
            end_datetime = datetime.datetime.strptime(end_date, "%Y-%m-%d")
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
            match["createdAt"]["$lte"] = end_datetime
        if not match["createdAt"]:
            del match["createdAt"]
    else:
        # Últimos 30 dias se não especificar período
        match["createdAt"] = {}
        match["createdAt"]["$gte"] = datetime.datetime.now() - datetime.timedelta(days=30)
        match["createdAt"]["$lte"] = datetime.datetime.now()

    if match:
        pipeline.append({"$match": match})

    # Pipeline para agrupar por centro de custo
    pipeline.extend(
        [
            # Lookup para buscar dados do usuário (incluindo centro de custo)
            {"$lookup": {"from": "users", "localField": "user", "foreignField": "_id", "as": "user_info"}},
            {"$unwind": "$user_info"},
            # Agrupa por centro de custo (usando costCenterName para melhor visualização)
            {
                "$group": {
                    "_id": "$user_info.costCenterName",
                    # Volume: conta apenas mensagens de usuário (prompt)
                    "Volume": {"$sum": {"$cond": [{"$eq": ["$tokenType", "prompt"]}, 1, 0]}},
                    # Custo: soma TODOS os tipos de token (prompt + completion)
                    "Custo": {"$sum": {"$divide": ["$tokenValue", -1_000_000]}},
                    # Mantém o código para referência
                    "costCenterCode": {"$first": "$user_info.costCenterCode"},
                }
            },
            # Filtra apenas centros de custo válidos (não nulos/vazios)
            {"$match": {"_id": {"$ne": None, "$ne": "", "$exists": True}}},
            {
                "$project": {
                    "_id": 0,
                    "name": "$_id",  # Nome do centro de custo
                    "code": "$costCenterCode",  # Código do centro de custo
                    "Volume": 1,
                    "Custo": {"$round": ["$Custo", 2]},
                    "value": "$Volume",  # Para compatibilidade com gráficos radiais
                }
            },
            {"$sort": {"Volume": -1}},
        ]
    )

    # Aplica limit só se foi especificado
    if limit is not None:
        pipeline.append({"$limit": limit})

    if DEBUG_REPORTS:
        print(f"[DEBUG] Top Cost Centers Volume Pipeline: {pipeline}")

    result = list(client.LibreChat.transactions.aggregate(pipeline))

    print(f"[DEBUG] TOP-COST-CENTERS-VOLUME: retornando {len(result)} centros de custo")

    if DEBUG_REPORTS:
        print(f"[DEBUG] Top Cost Centers Volume Result: {result}")

    # Se não houver dados, retorna array vazio
    if not result:
        if DEBUG_REPORTS:
            print("[DEBUG] Nenhum centro de custo encontrado")
        return []

    return result


# TOP COST CENTERS BY COST
# RETURNS: [{ name: 'CC001', Volume: 12450, Custo: 145.80 }]
@app.get("/reports/top-cost-centers-cost")
async def get_top_cost_centers_cost(
    user: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    search_by: str = "username",
    limit: int | None = None,
):
    """
    Get top cost centers by cost.
    Groups transactions by cost center and calculates total cost.
    """
    # Se limit for None, não aplicamos limit (busca todos)
    if limit is not None:
        limit = int(limit)
        print(f"[DEBUG] TOP-COST-CENTERS-COST: aplicando limit={limit}")
    else:
        print("[DEBUG] TOP-COST-CENTERS-COST: sem limit - buscando todos os dados")

    pipeline = []
    match = {}

    print(f"[DEBUG] Top Cost Centers Cost - user: {user}, start_date: {start_date}, end_date: {end_date}")

    # Filtro por usuário específico (se fornecido)
    if user:
        user_data = get_user_data(user, search_by)
        if not user_data or isinstance(user_data, str):
            print("Usuário não encontrado")
            return []
        match["user"] = user_data["_id"]
        if DEBUG_REPORTS:
            print(f"[DEBUG] Filtrando por usuário: {user_data['username']}")

    # Filtro por período
    if start_date or end_date:
        match["createdAt"] = {}
        if start_date:
            match["createdAt"]["$gte"] = datetime.datetime.strptime(start_date, "%Y-%m-%d")
        if end_date:
            end_datetime = datetime.datetime.strptime(end_date, "%Y-%m-%d")
            end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
            match["createdAt"]["$lte"] = end_datetime
        if not match["createdAt"]:
            del match["createdAt"]
    else:
        # Últimos 30 dias se não especificar período
        match["createdAt"] = {}
        match["createdAt"]["$gte"] = datetime.datetime.now() - datetime.timedelta(days=30)
        match["createdAt"]["$lte"] = datetime.datetime.now()

    if match:
        pipeline.append({"$match": match})

    # Pipeline para agrupar por centro de custo
    pipeline.extend(
        [
            # Lookup para buscar dados do usuário (incluindo centro de custo)
            {"$lookup": {"from": "users", "localField": "user", "foreignField": "_id", "as": "user_info"}},
            {"$unwind": "$user_info"},
            # Agrupa por centro de custo (usando costCenterName para melhor visualização)
            {
                "$group": {
                    "_id": "$user_info.costCenterName",
                    # Volume: conta apenas mensagens de usuário (prompt)
                    "Volume": {"$sum": {"$cond": [{"$eq": ["$tokenType", "prompt"]}, 1, 0]}},
                    # Custo: soma TODOS os tipos de token (prompt + completion)
                    "Custo": {"$sum": {"$divide": ["$tokenValue", -1_000_000]}},
                    # Mantém o código para referência
                    "costCenterCode": {"$first": "$user_info.costCenterCode"},
                }
            },
            # Filtra apenas centros de custo válidos (não nulos/vazios)
            {"$match": {"_id": {"$ne": None, "$ne": "", "$exists": True}}},
            {
                "$project": {
                    "_id": 0,
                    "name": "$_id",  # Nome do centro de custo
                    "code": "$costCenterCode",  # Código do centro de custo
                    "Volume": 1,
                    "Custo": {"$round": ["$Custo", 2]},
                    "value": "$Volume",  # Para compatibilidade com gráficos radiais
                }
            },
            {
                "$sort": {"Custo": -1}  # Ordena por custo (maior para menor)
            },
        ]
    )

    # Aplica limit só se foi especificado
    if limit is not None:
        pipeline.append({"$limit": limit})

    if DEBUG_REPORTS:
        print(f"[DEBUG] Top Cost Centers Cost Pipeline: {pipeline}")

    result = list(client.LibreChat.transactions.aggregate(pipeline))

    print(f"[DEBUG] TOP-COST-CENTERS-COST: retornando {len(result)} centros de custo")

    if DEBUG_REPORTS:
        print(f"[DEBUG] Top Cost Centers Cost Result: {result}")

    # Se não houver dados, retorna array vazio
    if not result:
        if DEBUG_REPORTS:
            print("[DEBUG] Nenhum centro de custo encontrado")
        return []

    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=15785)
