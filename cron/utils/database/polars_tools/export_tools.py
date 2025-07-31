"""
Export Tools Extension for Oracle Engine.

This module provides a mixin class with methods for exporting SQL query results
to various file formats using Polars for efficient data processing.
"""

import pathlib
import time
from typing import Literal, Optional

import polars as pl
from sqlalchemy import Engine, text

FILE_TYPES = Literal["parquet", "csv", "json", "excel"]


class ExportToolsMixin:
    """
    Mixin class providing export functionality for Oracle Engine.

    This mixin should be inherited by a class that provides:
    - self._engine: SQLAlchemy Engine instance
    - self._database_name: Database name for context
    """

    _engine: Engine

    def export_to_file(
        self,
        sql_string: str,
        output_file_path: str | pathlib.Path,
        file_type: FILE_TYPES,
        show_timing: bool = True,
    ) -> None:
        """
        Export SQL query results to a file using Polars.

        Args:
            sql_string: SQL query to execute
            output_file_path: Path where to save the file
            file_type: Type of file to export ('parquet', 'csv', 'json', 'excel')
            show_timing: Whether to print execution time

        Example:
            engine.export_to_file(
                sql_string="SELECT * FROM DUAL",
                output_file_path="output.parquet",
                file_type="parquet"
            )
        """
        start_time = time.time()

        with self._engine.connect() as connection:
            result = connection.execute(text(sql_string))
            df = pl.from_records(result.fetchall())

            if file_type == "parquet":
                df.write_parquet(output_file_path)
            elif file_type == "csv":
                df.write_csv(output_file_path)
            elif file_type == "json":
                df.write_json(output_file_path)
            elif file_type == "excel":
                df.write_excel(output_file_path)

        if show_timing:
            end_time = time.time()
            print(f"⚡ Oracle query exported to {file_type}: {end_time - start_time:.2f} seconds")

    def export_to_parquet(
        self,
        sql_string: str,
        output_file_path: str | pathlib.Path,
        show_timing: bool = True,
    ) -> None:
        """
        Export SQL query results to a Parquet file.

        Args:
            sql_string: SQL query to execute
            output_file_path: Path where to save the Parquet file
            show_timing: Whether to print execution time

        Example:
            engine.export_to_parquet(
                sql_string="SELECT * FROM DUAL",
                output_file_path="output.parquet"
            )
        """
        self.export_to_file(sql_string, output_file_path, "parquet", show_timing)

    def export_to_csv(
        self,
        sql_string: str,
        output_file_path: str | pathlib.Path,
        show_timing: bool = True,
    ) -> None:
        """
        Export SQL query results to a CSV file.

        Args:
            sql_string: SQL query to execute
            output_file_path: Path where to save the CSV file
            show_timing: Whether to print execution time

        Example:
            engine.export_to_csv(
                sql_string="SELECT * FROM DUAL",
                output_file_path="output.csv"
            )
        """
        self.export_to_file(sql_string, output_file_path, "csv", show_timing)

    def sql_query_to_polars_df(
        self,
        sql_string: str,
        show_timing: bool = True,
    ) -> pl.DataFrame:
        """
        Execute SQL query and return results as a Polars DataFrame.

        Args:
            sql_string: SQL query to execute
            show_timing: Whether to print execution time

        Returns:
            Polars DataFrame with query results

        Example:
            df = engine.query_to_polars("SELECT * FROM DUAL")
            print(df)
        """
        start_time = time.time()

        with self._engine.connect() as connection:
            result = connection.execute(text(sql_string))
            df = pl.from_records(result.fetchall())

        if show_timing:
            end_time = time.time()
            print(f"⚡ Oracle query to Polars DataFrame: {end_time - start_time:.2f} seconds")

        return df

    def quick_query(
        self,
        sql_string: str,
        limit: Optional[int] = None,
        show_timing: bool = True,
    ) -> pl.DataFrame:
        """
        Execute SQL query with optional limit and return results as Polars DataFrame.

        Args:
            sql_string: SQL query to execute
            limit: Optional limit for number of rows to return
            show_timing: Whether to print execution time

        Returns:
            Polars DataFrame with query results

        Example:
            df = engine.quick_query(
                sql_string=text("SELECT * FROM MY_TABLE WHERE id = :id"),
                limit=100
            )
            print(df)
        """
        if limit:
            # Add ROWNUM limit to the query
            limited_sql = f"""
            SELECT * FROM (
                {sql_string}
            ) WHERE ROWNUM <= {limit}
            """
        else:
            limited_sql = sql_string

        return self.query_to_polars(limited_sql, show_timing)
