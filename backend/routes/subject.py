from flask import Blueprint, jsonify, request, abort


from models.user_model import User
from models.role_model import Role
from models.session_model import Session
from models.geo_ip_model import GeoIP
from models.subject_model import Subject
from models.learning_goal_model import LearningGoal
from models.snapshot_model import Snapshot
from models.keyword_model import Keyword
from models.score_model import Score
from models.taxonomy_level_model import TaxonomyLevel
from models.snapshot_model import Snapshot
from models.source_model import Source

from utils.response import response, handle_preflight
from utils.auth import check_authentication, remove_bearer

subject_bp = Blueprint("subject", __name__)


@subject_bp.route("/<id>", methods=["GET", "OPTIONS"])
def subject_get(id):
    if request.method == "OPTIONS":
        return handle_preflight()

    user = check_authentication(request.headers.get("Authorization"))
    if not user:
        abort(401)

    subject = Subject.get_by_id(id)
    learning_goals = LearningGoal.get_by_subject_id(subject_id=subject.subject_id)

    subject_object = {
        "id": subject.subject_id,
        "name": subject.name,
        "learning_goals": []
    }

    for learning_goal in learning_goals:
        subject_object["learning_goals"].append({
            "id": learning_goal.learning_goal_id,
            "title": learning_goal.title,
        })

    return response(jsonify({"status": "ok", "subject_object": subject_object})), 200


@subject_bp.route("/<id>/learning-goal/<learning_goal_id>", methods=["GET", "OPTIONS"])
def learning_goal_get(id, learning_goal_id):
    if request.method == "OPTIONS":
        return handle_preflight()

    user = check_authentication(request.headers.get("Authorization"))
    if not user:
        abort(401)

    user_role = Role.get_by_id(user.role_id)

    if not user:
        abort(401)

    if user_role.name == "teacher":
        student_id = request.args.get("s_id")
        db_user = User.get_by_id(student_id)
    else:
        db_user = User.get_by_id(user.user_id)

    learning_goal = LearningGoal.get_by_id(id=learning_goal_id)

    learning_goals_object = {
        "id": learning_goal.learning_goal_id,
        "title": learning_goal.title,
    }

    snapshots = Snapshot.snapshot_by_ids(student_id=db_user.user_id, learning_goal_id=learning_goal_id)

    all_snapshots = []

    for snapshot in snapshots:
        all_snapshots.append({
            "id": snapshot.snapshot_id,
            "date": snapshot.date,
            "source_id": snapshot.source_id,
            "source_type": []
        })

    for item in all_snapshots:
        s_id = (item.get("source_id"))
        type = Source.get_source(source_id=s_id)
        for t in type:
            item["source_type"].append({
                "type": t.type,
                "external_id": t.external_id
            })

    chart_data_object = []

    for snapshot in all_snapshots:
        avg_kennen = 0
        avg_kunnen = 0
        avg_confidence = 0
        avg_total = 0

        scores = Score.get_by_snapshot_id(snapshot["id"])
        count = len(scores)

        if count > 0:
            total_kennen = sum(score.kennen for score in scores)
            total_kunnen = sum(score.kunnen for score in scores)
            total_confidence = sum(score.confidence for score in scores)

            avg_kennen = total_kennen / count
            avg_kunnen = total_kunnen / count
            avg_confidence = total_confidence / count

        avg_total = ((avg_kennen + avg_kunnen) / 2)

        chart_data_object.append({
            "date": snapshot['date'],
            "kennen": avg_kennen,
            'kunnen': avg_kunnen,
            'confidence': avg_confidence,
            'avg': avg_total,
        })

    return response(
        jsonify({"status": "ok", "learning_goals_object": learning_goals_object, "all_snapshots": all_snapshots,
                 "chart_data_object": chart_data_object})), 200


@subject_bp.route("/<id>/learning-goal/<learning_goal_id>/strong-weak-points", methods=["GET", "OPTIONS"])
def weakpoints_and_strong_points_get(id, learning_goal_id):
    if request.method == "OPTIONS":
        return handle_preflight()

    user = check_authentication(request.headers.get("Authorization"))
    if not user:
        abort(401)

    user_role = Role.get_by_id(user.role_id)

    if not user:
        abort(401)

    if user_role.name == "teacher":
        student_id = request.args.get("s_id")
        db_user = User.get_by_id(student_id)
    else:
        db_user = User.get_by_id(user.user_id)

    learning_goal = LearningGoal.get_by_id(id=learning_goal_id)

    snapshots = Snapshot.get_by_lg_and_student_id(learning_goal_id=learning_goal.learning_goal_id,
                                                  student_id=db_user.user_id)

    keywords = Keyword.get_by_learning_goal_id(learning_goal_id=learning_goal.learning_goal_id)

    keyword_objects = []

    for keyword in keywords:
        keyword_objects.append({
            "id": keyword.keyword_id,
            "name": keyword.name,
        })

    if snapshots:
        snapshots_object = []

        for snapshot in snapshots:
            scores = Score.get_by_snapshot_id(snapshot_id=snapshot.snapshot_id)

            score_objects = []

            for score in scores:
                taxonomy = TaxonomyLevel.get_taxonomy_level(score.taxonomy_level_id)

                score_objects.append({
                    "id": score.score_id,
                    "taxonomy-level": taxonomy.name,
                    "kennen": score.kennen,
                    "kunnen": score.kunnen,
                    "confidence": score.confidence,
                })

            snapshots_object.append({
                "id": snapshot.snapshot_id,
                "date": snapshot.date,
                "student_id": snapshot.student_id,
                "scores": score_objects,
                "source": snapshot.source_id,
            })

        tax_scores_weak = calculate_weakpoints(snapshots_object)
        tax_scores_strong = calculate_strongpoints(snapshots_object)

        weakpoints_object = {
            "id": learning_goal.learning_goal_id,
            "snapshots_object": snapshots_object,
            "keywords": keyword_objects,
            "analyses": {
                "weakpoints": tax_scores_weak["weakpoints"],
                "strongpoints": tax_scores_strong["strongpoints"],
                "taxonomy_scores": tax_scores_weak["taxonomy_scores"],
                "overall_average": tax_scores_weak["overall_average"],
                "strongpoints_clearance_threshold": tax_scores_strong["strongpoints_clearance_threshold"],
                "weakpoints_clearance_threshold": tax_scores_weak["weakpoints_clearance_threshold"],
            }
        }
    else:
        weakpoints_object = {
            "id": learning_goal.learning_goal_id,
            "snapshots_object": None,
            "keywords": keyword_objects,
            "analyses": {
                "weakpoints": None,
                "strongpoints": None,
                "taxonomy_scores": None,
                "overall_average": None,
                "strongpoints_clearance_threshold": None,
                "weakpoints_clearance_threshold": None
            }
        }

    return response(jsonify({"status": "ok", "weakpoints_object": weakpoints_object})), 200


@subject_bp.route("/<class_id>/subject/<subject_id>/taxonomy_averages", methods=["GET", "OPTIONS"])
def get_taxonomy_averages(class_id, subject_id):
    
    if request.method == "OPTIONS":
        return handle_preflight()
    
    student_role_id = Role.get_id_by_name("student")

    students = User.get_students_by_class_id(class_id, student_role_id)

    student_ids = []

    for student in students:
        student_ids.append(student.user_id)
    
    learning_goals = LearningGoal.get_by_subject_id(subject_id=subject_id)

    goals = []
    
    for goal in learning_goals:
        goals.append({
            "learning_goal_id": goal.learning_goal_id,
            "title": goal.title,
            "scores": [],
            "weak_strong_averages": []
        })
        
    for goal in goals:    
        snapshots = Snapshot.get_by_lg(learning_goal_id=goal["learning_goal_id"])
        
        for snapshot in snapshots:
            
            if (snapshot.student_id) in student_ids:
                scores = Score.get_by_snapshot_id(snapshot_id=snapshot.snapshot_id)

                for score in scores:
                    taxonomy_level = TaxonomyLevel.get_taxonomy_level(score.taxonomy_level_id)
                    
                    goal["scores"].append({
                        "learning_goal_id": goal["learning_goal_id"],
                        "student_id": snapshot.student_id,
                        "score_id": score.score_id,
                        "snapshot_id": score.snapshot_id,
                        "taxonomy-level": taxonomy_level.name,
                        "kennen": score.kennen,
                        "kunnen": score.kunnen,
                        "confidence": score.confidence
                    })

    for goal in goals:
        tax_scores_weak = calculate_weakpoints_tax(goal["scores"])
        tax_scores_strong = calculate_strongpoints_tax(goal["scores"])

        goal["weak_strong_averages"].append({
                "id": goal["learning_goal_id"],
                "weakpoints": tax_scores_weak["weakpoints"],
                "strongpoints": tax_scores_strong["strongpoints"],
                "taxonomy_scores": tax_scores_weak["taxonomy_scores"],
                "overall_average": tax_scores_weak["overall_average"],
                "strongpoints_clearance_threshold": tax_scores_strong["strongpoints_clearance_threshold"],
                "weakpoints_clearance_threshold": tax_scores_weak["weakpoints_clearance_threshold"]    
            })

    return response(jsonify({"status": "ok", "goals": goals}))


@subject_bp.route("/snapshot/<snapshot_id>/scores", methods=["GET", "OPTIONS"])
def get_snapshot_scores(snapshot_id):
    if request.method == "OPTIONS":
        return handle_preflight()

    user = check_authentication(request.headers.get("Authorization"))
    if not user:
        abort(401)

    scores = Score.get_by_snapshot_id(snapshot_id=snapshot_id)

    score_objects = []

    for score in scores:
        taxonomy = TaxonomyLevel.get_taxonomy_level(score.taxonomy_level_id)

        score_objects.append({
            "taxonomy_level": taxonomy.name,
            "kennen": score.kennen,
            "kunnen": score.kunnen,
            "confidence": score.confidence
        })

    return response(jsonify({"status": "ok", "scores": score_objects})), 200


def calculate_weakpoints(snapshot_objects, threshold=0.05):
    """
    Calculate Weak Taxonomy Points based on a threshold
    :param snapshot_objects:
    :param threshold:
    threshold has a standard value of 0.05
    """

    taxonomy_scores = {}
    taxonomy_confidence = {}

    for snapshot in snapshot_objects:
        for score in snapshot["scores"]:
            level = score["taxonomy-level"]
            level_score = (score["kennen"] + score["kunnen"]) / 2
            confidence = score["confidence"]

            if level not in taxonomy_scores:
                taxonomy_scores[level] = 0
                taxonomy_confidence[level] = 0

            taxonomy_scores[level] += level_score * confidence
            taxonomy_confidence[level] += confidence

    taxonomy_avg = {}

    for level in taxonomy_scores:
        if taxonomy_confidence[level] > 0:
            taxonomy_avg[level] = taxonomy_scores[level] / taxonomy_confidence[level]
        else:
            taxonomy_avg[level] = 0

    overall_avg = sum(taxonomy_avg.values()) / len(taxonomy_avg)

    weakpoints = []

    clearance_threshold = overall_avg * (1 - threshold)

    for level, score in taxonomy_avg.items():
        if score < clearance_threshold:
            weakpoints.append({
                "taxonomy_level": level,
                "score": round(score, 3)
            })

    return {
        "taxonomy_scores": taxonomy_avg,
        "overall_average": overall_avg,
        "weakpoints_clearance_threshold": clearance_threshold,
        "weakpoints": weakpoints
    }

### calculate weakpoints for def get_taxonomy_averages
def calculate_weakpoints_tax(snapshot_objects, threshold=0.05):
    """
    Calculate Weak Taxonomy Points based on a threshold
    :param snapshot_objects:
    :param threshold:
    threshold has a standard value of 0.05
    """

    taxonomy_scores = {}
    taxonomy_confidence = {}

    for snapshot in snapshot_objects:
        
        level = snapshot["taxonomy-level"]
        level_score = (snapshot["kennen"] + snapshot["kunnen"]) / 2
        confidence = snapshot["confidence"]

        if level not in taxonomy_scores:
            taxonomy_scores[level] = 0
            taxonomy_confidence[level] = 0

        taxonomy_scores[level] += level_score * confidence
        taxonomy_confidence[level] += confidence

    taxonomy_avg = {}

    for level in taxonomy_scores:
        if taxonomy_confidence[level] > 0:
            taxonomy_avg[level] = taxonomy_scores[level] / taxonomy_confidence[level]
        else:
            taxonomy_avg[level] = 0

    overall_avg = sum(taxonomy_avg.values()) / len(taxonomy_avg)

    weakpoints = []

    clearance_threshold = overall_avg * (1 - threshold)

    for level, score in taxonomy_avg.items():
        if score < clearance_threshold:
            weakpoints.append({
                "taxonomy_level": level,
                "score": round(score, 3)
            })

    return {
        "taxonomy_scores": taxonomy_avg,
        "overall_average": overall_avg,
        "weakpoints_clearance_threshold": clearance_threshold,
        "weakpoints": weakpoints
    }

def calculate_strongpoints(snapshot_objects, threshold=0.20):
    """
    Calculate Strong Taxonomy Points based on a threshold
    :param snapshot_objects:
    :param threshold:
    threshold has a standard value of 0.20
    """

    taxonomy_scores = {}
    taxonomy_confidence = {}

    for snapshot in snapshot_objects:
        for score in snapshot["scores"]:
            level = score["taxonomy-level"]
            level_score = (score["kennen"] + score["kunnen"]) / 2
            confidence = score["confidence"]

            if level not in taxonomy_scores:
                taxonomy_scores[level] = 0
                taxonomy_confidence[level] = 0

            taxonomy_scores[level] += level_score * confidence
            taxonomy_confidence[level] += confidence

    taxonomy_avg = {}

    for level in taxonomy_scores:
        if taxonomy_confidence[level] > 0:
            taxonomy_avg[level] = taxonomy_scores[level] / taxonomy_confidence[level]
        else:
            taxonomy_avg[level] = 0

    overall_avg = sum(taxonomy_avg.values()) / len(taxonomy_avg)

    strongpoints = []

    clearance_threshold = overall_avg * (1 + threshold)

    for level, score in taxonomy_avg.items():
        if score > clearance_threshold:
            strongpoints.append({
                "taxonomy_level": level,
                "score": round(score, 3)
            })

    return {
        "taxonomy_scores": taxonomy_avg,
        "overall_average": overall_avg,
        "strongpoints_clearance_threshold": clearance_threshold,
        "strongpoints": strongpoints
    }

### calculate strongpoints for def get_taxonomy_averages
def calculate_strongpoints_tax(snapshot_objects, threshold=0.20):
    """
    Calculate Strong Taxonomy Points based on a threshold
    :param snapshot_objects:
    :param threshold:
    threshold has a standard value of 0.20
    """

    taxonomy_scores = {}
    taxonomy_confidence = {}

    for snapshot in snapshot_objects:
            
        level = snapshot["taxonomy-level"]
        level_score = (snapshot["kennen"] + snapshot["kunnen"]) / 2
        confidence = snapshot["confidence"]

        if level not in taxonomy_scores:
            taxonomy_scores[level] = 0
            taxonomy_confidence[level] = 0

        taxonomy_scores[level] += level_score * confidence
        taxonomy_confidence[level] += confidence

    taxonomy_avg = {}

    for level in taxonomy_scores:
        if taxonomy_confidence[level] > 0:
            taxonomy_avg[level] = taxonomy_scores[level] / taxonomy_confidence[level]
        else:
            taxonomy_avg[level] = 0

    overall_avg = sum(taxonomy_avg.values()) / len(taxonomy_avg)

    strongpoints = []

    clearance_threshold = overall_avg * (1 + threshold)

    for level, score in taxonomy_avg.items():
        if score > clearance_threshold:
            strongpoints.append({
                "taxonomy_level": level,
                "score": round(score, 3)
            })

    return {
        "taxonomy_scores": taxonomy_avg,
        "overall_average": overall_avg,
        "strongpoints_clearance_threshold": clearance_threshold,
        "strongpoints": strongpoints
    }