"""
TNS Names Parser for Oracle Database Connections.

This module provides functionality to parse tnsnames.ora files and extract
connection information for different Oracle databases.
"""

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


@dataclass
class OracleConnectionConfig:
    """Oracle connection configuration extracted from tnsnames.ora."""

    name: str
    host: str
    port: int
    service_name: str
    protocol: str = "TCP"
    connect_timeout: Optional[int] = None
    transport_connect_timeout: Optional[int] = None
    retry_count: Optional[int] = None
    load_balance: Optional[bool] = None
    failover: Optional[bool] = None
    server: Optional[str] = None

    def to_connection_string(self, username: str, password: str) -> str:
        """Generate SQLAlchemy connection string."""
        return f"oracle+oracledb://{username}:{password}@{self.host}:{self.port}/?service_name={self.service_name}"

    def to_dsn(self) -> str:
        """Generate Oracle DSN string."""
        return f"{self.host}:{self.port}/{self.service_name}"


class TNSParser:
    """Parser for Oracle tnsnames.ora files."""

    def __init__(self, tnsnames_path: Path | str):
        """
        Initialize TNS parser.

        Args:
            tnsnames_path: Path to tnsnames.ora file. If None, will search common locations.
        """
        self.tnsnames_path = Path(tnsnames_path)
        self._connections: Dict[str, OracleConnectionConfig] = {}
        self._loaded = False

    def _read_file_lines(self) -> List[str]:
        """Read all lines from tnsnames.ora file and remove newlines."""
        with open(self.tnsnames_path, "r", encoding="utf-8") as f:
            all_lines = f.readlines()

        stripped_lines = []
        for line in all_lines:
            stripped_lines.append(line.rstrip())

        return stripped_lines

    def _remove_comments_blanklines(self, stripped_lines: List[str]) -> List[str]:
        """Remove comment lines and blank lines."""
        ret_lines = []

        for sline in stripped_lines:
            if len(sline) < 1:
                continue
            elif sline[0] != "#":
                ret_lines.append(sline)

        return ret_lines

    def _get_tns_entries(self, tns_lines: List[str]) -> List[List[str]]:
        """Break into individual TNS entries."""
        list_of_entries = []
        curr_entry = None

        for input_line in tns_lines:
            if len(input_line) > 0:
                if input_line[0] != " " and input_line[0] != "\t" and input_line[0] != "(" and input_line[0] != ")":
                    # New TNS entry
                    if curr_entry is not None:
                        # Save previous entry
                        list_of_entries.append(curr_entry)
                    # Start new entry
                    curr_entry = [input_line]
                else:
                    # Another line in current entry
                    if curr_entry is not None:
                        curr_entry.append(input_line)

        if curr_entry is not None:
            # Save last entry
            list_of_entries.append(curr_entry)

        return list_of_entries

    def _parse_tns_entry(self, entry: List[str]) -> Optional[OracleConnectionConfig]:
        """Convert list of strings into OracleConnectionConfig."""
        try:
            # Skip comment lines that start with dashes
            if entry[0].strip().startswith("---") or entry[0].strip().startswith("--"):
                return None

            # First line should be TNS entry name like "ORCL.WORLD =" or "CDBHPE01_OCI=(...)"
            index = entry[0].find(" =")
            if index > 1:
                entry_name = entry[0][0:index].strip()
            else:
                # Try to find just the name before any whitespace or =
                entry_name = entry[0].split()[0].strip()

                # Handle entries without spaces before =, like "CDBHPE01_OCI=(DESCRIPTION=..."
                if "=" in entry_name and not entry_name.endswith("="):
                    # Extract just the name part before =
                    entry_name = entry_name.split("=")[0].strip()

            # Skip if entry name is just dashes (comment lines)
            if entry_name.startswith("---") or entry_name.startswith("--"):
                return None

            host_name = None
            port_number = None
            db_identifier = None
            service_sid = None

            # Join all lines for single-line entries
            full_entry = " ".join(entry)

            # Look for HOST, PORT, SERVICE_NAME, or SID in all lines
            for line in entry + [full_entry]:  # Check both individual lines and joined content
                upper_line = line.upper()

                if "HOST" in upper_line and "=" in upper_line and not host_name:
                    index = upper_line.find("HOST")
                    # Find the = after HOST
                    eq_index = upper_line.find("=", index)
                    if eq_index > 0:
                        # Remove everything before HOST =
                        trimmed_line = upper_line[eq_index + 1 :].strip()
                        # Host name is everything before )
                        paren_index = trimmed_line.find(")")
                        if paren_index > 0:
                            host_name = trimmed_line[0:paren_index].strip()

                if "PORT" in upper_line and "=" in upper_line and "TRANSPORT" not in upper_line and not port_number:
                    index = upper_line.find("PORT")
                    # Find the = after PORT
                    eq_index = upper_line.find("=", index)
                    if eq_index > 0:
                        # Remove everything before PORT =
                        trimmed_line = upper_line[eq_index + 1 :].strip()
                        # Port number is everything before )
                        paren_index = trimmed_line.find(")")
                        if paren_index > 0:
                            try:
                                port_number = int(trimmed_line[0:paren_index].strip())
                            except ValueError:
                                logger.warning(f"Could not parse port number from: {trimmed_line}")

                # Look for (PORT=nnnn) pattern specifically
                if "PORT=" in upper_line and not port_number:
                    # Find (PORT= pattern
                    port_pattern_start = upper_line.find("(PORT=")
                    if port_pattern_start >= 0:
                        # Extract everything after (PORT=
                        port_start = port_pattern_start + len("(PORT=")
                        # Find the closing parenthesis
                        port_end = upper_line.find(")", port_start)
                        if port_end > port_start:
                            port_str = upper_line[port_start:port_end].strip()
                            try:
                                port_number = int(port_str)
                            except ValueError:
                                logger.warning(f"Could not parse port number from: {port_str}")

                if "SERVICE_NAME" in upper_line and "=" in upper_line and not db_identifier:
                    index = upper_line.find("SERVICE_NAME")
                    # Find the = after SERVICE_NAME
                    eq_index = upper_line.find("=", index)
                    if eq_index > 0:
                        # Remove everything before SERVICE_NAME =
                        trimmed_line = upper_line[eq_index + 1 :].strip()
                        # Service name is everything before )
                        paren_index = trimmed_line.find(")")
                        if paren_index > 0:
                            db_identifier = trimmed_line[0:paren_index].strip()
                            service_sid = "SERVICE_NAME"

                if "SID" in upper_line and "=" in upper_line and "SERVICE" not in upper_line and not db_identifier:
                    index = upper_line.find("SID")
                    # Find the = after SID
                    eq_index = upper_line.find("=", index)
                    if eq_index > 0:
                        # Remove everything before SID =
                        trimmed_line = upper_line[eq_index + 1 :].strip()
                        # SID is everything before )
                        paren_index = trimmed_line.find(")")
                        if paren_index > 0:
                            db_identifier = trimmed_line[0:paren_index].strip()
                            service_sid = "SID"

            # Validate we have the required information
            if not all([entry_name, host_name, port_number, db_identifier]):
                logger.warning(
                    f"Missing required info for {entry_name}: host={host_name}, port={port_number}, db={db_identifier}"
                )
                return None

            # Create the configuration
            config = OracleConnectionConfig(
                name=entry_name, host=host_name, port=port_number, service_name=db_identifier, protocol="TCP"
            )

            return config

        except Exception as e:
            logger.error(f"Error parsing TNS entry: {e}")
            return None

    def load_connections(self) -> Dict[str, OracleConnectionConfig]:
        """Load and parse all connections from tnsnames.ora file."""
        if self._loaded and self._connections:
            return self._connections

        if not self.tnsnames_path or not self.tnsnames_path.exists():
            logger.error("tnsnames.ora file not found")
            return {}

        try:
            # Read all lines from file
            tns_lines1 = self._read_file_lines()

            # Remove comments and blank lines
            tns_lines2 = self._remove_comments_blanklines(tns_lines1)

            # Break into individual TNS entries
            tns_entries = self._get_tns_entries(tns_lines2)

            # Parse each entry
            for entry in tns_entries:
                config = self._parse_tns_entry(entry)
                if config:
                    self._connections[config.name.upper()] = config
                    logger.debug(f"Loaded connection: {config.name} -> {config.host}:{config.port}/{config.service_name}")

            self._loaded = True
            logger.info(f"Loaded {len(self._connections)} Oracle connections from tnsnames.ora")

        except Exception as e:
            logger.error(f"Error loading tnsnames.ora: {e}")

        return self._connections

    def get_connection_names(self) -> List[str]:
        """Get list of all available connection names."""
        if not self._loaded:
            self.load_connections()
        return sorted(self._connections.keys())

    def get_connection_config(self, name: str) -> Optional[OracleConnectionConfig]:
        """Get connection configuration by name."""
        if not self._loaded:
            self.load_connections()
        return self._connections.get(name.upper())

    def list_connections(self) -> None:
        """Print all available connections with their details."""
        if not self._loaded:
            self.load_connections()

        if not self._connections:
            print("No Oracle connections found in tnsnames.ora")
            return

        print(f"\nAvailable Oracle Connections ({len(self._connections)}):")
        print("=" * 60)

        for name, config in sorted(self._connections.items()):
            print(f"{name:15} -> {config.host}:{config.port}/{config.service_name}")
