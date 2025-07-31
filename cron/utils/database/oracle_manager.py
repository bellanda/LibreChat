"""
Oracle Database Connection Manager.

This module provides an easy-to-use interface for connecting to Oracle databases
using configurations from tnsnames.ora file. It maintains credentials in environment
variables while allowing easy selection of different database connections.
"""

import logging
import os
import pathlib
from contextlib import contextmanager
from typing import Dict, List, Optional

import dotenv
import oracledb
from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import sessionmaker

from .polars_tools.export_tools import ExportToolsMixin
from .tns_parser import OracleConnectionConfig, TNSParser

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
try:
    dotenv_path = pathlib.Path(__file__).resolve().parent.parent.parent / ".env"
    if dotenv_path.exists():
        dotenv.load_dotenv(dotenv_path=dotenv_path, override=True)
        logger.info(f"Environment variables loaded from: {dotenv_path}")
    else:
        dotenv.load_dotenv(override=True)
        logger.info("Attempting to load environment variables from current or default directory.")
except Exception as e:
    logger.warning(f"Could not load .env file: {e}")


class ExtendedEngine(ExportToolsMixin, Engine):
    """
    Extended SQLAlchemy Engine with custom methods from mixin classes.

    This class wraps a SQLAlchemy Engine and forwards all its methods while
    adding custom functionality through mixin classes for better maintainability
    and complete IDE autocompletion support.
    """

    def __init__(self, engine: Engine, database_name: str):
        """
        Initialize ExtendedEngine with base engine.

        Args:
            engine: SQLAlchemy Engine instance
            database_name: Name of the database for context
        """
        self._engine = engine
        self._database_name = database_name
        logger.info(f"ExtendedEngine initialized for database: {database_name}")


class DatabaseSelector:
    """Helper class to provide database selection with autocompletion."""

    def __init__(self, tns_parser: TNSParser):
        self.tns_parser = tns_parser
        self._connection_names = None

    @property
    def available_databases(self) -> List[str]:
        """Get list of available database names with caching."""
        if self._connection_names is None:
            self._connection_names = self.tns_parser.get_connection_names()
        return self._connection_names

    def __getattr__(self, name: str) -> str:
        """Allow dot notation access to database names for autocompletion."""
        db_name = name.upper()
        if db_name in self.available_databases:
            return db_name
        raise AttributeError(f"Database '{name}' not found. Available: {', '.join(self.available_databases)}")

    def __dir__(self) -> List[str]:
        """Provide autocompletion support in IDEs."""
        return [name.lower() for name in self.available_databases]

    def list_all(self) -> None:
        """Display all available databases."""
        self.tns_parser.list_connections()


class OracleConnectionManager:
    """Oracle Database Connection Manager using tnsnames.ora configurations."""

    def __init__(self):
        """
        Initialize Oracle connection manager.

        Args:
            tnsnames_path: Optional path to tnsnames.ora file
        """
        # Load credentials from environment
        self.username = os.getenv("ORACLE_USERNAME")
        self.password = os.getenv("ORACLE_PASSWORD")
        self.client_path = os.getenv("CLIENT_PATH")
        self.tns_parser = TNSParser(os.getenv("TNS_NAMES_PATH", None))
        self.db = DatabaseSelector(self.tns_parser)

        # Configuration flags
        self.enable_sqlalchemy_log = os.getenv("ORACLE_ENABLE_SQL_ALCHEMY_LOG", "false").lower() == "true"
        self.enable_oracle_trace = os.getenv("ORACLE_ENABLE_TRACE", "false").lower() == "true"

        # Validate credentials
        if not self.username or not self.password:
            raise ValueError(
                "Oracle credentials not found. Please set ORACLE_USERNAME and ORACLE_PASSWORD in environment variables."
            )

        # Initialize Oracle client if path provided
        self._init_oracle_client()

        # Cache for engines
        self._engines: Dict[str, ExtendedEngine] = {}
        self._session_makers: Dict[str, sessionmaker] = {}

    def _init_oracle_client(self) -> None:
        """Initialize Oracle client if CLIENT_PATH is provided."""
        if self.client_path:
            try:
                os.environ["LD_LIBRARY_PATH"] = self.client_path
                oracledb.init_oracle_client(lib_dir=self.client_path)
                logger.info(f"Oracle Client initialized from: {self.client_path}")
            except Exception as e:
                logger.warning(
                    f"Failed to initialize Oracle Client at {self.client_path}: {e}. Continuing (may use Thin mode)."
                )
        else:
            logger.info(
                "CLIENT_PATH not defined. oracledb driver will attempt to use Thin mode or search for client in system path."
            )

    def _enable_oracle_trace_listener(self, dbapi_connection, connection_record):
        """SQLAlchemy listener to enable Oracle 10046 trace on connection."""
        cursor = None
        try:
            cursor = dbapi_connection.cursor()
            trace_identifier = f"sqlalchemy_app_{os.getpid()}_{int(__import__('time').time())}"
            logger.info(f"*** ENABLING ORACLE TRACE (ID: {trace_identifier}) for new connection ***")

            cursor.execute(f"ALTER SESSION SET TRACEFILE_IDENTIFIER = '{trace_identifier}'")
            cursor.execute("ALTER SESSION SET EVENTS '10046 trace name context forever, level 12'")

        except Exception as e:
            logger.error(f"!!! Failed to enable Oracle trace on session: {e} !!!", exc_info=True)
        finally:
            if cursor:
                try:
                    cursor.close()
                except Exception as e_close:
                    logger.error(f"!!! Failed to close cursor in trace listener: {e_close} !!!", exc_info=True)

    def _create_engine(self, database_name: str) -> ExtendedEngine:
        """Create SQLAlchemy engine for specified database."""
        config = self.tns_parser.get_connection_config(database_name)
        if not config:
            available = ", ".join(self.tns_parser.get_connection_names())
            raise ValueError(f"Database '{database_name}' not found. Available: {available}")

        connection_string = config.to_connection_string(self.username, self.password)
        logger.info(f"Creating engine for {database_name}: {config.host}:{config.port}/{config.service_name}")

        engine_args = {
            "pool_timeout": 30,
            "pool_recycle": 1800,
        }

        if self.enable_sqlalchemy_log:
            engine_args["echo"] = True
            engine_args["echo_pool"] = "debug"

        base_engine = create_engine(connection_string, **engine_args)

        # Register trace listener if enabled
        if self.enable_oracle_trace:
            event.listen(base_engine, "connect", self._enable_oracle_trace_listener)
            logger.warning(f"<<< Oracle Trace (10046) ENABLED for {database_name} >>>")

        return ExtendedEngine(base_engine, database_name)

    def get_engine(self, database_name: str) -> ExtendedEngine:
        """
        Get ExtendedEngine for specified database.

        Args:
            database_name: Name of the database from tnsnames.ora

        Returns:
            ExtendedEngine instance with custom methods
        """
        db_name = database_name.upper()

        if db_name not in self._engines:
            self._engines[db_name] = self._create_engine(db_name)

        return self._engines[db_name]

    def get_session_maker(self, database_name: str) -> sessionmaker:
        """
        Get SQLAlchemy sessionmaker for specified database.

        Args:
            database_name: Name of the database from tnsnames.ora

        Returns:
            SQLAlchemy sessionmaker instance
        """
        db_name = database_name.upper()

        if db_name not in self._session_makers:
            engine = self.get_engine(db_name)
            # Use the underlying engine for sessionmaker
            self._session_makers[db_name] = sessionmaker(bind=engine._engine)

        return self._session_makers[db_name]

    @contextmanager
    def get_session(self, database_name: str):
        """
        Context manager for database sessions.

        Args:
            database_name: Name of the database from tnsnames.ora

        Yields:
            SQLAlchemy Session instance
        """
        session_maker = self.get_session_maker(database_name)
        session = session_maker()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def test_connection(self, database_name: str) -> bool:
        """
        Test connection to specified database.

        Args:
            database_name: Name of the database from tnsnames.ora

        Returns:
            True if connection successful, False otherwise
        """
        try:
            engine = self.get_engine(database_name)
            with engine.connect() as conn:
                result = conn.execute(__import__("sqlalchemy").text("SELECT 1 FROM DUAL"))
                result.fetchone()
            logger.info(f"Connection test successful for {database_name}")
            return True
        except Exception as e:
            logger.error(f"Connection test failed for {database_name}: {e}")
            return False

    def get_connection_info(self, database_name: str) -> Optional[OracleConnectionConfig]:
        """
        Get connection information for specified database.

        Args:
            database_name: Name of the database from tnsnames.ora

        Returns:
            OracleConnectionConfig instance or None if not found
        """
        return self.tns_parser.get_connection_config(database_name)

    def list_databases(self) -> None:
        """List all available databases."""
        self.db.list_all()


# Global instance for easy access
oracle_manager = OracleConnectionManager()

# Convenience aliases for easy access
db = oracle_manager.db  # For autocompletion: db.hpe, db.bidw, etc.
get_engine = oracle_manager.get_engine
get_session = oracle_manager.get_session
test_connection = oracle_manager.test_connection
list_databases = oracle_manager.list_databases
