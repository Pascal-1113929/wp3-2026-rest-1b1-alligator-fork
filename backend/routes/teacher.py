from flask import Blueprint, jsonify, request, abort
from sqlalchemy.orm import Session
from sqlalchemy import text
from database.db import engine

from models.user_model import User
from models.class_model import Class
from models.class_subject_model import ClassSubject
from models.subject_model import Subject
from models.learning_goal_model import LearningGoal
from models.snapshot_model import Snapshot
from models.role_model import Role
from models.score_model import Score
from models.taxonomy_level_model import TaxonomyLevel

from utils.auth import check_authentication, remove_bearer
from utils.response import handle_preflight, response

import ollama
import os

teacher_bp = Blueprint("teacher", __name__)


@teacher_bp.route("/<class_id>/subject", methods=["GET", "OPTIONS"])
def subjects(class_id):
    if request.method == "OPTIONS":
        return handle_preflight()

    token = remove_bearer(request.headers.get("Authorization"))
    user = check_authentication(token)

    if not user:
        abort(401)

    teacher_subjects = ClassSubject.subjects_for_teacher(user.user_id, class_id)

    all_subjects = []

    for subject in teacher_subjects:
        subjects = Subject.get_by_id(subject.subject_id)

        if teacher_subjects is None:
            return response(
                jsonify(
                    {
                        "status": "error",
                        "message": "Er kunnen geen vakken gevonden worden.",
                    }
                )
            ), 404

        all_subjects.append({"id": subjects.subject_id, "name": subjects.name})

    return response(jsonify({"status": "ok", "all_subjects": all_subjects})), 200


@teacher_bp.route("/<class_id>/subject/<subject_id>", methods=["GET", "OPTIONS"])
def class_subject_validation(class_id, subject_id):
    if request.method == "OPTIONS":
        return handle_preflight()

    token = remove_bearer(request.headers.get("Authorization"))
    user = check_authentication(token)

    if not user:
        abort(401)

    class_subject = ClassSubject.get_by_class_and_subject_id(class_id, subject_id)

    if not class_subject:
        return response(
            jsonify({"status": "error", "message": "class_subject not found"})
        ), 404

    else:
        return response(
            jsonify(
                {
                    "status": "ok",
                }
            )
        ), 200


@teacher_bp.route(
    "/<class_id>/subject/<subject_id>/class-overview", methods=["GET", "OPTIONS"]
)
def class_overview(class_id, subject_id):
    if request.method == "OPTIONS":
        return handle_preflight()

    class_ = Class.get_by_id(class_id)

    if not class_:
        return response(jsonify({"status": "error", "message": "Class not found"})), 404

    student_role_id = Role.get_id_by_name("student")

    students = User.get_students_by_class_id(class_id, student_role_id)

    class_object = {"id": class_id, "name": class_.name, "students": []}

    learning_goals = LearningGoal.get_by_subject_id(subject_id)

    for student in students:
        class_object["students"].append(
            {
                "id": student.user_id,
                "name": student.name,
            }
        )

    student_list = class_object["students"]

    student_averages = []
    class_avg = {}

    class_total_kennen = 0
    class_total_kunnen = 0
    class_total_confidence = 0
    class_count_scores = 0

    class_weighted_total = 0
    class_total_weight = 0

    for student in student_list:
        total_kennen = 0
        total_kunnen = 0
        total_confidence = 0
        count_scores = 0

        weighted_total = 0
        total_weight = 0

        for learning_goal in learning_goals:
            raw_snapshots = Snapshot.get_by_lg_and_student_id(
                learning_goal_id=learning_goal.learning_goal_id,
                student_id=student["id"],
            )

            for raw_snapshot in raw_snapshots:
                scores = Score.get_by_snapshot_id(snapshot_id=raw_snapshot.snapshot_id)

                for score in scores:
                    total_kennen += score.kennen
                    total_kunnen += score.kunnen
                    total_confidence += score.confidence
                    count_scores += 1

                    class_total_kennen += score.kennen
                    class_total_kunnen += score.kunnen
                    class_total_confidence += score.confidence
                    class_count_scores += 1

                    avg_kk = (score.kennen + score.kunnen) / 2

                    weighted_total += avg_kk * score.confidence
                    total_weight += score.confidence

                    class_weighted_total += avg_kk * score.confidence
                    class_total_weight += score.confidence

        if count_scores > 0:
            overall_avg = round(weighted_total / total_weight, 2)

            student_averages.append(
                {
                    "student_id": student["id"],
                    "name": student["name"],
                    "kennen": round(total_kennen / count_scores, 2),
                    "kunnen": round(total_kunnen / count_scores, 2),
                    "confidence": round(total_confidence / count_scores, 2),
                    "overall_avg": overall_avg,
                }
            )
        else:
            student_averages.append(
                {
                    "student_id": student["id"],
                    "name": student["name"],
                    "avg_kennen": 0,
                    "avg_kunnen": 0,
                    "avg_confidence": 0,
                    "overall_avg": 0,
                }
            )

    if class_count_scores > 0 and class_total_weight > 0:
        class_avg = {
            "kennen": round(class_total_kennen / class_count_scores, 2),
            "kunnen": round(class_total_kunnen / class_count_scores, 2),
            "confidence": round(class_total_confidence / class_count_scores, 2),
            "overall_avg": round(class_weighted_total / class_total_weight, 2),
        }
    else:
        class_avg = {"kennen": 0, "kunnen": 0, "confidence": 0, "overall_avg": 0}

    student_data = []
    for student in student_averages:
        student_status_data = calculate_student_status(
            student["overall_avg"], class_avg["overall_avg"]
        )
        student_data.append(
            {
                "student_id": student["student_id"],
                "name": student["name"],
                "kennen": student["kennen"],
                "kunnen": student["kunnen"],
                "confidence": student["confidence"],
                "overall_avg": student["overall_avg"],
                "status": student_status_data["status"],
                "weak_clearance_threshold": student_status_data[
                    "weak_clearance_threshold"
                ],
                "strong_clearance_threshold": student_status_data[
                    "strong_clearance_threshold"
                ],
            }
        )

    return response(jsonify({"status": "ok", "students": student_data})), 200


def calculate_student_status(
    student_avg, class_avg, weak_threshold=0.05, stronger_threshold=0.20
):
    weak_clearance_threshold = class_avg * (1 - weak_threshold)
    strong_clearance_threshold = class_avg * (1 + stronger_threshold)
    student_status = ""

    if student_avg < weak_clearance_threshold:
        student_status = "weak"
    elif student_avg > strong_clearance_threshold:
        student_status = "strong"

    return {
        "status": student_status,
        "weak_clearance_threshold": weak_clearance_threshold,
        "strong_clearance_threshold": strong_clearance_threshold,
    }


@teacher_bp.route(
    "/<class_id>/subject/<subject_id>/problematic-topics", methods=["GET", "OPTIONS"]
)
def problematic_goals(class_id, subject_id):
    if request.method == "OPTIONS":
        return handle_preflight()

    with Session(engine) as session:
        query = """
        SELECT k.keyword_id, k.name, AVG(sc.kennen) AS avg_kennen, AVG(sc.kunnen) AS avg_kunnen,
               AVG(sc.confidence) AS avg_confidence
        FROM keyword k
        JOIN learning_goal lg ON k.learning_goal_id = lg.learning_goal_id
        JOIN snapshot sn ON sn.learning_goal_id = lg.learning_goal_id
        JOIN score sc ON sc.snapshot_id = sn.snapshot_id
        JOIN user u ON sn.student_id = u.user_id
        WHERE u.class_id = :class_id
        AND lg.subject_id = :subject_id
        GROUP BY k.keyword_id, k.name
        ORDER BY (AVG(sc.kennen) + AVG(sc.kunnen) + AVG(sc.confidence)) / 3 ASC
        """

        topics = (
            session.execute(
                text(query), {"class_id": class_id, "subject_id": subject_id}
            )
            .mappings()
            .all()
        )

    result = []

    for t in topics:
        avg_total = (t["avg_kennen"] + t["avg_kunnen"] + t["avg_confidence"]) / 3

        result.append(
            {
                "keyword_id": t["keyword_id"],
                "title": t["name"],
                "kennen": round(t["avg_kennen"], 2),
                "kunnen": round(t["avg_kunnen"], 2),
                "confidence": round(t["avg_confidence"], 2),
                "average": round(avg_total, 2),
            }
        )

    return response(jsonify({"status": "ok", "topics": result})), 200


@teacher_bp.route(
    "/<class_id>/subject/<subject_id>/learning-goal_overview",
    methods=["GET", "OPTIONS"],
)
def learning_goal_overview(class_id, subject_id):
    if request.method == "OPTIONS":
        return handle_preflight()

    token = remove_bearer(request.headers.get("Authorization"))
    user = check_authentication(token)

    if not user:
        abort(401)

    with Session(engine) as session:
        query = """
        SELECT lg.learning_goal_id, lg.title, AVG(sc.kennen) AS avg_kennen, AVG(sc.kunnen) AS avg_kunnen,
               AVG(sc.confidence) AS avg_confidence
        FROM learning_goal AS lg
        JOIN snapshot AS sn ON sn.learning_goal_id = lg.learning_goal_id
        JOIN score AS sc ON sn.snapshot_id = sc.snapshot_id
        JOIN user AS u ON sn.student_id = u.user_id
        WHERE u.class_id = :class_id AND lg.subject_id = :subject_id
        GROUP BY lg.learning_goal_id, lg.title
        ORDER BY lg.learning_goal_id
        """
        learning_goals_averages = (
            session.execute(
                text(query), {"class_id": class_id, "subject_id": subject_id}
            )
            .mappings()
            .all()
        )

        averages = []

        for average in learning_goals_averages:
            overall_avg = (
                average["avg_kennen"]
                + average["avg_kunnen"]
                + average["avg_confidence"]
            ) / 3
            averages.append(
                {
                    "learning_goal_id": average["learning_goal_id"],
                    "learning_goal_title": average["title"],
                    "avg_kennen": round(average["avg_kennen"], 2),
                    "avg_kunnen": round(average["avg_kunnen"], 2),
                    "avg_confidence": round(average["avg_confidence"], 2),
                    "overall_avg": round(overall_avg, 2),
                }
            )

    return response(jsonify({"staus": "ok", "averages": averages}))


@teacher_bp.route(
    "/<class_id>/subject/<subject_id>/ai-lesson-suggestions", methods=["GET", "OPTIONS"]
)
def ai_lesson_suggestions(class_id, subject_id):
    if request.method == "OPTIONS":
        return handle_preflight()

    token = remove_bearer(request.headers.get("Authorization"))
    user = check_authentication(token)

    if not user:
        abort(401)

    with Session(engine) as session:
        # I'm giving up on ORM for this type of query, I'll use raw SQL instead...
        topics_query = """
        SELECT k.keyword_id, k.name, AVG(sc.kennen) AS avg_kennen, AVG(sc.kunnen) AS avg_kunnen, AVG(sc.confidence) AS avg_confidence
        FROM keyword k
        JOIN learning_goal lg ON k.learning_goal_id = lg.learning_goal_id
        JOIN snapshot sn ON sn.learning_goal_id = lg.learning_goal_id
        JOIN score sc ON sc.snapshot_id = sn.snapshot_id
        JOIN user u ON sn.student_id = u.user_id
        WHERE u.class_id = :class_id
        AND lg.subject_id = :subject_id
        GROUP BY k.keyword_id, k.name
        ORDER BY (AVG(sc.kennen) + AVG(sc.kunnen) + AVG(sc.confidence)) / 3 ASC
        LIMIT 5
        """

        topics = (
            session.execute(
                text(topics_query), {"class_id": class_id, "subject_id": subject_id}
            )
            .mappings()
            .all()
        )

        subject_query = "SELECT name FROM subject WHERE subject_id = :subject_id"
        subject_result = (
            session.execute(text(subject_query), {"subject_id": subject_id})
            .mappings()
            .first()
        )

        # Get class name
        class_query = "SELECT name FROM class WHERE class_id = :class_id"
        class_result = (
            session.execute(text(class_query), {"class_id": class_id})
            .mappings()
            .first()
        )

    if not topics:
        return response(
            jsonify(
                {
                    "status": "ok",
                    "suggestions": [
                        "Niet genoeg data beschikbaar om AI-suggesties te genereren."
                    ],
                }
            )
        ), 200

    subject_name = subject_result["name"] if subject_result else "het vak"
    class_name = class_result["name"] if class_result else "de klas"

    problematic_topics = []
    for topic in topics:
        avg_total = (
            topic["avg_kennen"] + topic["avg_kunnen"] + topic["avg_confidence"]
        ) / 3
        problematic_topics.append(
            {
                "topic": topic["name"],
                "kennen": round(topic["avg_kennen"], 2),
                "kunnen": round(topic["avg_kunnen"], 2),
                "confidence": round(topic["avg_confidence"], 2),
                "average": round(avg_total, 2),
            }
        )

    prompt = f"""Je bent een ervaren onderwijsassistent die lesideeën suggereert voor docenten.

Context:
- Vak: {subject_name}
- Klas: {class_name}
- Problematische onderwerpen (laagste scores):

"""

    for i, topic in enumerate(problematic_topics, 1):
        prompt += f"{i}. {topic['topic']} - Kennen: {topic['kennen']}, Kunnen: {topic['kunnen']}, Confidence: {topic['confidence']}, Gemiddelde: {topic['average']}\n"

    prompt += """
Geef 3 concrete lesideeën om deze problematische onderwerpen aan te pakken. Focus op:
1. Differentiatie voor verschillende niveaus
2. Actieve werkvormen
3. Formatieve assessment technieken

Formaat: Geef elke suggestie als een genummerde lijst met:
- Titel van de lesactiviteit
- Doel van de activiteit
- Benodigde tijd
- Materialen
- Stapsgewijze instructies
- Differentiatie mogelijkheden

Voorbeeld:
1. Titel:
Doel:
Benodigde tijd:
Materialen:
Stapsgewijze instructies:
Differentiatie mogelijkheden:


Antwoord in het Nederlands. Deze data wordt geparst, dus houd je strikt aan het gevraagde format zonder extra inleiding, uitleg of afsluitende tekst.
gebruik geen markdown symbols.
"""

    try:
        client = ollama.Client(
            host=os.getenv("backend_ollama_host"),
        )
        response_ollama = client.chat(
            model=os.getenv("backend_ollama_model"),
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            think=False,
        )

        ai_response = response_ollama["message"]["content"]

        suggestions = []
        current_suggestion = ""
        lines = ai_response.split("\n")

        for line in lines:
            if (
                line.strip().startswith(("1.", "2.", "3.", "4.", "5."))
                and current_suggestion
            ):
                suggestions.append(current_suggestion.strip())
                current_suggestion = line + "\n"
            else:
                current_suggestion += line + "\n"

        if current_suggestion:
            suggestions.append(current_suggestion.strip())

        if not suggestions or len(suggestions) < 2:
            suggestions = [ai_response]

        return response(
            jsonify(
                {
                    "status": "ok",
                    "suggestions": suggestions[:3],
                    "problematic_topics": problematic_topics,
                }
            )
        ), 200

    except Exception as e:
        print(f"Ollama error: {e}")
        return response(
            jsonify(
                {
                    "status": "error",
                    "message": "Kon geen AI-suggesties genereren. Controleer of Ollama draait.",
                    "suggestions": [
                        "Probeer de Ollama service te starten of contacteer de systeembeheerder."
                    ],
                }
            )
        ), 500
