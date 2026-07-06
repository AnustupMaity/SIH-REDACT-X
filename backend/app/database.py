import os
import sqlite3
import aiosqlite
import logging
from typing import List, Dict, Any, Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Turso Cloud Database Configuration (for free permanent cloud storage on Hugging Face Spaces)
_raw_turso_url = os.environ.get("TURSO_DATABASE_URL", "").strip()
# Convert libsql:// or wss:// to https:// for 100% reliable HTTP JSON execution without WebSocket firewall/400 errors
if _raw_turso_url.startswith("libsql://"):
    TURSO_URL = "https://" + _raw_turso_url[9:]
elif _raw_turso_url.startswith("wss://"):
    TURSO_URL = "https://" + _raw_turso_url[6:]
else:
    TURSO_URL = _raw_turso_url if _raw_turso_url else None

TURSO_TOKEN = os.environ.get("TURSO_AUTH_TOKEN", "").strip()

# On Hugging Face Spaces or cloud Docker deployments without Turso, use persistent volume /data if available
if os.path.exists("/data") and os.access("/data", os.W_OK):
    DATABASE_PATH = "/data/form_data.db"
elif os.environ.get("DATABASE_PATH"):
    DATABASE_PATH = os.environ.get("DATABASE_PATH")
else:
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
    Initialize database tables asynchronously (Turso LibSQL or Local SQLite).
    """
    if TURSO_URL:
        try:
            import libsql_client
            async with libsql_client.create_client(url=TURSO_URL, auth_token=TURSO_TOKEN) as client:
                await client.execute('''
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
                await client.execute('''
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
            logging.info("Turso Cloud LibSQL database initialized successfully.")
            return
        except Exception as e:
            logging.error(f"Failed to initialize Turso database: {e}. Falling back to local SQLite.")

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
    logging.info("Local SQLite database initialized asynchronously.")

async def execute_query(query: str, params: tuple = ()) -> int:
    """
    Execute an INSERT, UPDATE, or DELETE query asynchronously.
    Returns lastrowid for INSERTs or rowcount.
    """
    if TURSO_URL:
        try:
            import libsql_client
            async with libsql_client.create_client(url=TURSO_URL, auth_token=TURSO_TOKEN) as client:
                rs = await client.execute(query, list(params))
                return rs.last_insert_rowid if rs.last_insert_rowid is not None else rs.rows_affected
        except Exception as e:
            logging.error(f"Turso execute_query error: {e}")
            raise e

    async with aiosqlite.connect(DATABASE_PATH) as conn:
        cursor = await conn.execute(query, params)
        await conn.commit()
        return cursor.lastrowid

async def fetch_one(query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
    """
    Fetch a single row as a dictionary asynchronously.
    """
    if TURSO_URL:
        try:
            import libsql_client
            async with libsql_client.create_client(url=TURSO_URL, auth_token=TURSO_TOKEN) as client:
                rs = await client.execute(query, list(params))
                return dict(zip(rs.columns, rs.rows[0])) if rs.rows else None
        except Exception as e:
            logging.error(f"Turso fetch_one error: {e}")
            raise e

    async with aiosqlite.connect(DATABASE_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        cursor = await conn.execute(query, params)
        row = await cursor.fetchone()
        return dict(row) if row else None

async def fetch_all(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """
    Fetch multiple rows as a list of dictionaries asynchronously.
    """
    if TURSO_URL:
        try:
            import libsql_client
            async with libsql_client.create_client(url=TURSO_URL, auth_token=TURSO_TOKEN) as client:
                rs = await client.execute(query, list(params))
                return [dict(zip(rs.columns, row)) for row in rs.rows]
        except Exception as e:
            logging.error(f"Turso fetch_all error: {e}")
            raise e

    async with aiosqlite.connect(DATABASE_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        cursor = await conn.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
