from models.session_model import Session
from models.user_model import User
from utils.jwt import verify_jwt

ROLE_MAP = {1: "admin", 2: "teacher", 3: "student"}


def remove_bearer(token):
    if token is None:
        return None
    if token.startswith("Bearer "):
        token = token[7:]
    return token


def check_authentication(token, role=None):
    if token is None:
        return None
    token = remove_bearer(token)
    jwt_payload = verify_jwt(token)

    if jwt_payload is None:
        return None

    session_id = jwt_payload.get("sid")
    if session_id is None:
        return None

    session = Session.get_by_id(session_id)
    if session:
        user = User.get_by_id(session.user_id)
        if user:
            if role is not None:
                user_role = ROLE_MAP.get(user.role_id)
                if user_role is None:
                    print(f"Warning: role_id {user.role_id} not found in ROLE_MAP")
                    return None
                if user_role != role:
                    return None
            Session.update_active(session_id)
            user.session_id = session_id
            return user
    return None
