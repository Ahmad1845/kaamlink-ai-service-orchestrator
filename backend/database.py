import os
from typing import Any
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")


class _NullResult:
    def __init__(self):
        self.data = []


class _NullQuery:
    def __init__(self, table_name: str):
        self._table_name = table_name

    def select(self, *args, **kwargs):
        return self

    def insert(self, *args, **kwargs):
        return self

    def update(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        return self

    def order(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    def execute(self):
        raise RuntimeError(f"Supabase unavailable. Falling back from table '{self._table_name}'.")


class _NullDB:
    def table(self, table_name: str) -> _NullQuery:
        return _NullQuery(table_name)


_cached_client: Any | None = None
_warned = False


def get_db() -> Any:
    global _cached_client, _warned

    if _cached_client is not None:
        return _cached_client

    if not url or not key:
        if not _warned:
            print("Warning: SUPABASE_URL or SUPABASE_KEY is missing. Using in-memory fallback.")
            _warned = True
        _cached_client = _NullDB()
        return _cached_client

    try:
        from supabase import create_client

        _cached_client = create_client(url, key)
        return _cached_client
    except Exception as exc:
        if not _warned:
            print(f"Warning: Supabase client unavailable ({exc}). Using in-memory fallback.")
            _warned = True
        _cached_client = _NullDB()
        return _cached_client
