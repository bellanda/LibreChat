import os
import pathlib
import sys

sys.path.append(str(pathlib.Path(__file__).resolve().parent.parent))


import dotenv
from pymongo import MongoClient, UpdateOne

from utils.database.oracle_manager import get_engine

dotenv.load_dotenv()

SERVER_MONGO_URI = os.getenv("MONGO_URI_SERVER")

client = MongoClient(SERVER_MONGO_URI)


users = tuple(user["username"] for user in client.LibreChat.users.find({}, {"username": 1, "_id": 0}))
users_df = get_engine("PSFIN19").sql_query_to_polars_df(
    f"SELECT * FROM MMC_USERS_AD WHERE STATUSFUNC = 'A' AND LOGIN IN {users}"
)
users_df.columns = [col.upper() for col in users_df.columns]


users_to_update = {}

for user in users_df.iter_rows(named=True):
    users_to_update[user["LOGIN"]] = {
        "costCenterCode": user["CODCCUSTO"],
        "costCenterName": user["NOMECCUSTO"],
        "workPositionCode": user["CODCARGO"],
        "workPositionName": user["NOMECARGO"],
    }

operations = [
    UpdateOne(
        {"username": user},
        {"$set": users_to_update[user]},
    )
    for user in users_to_update
]

client.LibreChat.users.bulk_write(operations)
