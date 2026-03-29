#!/usr/bin/env python3
"""
Query contact_messages table using raw PostgreSQL wire protocol with SCRAM-SHA-256 auth.
No third-party DB libraries required - uses only Python stdlib.
"""

import socket
import struct
import hashlib
import hmac as hmac_module
import base64
import os

HOST = "172.18.0.2"
PORT = 5432
USER = "portfolio"
PASSWORD = "portfolio_dev"
DATABASE = "portfolio"


def recv_all(sock, n):
    data = b""
    while len(data) < n:
        chunk = sock.recv(n - len(data))
        if not chunk:
            raise ConnectionError("Connection closed unexpectedly")
        data += chunk
    return data


def read_message(sock):
    header = recv_all(sock, 5)
    msg_type = chr(header[0])
    msg_len = struct.unpack("!I", header[1:5])[0]
    body = recv_all(sock, msg_len - 4)
    return msg_type, body


def send_startup(sock, user, database):
    params = b"user\x00" + user.encode() + b"\x00"
    params += b"database\x00" + database.encode() + b"\x00"
    params += b"\x00"
    payload = struct.pack("!II", len(params) + 8, 196608) + params
    sock.sendall(payload)


def send_query(sock, query):
    msg = query.encode() + b"\x00"
    packet = b"Q" + struct.pack("!I", len(msg) + 4) + msg
    sock.sendall(packet)


def parse_error_body(body):
    """Parse PostgreSQL error message body into readable string."""
    parts = []
    i = 0
    while i < len(body):
        field_type = body[i]
        if field_type == 0:
            break
        i += 1
        end = body.index(b"\x00", i)
        value = body[i:end].decode("utf-8", errors="replace")
        i = end + 1
        if field_type in (ord('S'), ord('M'), ord('D')):
            parts.append(value)
    return " | ".join(parts)


def xor_bytes(a, b):
    return bytes(x ^ y for x, y in zip(a, b))


def hi(password_bytes, salt, iterations):
    return hashlib.pbkdf2_hmac("sha256", password_bytes, salt, iterations)


def hmac_sha256(key, msg):
    return hmac_module.new(key, msg, hashlib.sha256).digest()


def h_sha256(data):
    return hashlib.sha256(data).digest()


def scram_sha256_auth(sock, password):
    """Perform SCRAM-SHA-256 authentication exchange (called after receiving auth_type=10)."""

    # --- Client First Message ---
    client_nonce = base64.b64encode(os.urandom(18)).decode("ascii")
    client_first_bare = f"n={USER},r={client_nonce}"
    client_first_msg = "n,," + client_first_bare

    # SASLInitialResponse packet
    mech = b"SCRAM-SHA-256\x00"
    msg_bytes = client_first_msg.encode("utf-8")
    # body = mech_name + int32(client_first_msg_length) + client_first_msg
    sasl_body = mech + struct.pack("!I", len(msg_bytes)) + msg_bytes
    packet = b"p" + struct.pack("!I", len(sasl_body) + 4) + sasl_body
    sock.sendall(packet)

    # --- Receive AuthenticationSASLContinue (R, auth_type=11) ---
    msg_type, body = read_message(sock)
    if msg_type == "E":
        raise RuntimeError(f"SASL error: {parse_error_body(body)}")
    assert msg_type == "R", f"Expected R, got {msg_type!r}, body={body[:80]}"
    cont_auth_type = struct.unpack("!I", body[:4])[0]
    assert cont_auth_type == 11, f"Expected auth_type 11, got {cont_auth_type}"
    server_first = body[4:].decode("utf-8")
    print(f"  [SCRAM] server_first: {server_first}")

    # Parse: r=...,s=...,i=...
    params = {}
    for part in server_first.split(","):
        if len(part) >= 3 and part[1] == "=":
            params[part[0]] = part[2:]

    server_nonce = params["r"]
    salt = base64.b64decode(params["s"])
    iterations = int(params["i"])

    assert server_nonce.startswith(client_nonce), "Server nonce prefix mismatch"

    # --- Build Client Final Message ---
    # channel-binding: "n,," base64-encoded
    channel_binding = base64.b64encode(b"n,,").decode("ascii")
    client_final_no_proof = f"c={channel_binding},r={server_nonce}"

    # Compute proof
    password_bytes = password.encode("utf-8")
    salted_password = hi(password_bytes, salt, iterations)
    client_key = hmac_sha256(salted_password, b"Client Key")
    stored_key = h_sha256(client_key)
    server_key = hmac_sha256(salted_password, b"Server Key")

    auth_message = f"{client_first_bare},{server_first},{client_final_no_proof}"
    client_signature = hmac_sha256(stored_key, auth_message.encode("utf-8"))
    client_proof = xor_bytes(client_key, client_signature)
    proof_b64 = base64.b64encode(client_proof).decode("ascii")

    client_final = f"{client_final_no_proof},p={proof_b64}"

    # SASLResponse
    msg_bytes = client_final.encode("utf-8")
    packet = b"p" + struct.pack("!I", len(msg_bytes) + 4) + msg_bytes
    sock.sendall(packet)

    # --- Receive AuthenticationSASLFinal (R, auth_type=12) ---
    msg_type, body = read_message(sock)
    if msg_type == "E":
        raise RuntimeError(f"SASL final error: {parse_error_body(body)}")
    assert msg_type == "R", f"Expected R, got {msg_type!r}"
    final_auth_type = struct.unpack("!I", body[:4])[0]
    assert final_auth_type == 12, f"Expected auth_type 12, got {final_auth_type}"

    # --- Receive AuthenticationOk (R, auth_type=0) ---
    msg_type, body = read_message(sock)
    if msg_type == "E":
        raise RuntimeError(f"AuthOk error: {parse_error_body(body)}")
    assert msg_type == "R", f"Expected R, got {msg_type!r}"
    ok_auth_type = struct.unpack("!I", body[:4])[0]
    assert ok_auth_type == 0, f"Expected AuthOk (0), got {ok_auth_type}"
    print("  [SCRAM] Authentication OK")


def parse_row_description(body):
    num_fields = struct.unpack("!H", body[:2])[0]
    offset = 2
    columns = []
    for _ in range(num_fields):
        end = body.index(b"\x00", offset)
        col_name = body[offset:end].decode()
        columns.append(col_name)
        offset = end + 1 + 18
    return columns


def parse_data_row(body):
    num_cols = struct.unpack("!H", body[:2])[0]
    offset = 2
    values = []
    for _ in range(num_cols):
        col_len = struct.unpack("!i", body[offset:offset + 4])[0]
        offset += 4
        if col_len == -1:
            values.append(None)
        else:
            values.append(body[offset:offset + col_len].decode())
            offset += col_len
    return values


def execute_queries():
    print(f"Connecting to {HOST}:{PORT} database={DATABASE} user={USER}")
    sock = socket.create_connection((HOST, PORT), timeout=10)
    try:
        send_startup(sock, USER, DATABASE)

        authenticated = False
        while not authenticated:
            msg_type, body = read_message(sock)
            if msg_type == "R":
                auth_type = struct.unpack("!I", body[:4])[0]
                print(f"  Auth type: {auth_type}")
                if auth_type == 0:
                    authenticated = True
                elif auth_type == 5:
                    salt = body[4:8]
                    inner = hashlib.md5((PASSWORD + USER).encode()).hexdigest().encode()
                    outer = "md5" + hashlib.md5(inner + salt).hexdigest()
                    msg = outer.encode() + b"\x00"
                    packet = b"p" + struct.pack("!I", len(msg) + 4) + msg
                    sock.sendall(packet)
                elif auth_type == 3:
                    msg = PASSWORD.encode() + b"\x00"
                    packet = b"p" + struct.pack("!I", len(msg) + 4) + msg
                    sock.sendall(packet)
                elif auth_type == 10:
                    scram_sha256_auth(sock, PASSWORD)
                    authenticated = True
                else:
                    raise RuntimeError(f"Unsupported auth type: {auth_type}")
            elif msg_type == "E":
                raise RuntimeError(f"Auth error: {parse_error_body(body)}")

        # Drain until ReadyForQuery
        while True:
            msg_type, body = read_message(sock)
            if msg_type == "Z":
                break
            elif msg_type == "E":
                raise RuntimeError(f"Startup error: {parse_error_body(body)}")

        print("Connected to PostgreSQL successfully.\n")

        queries = [
            "SELECT COUNT(*) FROM contact_messages;",
            "SELECT id, name, email, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 25;"
        ]

        for query in queries:
            print(f"Query: {query}")
            print("-" * 70)
            send_query(sock, query)

            columns = []
            rows = []
            error = None

            while True:
                msg_type, body = read_message(sock)
                if msg_type == "T":
                    columns = parse_row_description(body)
                elif msg_type == "D":
                    rows.append(parse_data_row(body))
                elif msg_type == "C":
                    tag = body.rstrip(b"\x00").decode()
                    print(f"Command: {tag}")
                elif msg_type == "Z":
                    break
                elif msg_type == "E":
                    error = parse_error_body(body)
                elif msg_type == "I":
                    pass

            if error:
                print(f"ERROR: {error}")
            else:
                if columns:
                    col_widths = [max(len(c), 4) for c in columns]
                    for r in rows:
                        for i, v in enumerate(r):
                            if v and len(str(v)) > col_widths[i]:
                                col_widths[i] = len(str(v))

                    header = " | ".join(c.ljust(col_widths[i]) for i, c in enumerate(columns))
                    sep = "-+-".join("-" * w for w in col_widths)
                    print(header)
                    print(sep)
                    for row in rows:
                        line = " | ".join(
                            (str(v) if v is not None else "NULL").ljust(col_widths[i])
                            for i, v in enumerate(row)
                        )
                        print(line)
                    print(f"\n({len(rows)} row(s) returned)\n")
                else:
                    print("(no rows)\n")

        sock.sendall(b"X" + struct.pack("!I", 4))

    finally:
        sock.close()


if __name__ == "__main__":
    execute_queries()
