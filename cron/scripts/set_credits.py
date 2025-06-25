import os

import dotenv
from pymongo import MongoClient

dotenv.load_dotenv(override=True)

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)


def main():
    token_credits_threshold = int(1e6)

    balances_lower_than_token_credits_threshold = list(
        client.LibreChat.balances.find({"tokenCredits": {"$lt": token_credits_threshold}})
    )
    client.LibreChat.balances.update_many(
        {"_id": {"$in": [balance["_id"] for balance in balances_lower_than_token_credits_threshold]}},
        {"$set": {"tokenCredits": token_credits_threshold}},
    )


if __name__ == "__main__":
    main()
