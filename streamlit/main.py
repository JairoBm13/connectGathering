# app.py
import streamlit as st
import sqlite3
from datetime import datetime, date, time
from typing import Optional, Tuple

st.set_page_config(page_title="Gather", page_icon="🧭", layout="wide")

# ----------------------------
# DB helpers
# ----------------------------
@st.cache_resource
def get_conn():
    conn = sqlite3.connect("community.db", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.executescript(
        """
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            username TEXT NOT NULL,
            zipcode TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            interest TEXT NOT NULL,
            zipcode TEXT NOT NULL,
            name TEXT NOT NULL,
            UNIQUE(interest, zipcode)
        );

        CREATE TABLE IF NOT EXISTS user_groups (
            user_id INTEGER NOT NULL,
            group_id INTEGER NOT NULL,
            PRIMARY KEY (user_id, group_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS polls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'open', -- open | closed
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            locked_at TEXT,
            winner_option_id INTEGER,
            FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS poll_options (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            poll_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            location TEXT NOT NULL,
            notes TEXT,
            created_by INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            poll_id INTEGER NOT NULL,
            option_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(poll_id, user_id),
            FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
            FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            poll_id INTEGER NOT NULL,
            option_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            location TEXT NOT NULL,
            notes TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
            FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE SET NULL,
            FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_messages_group ON messages(group_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_votes_poll ON votes(poll_id);
        """
    )
    conn.commit()

def ensure_group(interest: str, zipcode: str) -> int:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id FROM groups WHERE interest=? AND zipcode=?", (interest, zipcode))
    row = cur.fetchone()
    if row:
        return row["id"]
    name = f"{interest} ({zipcode})"
    cur.execute("INSERT INTO groups (interest, zipcode, name) VALUES (?, ?, ?)", (interest, zipcode, name))
    conn.commit()
    return cur.lastrowid

def add_user_to_group(user_id: int, group_id: int):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("INSERT OR IGNORE INTO user_groups (user_id, group_id) VALUES (?, ?)", (user_id, group_id))
    conn.commit()

def get_or_create_open_poll(group_id: int) -> int:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id FROM polls WHERE group_id=? AND status='open' ORDER BY created_at DESC LIMIT 1", (group_id,))
    row = cur.fetchone()
    if row:
        return row["id"]
    cur.execute("INSERT INTO polls (group_id, status) VALUES (?, 'open')", (group_id,))
    conn.commit()
    return cur.lastrowid

def participation_and_threshold(poll_id: int, group_id: int) -> Tuple[int, int, float]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) AS n FROM user_groups WHERE group_id=?", (group_id,))
    group_size = cur.fetchone()["n"]
    cur.execute("SELECT COUNT(*) AS n FROM votes WHERE poll_id=?", (poll_id,))
    voters = cur.fetchone()["n"]
    part = (voters / group_size) if group_size > 0 else 0.0
    return voters, group_size, part

def finalize_if_ready(poll_id: int, group_id: int, threshold: float = 0.75):
    conn = get_conn()
    cur = conn.cursor()
    voters, group_size, part = participation_and_threshold(poll_id, group_id)
    if part < threshold:
        return False, voters, group_size, part

    cur.execute("""
        SELECT o.id, o.title, o.date, o.time, o.location, o.notes, COUNT(v.id) AS votes
        FROM poll_options o
        LEFT JOIN votes v ON v.option_id = o.id
        WHERE o.poll_id = ?
        GROUP BY o.id
        ORDER BY votes DESC, o.created_at ASC
        LIMIT 1
    """, (poll_id,))
    winner = cur.fetchone()
    if not winner:
        return False, voters, group_size, part

    now = datetime.utcnow().isoformat()
    cur.execute("UPDATE polls SET status='closed', locked_at=?, winner_option_id=? WHERE id=?",
                (now, winner["id"], poll_id))
    cur.execute("""
        INSERT INTO events (group_id, poll_id, option_id, title, date, time, location, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (group_id, poll_id, winner["id"], winner["title"], winner["date"], winner["time"], winner["location"], winner["notes"]))
    conn.commit()
    return True, voters, group_size, part

# ----------------------------
# UX helpers
# ----------------------------
def ensure_default_membership(user_id: int, zipcode: str):
    """Auto-join a default General group if user has none."""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) AS n FROM user_groups WHERE user_id=?", (user_id,))
    if cur.fetchone()["n"] == 0:
        gid = ensure_group("General", zipcode)
        add_user_to_group(user_id, gid)

def auth_box():
    st.sidebar.subheader("Register / Login")
    mode = st.sidebar.radio("Mode", ["Register", "Login"], horizontal=True)

    email = st.sidebar.text_input("Email")
    username = st.sidebar.text_input("Username") if mode == "Register" else ""
    zipcode = st.sidebar.text_input("Zip code") if mode == "Register" else ""

    interests_all = ["Pick-up Soccer", "Book Club", "Gym Buddies", "Study Group", "Board Games",
                     "Coffee Meetups", "Hiking", "Cooking", "Volunteering", "Live Music"]

    if mode == "Register":
        interests = st.sidebar.multiselect("Interests (optional now—can join later)", interests_all)
        if st.sidebar.button("Create account"):
            if not email or not username or not zipcode:
                st.sidebar.error("Please fill email, username, and zip code.")
                return
            try:
                conn = get_conn()
                cur = conn.cursor()
                cur.execute("INSERT INTO users (email, username, zipcode) VALUES (?, ?, ?)", (email, username, zipcode))
                conn.commit()
                user_id = cur.lastrowid
                # Join selected interests + ensure a default group if none chosen
                for i in interests:
                    gid = ensure_group(i, zipcode)
                    add_user_to_group(user_id, gid)
                ensure_default_membership(user_id, zipcode)

                st.session_state.update(
                    user_id=user_id, email=email, username=username, zipcode=zipcode
                )
                st.success("Account created. You're logged in!")
                st.rerun()
            except sqlite3.IntegrityError:
                st.sidebar.error("Email already registered. Use Login.")
    else:
        if st.sidebar.button("Login"):
            if not email:
                st.sidebar.error("Enter your email to login.")
                return
            conn = get_conn()
            cur = conn.cursor()
            cur.execute("SELECT * FROM users WHERE email=?", (email,))
            user = cur.fetchone()
            if user:
                st.session_state.update(
                    user_id=user["id"],
                    email=user["email"],
                    username=user["username"],
                    zipcode=user["zipcode"],
                )
                ensure_default_membership(user["id"], user["zipcode"])
                st.success(f"Welcome back, {user['username']}!")
                st.rerun()
            else:
                st.sidebar.error("No account found. Please register.")

def require_auth() -> Optional[int]:
    return st.session_state.get("user_id")

def group_selector(user_id: int) -> Optional[int]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT g.id, g.name
        FROM groups g
        JOIN user_groups ug ON ug.group_id = g.id
        WHERE ug.user_id = ?
        ORDER BY g.name
    """, (user_id,))
    rows = cur.fetchall()

    st.sidebar.divider()
    st.sidebar.subheader("Your Groups")

    if st.sidebar.button("Join another group"):
        st.session_state["show_join"] = True

    if st.session_state.get("show_join"):
        with st.sidebar.expander("Join by interest + your zip"):
            interest = st.text_input("New Interest")
            if st.button("Create/Join"):
                if interest and st.session_state.get("zipcode"):
                    gid = ensure_group(interest, st.session_state["zipcode"])
                    add_user_to_group(user_id, gid)
                    st.success(f"Joined {interest} ({st.session_state['zipcode']})")
                    st.session_state["show_join"] = False
                    st.rerun()

    if not rows:
        st.sidebar.info("You aren't in any groups yet.")
        return None

    # Auto-select first group on first load
    if "active_group_id" not in st.session_state:
        st.session_state["active_group_id"] = rows[0]["id"]

    names = {r["name"]: r["id"] for r in rows}
    selected_name = st.sidebar.selectbox("Select a group", list(names.keys()),
                                         index=list(names.values()).index(st.session_state["active_group_id"]))
    st.session_state["active_group_id"] = names[selected_name]
    return st.session_state["active_group_id"]

def chat_ui(group_id: int, user_id: int):
    st.subheader("💬 Group Chat")
    left, right = st.columns([2, 1])
    conn = get_conn()
    cur = conn.cursor()

    with left:
        limit = st.slider("Show last N messages", 10, 200, 50)
        cur.execute("""
            SELECT m.content, m.created_at, u.username
            FROM messages m JOIN users u ON u.id=m.user_id
            WHERE m.group_id=?
            ORDER BY m.created_at DESC
            LIMIT ?
        """, (group_id, limit))
        msgs = cur.fetchall()
        for m in reversed(msgs):
            # FIX: removed bad key; show ISO timestamp directly
            st.markdown(f"**{m['username']}** · _{m['created_at']}_")
            st.write(m["content"])
            st.divider()
        if st.button("Refresh"):
            st.rerun()

    with right:
        with st.form("send_message", clear_on_submit=True):
            msg = st.text_area("Message", height=100)
            sent = st.form_submit_button("Send")
            if sent and msg.strip():
                cur.execute("INSERT INTO messages (group_id, user_id, content) VALUES (?, ?, ?)",
                            (group_id, user_id, msg.strip()))
                conn.commit()
                st.toast("Message sent")
                st.rerun()

def polls_ui(group_id: int, user_id: int):
    st.subheader("🗳️ Event Polls (auto-finalize at 75% participation)")
    conn = get_conn()
    cur = conn.cursor()

    poll_id = get_or_create_open_poll(group_id)

    # propose option
    with st.expander("Propose an event option"):
        with st.form("new_option"):
            title = st.text_input("Title (e.g., Soccer @ Central Park)")
            d: date = st.date_input("Date", min_value=date.today())
            t: time = st.time_input("Time", value=time(18, 0))
            location = st.text_input("Location")
            notes = st.text_area("Notes (optional)")
            add = st.form_submit_button("Add option")
            if add:
                if title and location:
                    cur.execute("""
                        INSERT INTO poll_options (poll_id, title, date, time, location, notes, created_by)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (poll_id, title, d.isoformat(), t.isoformat(timespec="minutes"), location, notes, user_id))
                    conn.commit()
                    st.success("Option added.")
                    st.rerun()

    # list options + vote
    cur.execute("""
        SELECT o.id, o.title, o.date, o.time, o.location, o.notes,
               (SELECT COUNT(*) FROM votes v WHERE v.option_id=o.id) AS votes
        FROM poll_options o
        WHERE o.poll_id=?
        ORDER BY votes DESC, o.created_at ASC
    """, (poll_id,))
    options = cur.fetchall()

    cur.execute("SELECT option_id FROM votes WHERE poll_id=? AND user_id=?", (poll_id, user_id))
    my_vote_row = cur.fetchone()
    my_vote = my_vote_row["option_id"] if my_vote_row else None

    if options:
        st.markdown("#### Current options")
        ids = [o["id"] for o in options]
        default_index = ids.index(my_vote) if (my_vote in ids) else 0
        with st.form("vote_form"):
            choice = st.radio(
                "Choose your favorite",
                options=ids,
                format_func=lambda oid: next(o for o in options if o["id"] == oid)["title"],
                index=default_index
            )
            submit_vote = st.form_submit_button("Submit / Change Vote")
            if submit_vote:
                try:
                    cur.execute("INSERT INTO votes (poll_id, option_id, user_id) VALUES (?, ?, ?)",
                                (poll_id, choice, user_id))
                except sqlite3.IntegrityError:
                    cur.execute("UPDATE votes SET option_id=?, created_at=CURRENT_TIMESTAMP WHERE poll_id=? AND user_id=?",
                                (choice, poll_id, user_id))
                conn.commit()
                st.toast("Vote recorded")
                st.rerun()

        for o in options:
            with st.container(border=True):
                st.markdown(f"**{o['title']}**")
                st.caption(f"📍 {o['location']} • 📅 {o['date']} • 🕒 {o['time']}")
                if o["notes"]:
                    st.write(o["notes"])
                st.write(f"Votes: **{o['votes']}**")
    else:
        st.info("No options yet. Propose the first one!")

    voters, group_size, part = participation_and_threshold(poll_id, group_id)
    st.progress(min(part, 1.0))
    st.caption(f"Participation: {voters}/{group_size} voted ({part:.0%}). Threshold: 75%.")

    finalized, _, _, _ = finalize_if_ready(poll_id, group_id)
    if finalized:
        st.success("✅ Poll reached 75% participation and has been finalized!")
        st.rerun()

    cur.execute("""
        SELECT e.title, e.date, e.time, e.location, e.notes
        FROM events e
        WHERE e.group_id=?
        ORDER BY e.created_at DESC
        LIMIT 1
    """, (group_id,))
    last_event = cur.fetchone()
    if last_event:
        with st.expander("Most recently finalized event"):
            st.markdown(f"**{last_event['title']}**")
            st.caption(f"📍 {last_event['location']} • 📅 {last_event['date']} • 🕒 {last_event['time']}")
            if last_event["notes"]:
                st.write(last_event["notes"])

# ----------------------------
# App
# ----------------------------
def main():
    init_db()
    st.title("🧭 Gather: Community Groups by Interest + Zip")

    # Auth in sidebar
    auth_box()
    user_id = require_auth()
    if not user_id:
        st.info("Register or login from the left sidebar to continue.")
        return

    # Group selection (auto-joined to General on first login)
    gid = group_selector(user_id)
    if not gid:
        st.info("Join or create a group to begin.")
        return

    # Group header
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT name FROM groups WHERE id=?", (gid,))
    g = cur.fetchone()
    st.header(f"Group: {g['name']}")

    # Tabs: Chat / Polls
    tab1, tab2 = st.tabs(["Chat", "Polls & Events"])
    with tab1:
        chat_ui(gid, user_id)
    with tab2:
        polls_ui(gid, user_id)

    st.sidebar.divider()
    if st.sidebar.button("Log out"):
        for k in ("user_id", "email", "username", "zipcode", "active_group_id"):
            st.session_state.pop(k, None)
        st.rerun()

if __name__ == "__main__":
    main()
