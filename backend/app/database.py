import os
import sqlite3
import aiosqlite
import logging
from typing import List, Dict, Any, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_PATH = os.path.join(BASE_DIR, "form_data.db")

async def get_db_connection() -> aiosqlite.Connection:
    """
    Returns an async SQLite connection.
    """
    conn = await aiosqlite.connect(DATABASE_PATH)
    conn.row_factory = aiosqlite.Row
    return conn

async def init_db():
    """
    Initialize SQLite database tables asynchronously and perform necessary schema migrations.
    """
    async with aiosqlite.connect(DATABASE_PATH) as conn:
        # Create users table without confirm_password column
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                security_question TEXT NOT NULL,
                security_answer TEXT NOT NULL
            )
        ''')

        # Check if old confirm_password column exists from previous schema and drop it if possible
        try:
            cursor = await conn.execute("PRAGMA table_info(users)")
            columns = await cursor.fetchall()
            col_names = [col[1] for col in columns]
            if "confirm_password" in col_names:
                logging.info("Migrating schema: dropping confirm_password column from users table...")
                try:
                    await conn.execute("ALTER TABLE users DROP COLUMN confirm_password")
                except Exception as drop_err:
                    logging.warning(f"Could not drop confirm_password column directly: {drop_err}")
        except Exception as e:
            logging.warning(f"Error checking schema migration: {e}")

        # Create history table for tracking redaction operations
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                filename TEXT NOT NULL,
                operation_type TEXT NOT NULL,
                redaction_level INTEGER NOT NULL,
                status TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                details TEXT
            )
        ''')

        await conn.commit()
    logging.info("Database initialized asynchronously.")

async def execute_query(query: str, params: tuple = ()) -> int:
    """
    Execute an INSERT, UPDATE, or DELETE query asynchronously.
    Returns lastrowid for INSERTs or rowcount.
    """
    async with aiosqlite.connect(DATABASE_PATH) as conn:
        cursor = await conn.execute(query, params)
        await conn.commit()
        return cursor.lastrowid

async def fetch_one(query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
    """
    Fetch a single row as a dictionary asynchronously.
    """
    async with aiosqlite.connect(DATABASE_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        cursor = await conn.execute(query, params)
        row = await cursor.fetchone()
        return dict(row) if row else None

async def fetch_all(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """
    Fetch multiple rows as a list of dictionaries asynchronously.
    """
    async with aiosqlite.connect(DATABASE_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        cursor = await conn.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
