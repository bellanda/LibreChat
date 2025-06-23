#!/usr/bin/env python3
"""
Generate user statistics for LibreChat.
Creates daily reports of user activity and stores in database.
"""

import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
load_dotenv()


def main():
    # Configuration
    mongo_uri = os.getenv("MONGO_URI", "mongodb://mongodb:27017/LibreChat")

    print(f"[{datetime.now()}] Starting user statistics generation")

    try:
        # Connect to MongoDB
        client = MongoClient(mongo_uri)
        db = client.get_default_database()

        # Test connection
        client.admin.command("ping")
        print(f"Connected to MongoDB: {mongo_uri}")

        # Get collections
        users = db.users
        conversations = db.conversations
        messages = db.messages
        stats = db.userStats

        # Calculate date ranges
        now = datetime.now()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        last_7_days = now - timedelta(days=7)
        last_30_days = now - timedelta(days=30)

        print("Generating statistics...")

        # Total counts
        total_users = users.count_documents({})
        total_conversations = conversations.count_documents({})
        total_messages = messages.count_documents({})

        # Recent activity
        conversations_today = conversations.count_documents({"createdAt": {"$gte": today}})
        conversations_7d = conversations.count_documents({"createdAt": {"$gte": last_7_days}})
        conversations_30d = conversations.count_documents({"createdAt": {"$gte": last_30_days}})

        messages_today = messages.count_documents({"createdAt": {"$gte": today}})
        messages_7d = messages.count_documents({"createdAt": {"$gte": last_7_days}})
        messages_30d = messages.count_documents({"createdAt": {"$gte": last_30_days}})

        # Active users (users with messages in period)
        active_users_today = len(messages.distinct("user", {"createdAt": {"$gte": today}}))
        active_users_7d = len(messages.distinct("user", {"createdAt": {"$gte": last_7_days}}))
        active_users_30d = len(messages.distinct("user", {"createdAt": {"$gte": last_30_days}}))

        # Create statistics document
        stats_doc = {
            "type": "daily_summary",
            "date": today,
            "generated_at": now,
            "totals": {"users": total_users, "conversations": total_conversations, "messages": total_messages},
            "activity": {
                "today": {
                    "conversations": conversations_today,
                    "messages": messages_today,
                    "active_users": active_users_today,
                },
                "last_7_days": {"conversations": conversations_7d, "messages": messages_7d, "active_users": active_users_7d},
                "last_30_days": {
                    "conversations": conversations_30d,
                    "messages": messages_30d,
                    "active_users": active_users_30d,
                },
            },
        }

        # Remove existing stats for today and insert new
        stats.delete_many({"type": "daily_summary", "date": today})

        result = stats.insert_one(stats_doc)

        print(f"Statistics saved with ID: {result.inserted_id}")
        print(f"Summary - Users: {total_users}, Active today: {active_users_today}")
        print(f"Today - Conversations: {conversations_today}, Messages: {messages_today}")
        print("Statistics generation completed successfully")

    except Exception as e:
        print(f"Error generating statistics: {e}")
        raise
    finally:
        if "client" in locals():
            client.close()


if __name__ == "__main__":
    main()
