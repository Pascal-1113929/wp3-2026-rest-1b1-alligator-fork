import json
import os
import zipfile

from argon2 import PasswordHasher
from database.db import Base, engine
from models.class_model import Class
from models.class_subject_model import ClassSubject
from models.geo_ip_model import GeoIP
from models.keyword_model import Keyword
from models.learning_goal_model import LearningGoal
from models.role_model import Role
from models.score_model import Score
from models.session_model import Session
from models.snapshot_model import Snapshot
from models.source_model import Source
from models.subject_model import Subject
from models.taxonomy_level_model import TaxonomyLevel
from models.user_model import User
from sqlalchemy import insert
from sqlalchemy.orm import Session

print("------------------------------")
print("!!! Importing is not optimised and can take 5 to 10 minutes. Please wait... !!!")
print("------------------------------")

ph = PasswordHasher(memory_cost=65536, time_cost=4, parallelism=2)

Base.metadata.create_all(engine)
session = Session(engine)

print("prepare data...")
path = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(path, "..", "data")
data_json_sample = os.path.join(data_path, "data-sample.json")
data_csv_geoip = os.path.join(data_path, "IP2LOCATION-LITE-DB3.CSV")

if not os.path.exists(data_json_sample):
    zip_file = os.path.join(data_path, "data-sample.zip")
    with zipfile.ZipFile(zip_file, "r") as zip_ref:
        zip_ref.extractall(os.path.join(data_path))

if not os.path.exists(data_csv_geoip):
    zip_file = os.path.join(data_path, "IP2LOCATION-LITE-DB3.CSV.zip")
    with zipfile.ZipFile(zip_file, "r") as zip_ref:
        zip_ref.extractall(os.path.join(data_path))


with open(data_json_sample, "r") as file:
    data = json.load(file)

# class generator
print("import class data...")
letters = "ABCDEF"
numbers = range(1, 6)
for letter in letters:
    for number in numbers:
        Class.insert(session, name=f"{letter}{number}")

# role generator
print("import user data...")
roles = ["admin", "teacher", "student"]
for role in roles:
    Role.insert(session, name=role)
# generate first 2 users to be the teacher and admin
User.insert(
    session,
    user_id=1,
    email="admin@testdata.nl",
    password=ph.hash("testadmin"),
    name="Test Admin",
    role_id=1,  # 1 = admin, 2 = teacher, 3 = student
    class_id=None,
)
User.insert(
    session,
    user_id=2,
    email="teacher@testdata.nl",
    password=ph.hash("testteacher"),
    name="Test Teacher",
    role_id=2,  # 1 = admin, 2 = teacher, 3 = student
    class_id=None,
)


# main loop variables
seen_subject_ids = []
seen_user_ids = []
seen_source_ids = []
seen_learning_goal_ids = []
seen_taxonomy_level_ids = []
seen_snapshot_ids = []

user_class_index = 1
source_id_index = 1
snapshot_id_index = 1

print("import main entries...")
total_entries = len(data["entries"])
for i, entry in enumerate(data["entries"]):
    print(f"Processing entry {i + 1} out of {total_entries}")
    # user table generator
    user_id = entry["student"]["id"] + 2  # offset for admin and teacher
    user_class_id = None
    if user_id not in seen_user_ids:
        seen_user_ids.append(user_id)
        user_class_index += 1
        user_class_id = (
            user_class_index % 2
        ) + 1  # only select 2 classes due limited user count
        User.insert(
            session,
            user_id=user_id,
            email=f"{entry['student']['name'].lower()}{entry['student']['id']}@testdata.nl",
            password=ph.hash("teststudent"),
            name=entry["student"]["name"],
            role_id=3,  # 1 = admin, 2 = teacher, 3 = student
            class_id=user_class_id,
        )
    else:
        # find user
        user = session.query(User).filter(User.user_id == user_id).first()
        user_class_id = user.class_id

    # subject table generator
    subject_id = entry["subject"]["id"]
    if subject_id not in seen_subject_ids:
        seen_subject_ids.append(subject_id)
        Subject.insert(
            session,
            subject_id=subject_id,
            name=entry["subject"]["name"],
        )

    for learning_goal in entry["learningGoals"]:
        # learning goal table generator
        learning_goal_id = learning_goal["id"]
        if learning_goal_id not in seen_learning_goal_ids:
            seen_learning_goal_ids.append(learning_goal_id)
            LearningGoal.insert(
                session,
                learning_goal_id=learning_goal_id,
                title=learning_goal["title"],
                subject_id=entry["subject"]["id"],
            )

            # keywords table generator
            for keyword in learning_goal["keywords"]:
                Keyword.insert(session, name=keyword, learning_goal_id=learning_goal_id)

        for snapshot in learning_goal["snapshots"]:
            if str(user_id) + "_" + snapshot["at"] not in seen_snapshot_ids:
                seen_snapshot_ids.append(str(user_id) + "_" + snapshot["at"])
                # sources table generator
                Source.insert(
                    session,
                    source_id=source_id_index,
                    type=snapshot["source"]["type"],
                    external_id=snapshot["source"]["id"],
                )

                # snapshot table generator
                Snapshot.insert(
                    session,
                    snapshot_id=snapshot_id_index,
                    learning_goal_id=learning_goal_id,
                    date=snapshot["at"],
                    student_id=user_id,
                    source_id=source_id_index,
                )

                for taxonomy in snapshot["taxonomy"]:
                    # taxonomy level table generator
                    if taxonomy["level"] not in seen_taxonomy_level_ids:
                        seen_taxonomy_level_ids.append(taxonomy["level"])
                        TaxonomyLevel.insert(
                            session,
                            name=taxonomy["level"],
                        )

                    # score table generator
                    Score.insert(
                        session,
                        snapshot_id=snapshot_id_index,
                        taxonomy_level_id=session.query(TaxonomyLevel.taxonomy_level_id)
                        .filter(TaxonomyLevel.name == taxonomy["level"])
                        .scalar(),
                        kennen=taxonomy["kennen"],
                        kunnen=taxonomy["kunnen"],
                        confidence=taxonomy["confidence"],
                    )
                source_id_index += 1
                snapshot_id_index += 1

            # class subject table generator
            ClassSubject.insert(
                session,
                class_id=user_class_id,
                subject_id=entry["subject"]["id"],
                teacher_id=2,  # hardcoded teacher ID
            )


# geo ip table generator
print("import ip geo data...")
with open(data_csv_geoip, "r") as csv_file:
    for line in csv_file:
        parts = line.strip().split(",")
        ip_from, ip_to, country_code, country_name, region_name, city_name = (
            parts[0],
            parts[1],
            parts[2],
            parts[3],
            parts[4],
            parts[5],
        )
        GeoIP.insert(
            session,
            ip_from=ip_from.strip('"'),
            ip_to=ip_to.strip('"'),
            country_code=country_code.strip('"'),
            country_name=country_name.strip('"'),
            region_name=region_name.strip('"'),
            city_name=city_name.strip('"'),
        )

print("Commiting data...")
session.commit()
