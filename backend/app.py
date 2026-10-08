import os

from dotenv import load_dotenv
from flask import Flask
from routes.error import error_bp
from routes.index import index_bp
from routes.user import user_bp
from routes.auth import auth_bp
from routes.student import student_bp
from routes.subject import subject_bp
from routes.teacher import teacher_bp
from routes.class_ import class_bp
from routes.dashboard import dashboard_bp

load_dotenv()

app = Flask(__name__)
app.secret_key = "aseu4a3fh375yaw3kjsddsafa3w95uhdsf"
app.url_map.strict_slashes = False

BLUEPRINTS = {
    "/": [index_bp, error_bp],
    "/user": [user_bp],
    "/auth": [auth_bp],
    "/student": [student_bp],
    "/teacher": [teacher_bp],
    "/subject": [subject_bp],
    "/class": [class_bp],
    "/dashboard": [dashboard_bp],
}


def register_bp(url_prefix, blueprint):
    app.register_blueprint(blueprint, url_prefix=url_prefix)


for url_prefix, blueprint_or_list in BLUEPRINTS.items():
    if isinstance(blueprint_or_list, list):
        for blueprint in blueprint_or_list:
            register_bp(url_prefix, blueprint)
    else:
        register_bp(url_prefix, blueprint_or_list)


if __name__ == "__main__":
    app.run(
        debug=True,
        host=os.getenv("backend_http_host"),
        port=os.getenv("backend_http_port"),
    )
