# API Documentatie

## Format

[Method] [URL Endpoint]

Responses
200

```json
"example": {
  "example_name": "name1",
  "example_discription": "disc nr one",
}
```

404

```json
"error": "not found"
```

### Example

GET /student/[student_id]/subject

Responses
200

```json
"example": {
  "student_name": "Jan",
  "subject_name": "subject",
}
```

404

```json
"error": "not found"
```

## Routes

GET /status

Responses
200

```json
{
    "status": "ok"
}
```

## Login

```http
POST /auth/login
```

### Request

**Headers:**

```http
"Content-Type": "application/json"
```

**Body:**

```json
{
    "username": "<username>",
    "password": "<password>"
}
```

### Responses

**200** - _De gebruiker is succesvol ingelogd._

```json
{
    "status": "ok",
    "token": "<token>",
    "user_object": {
        "user_id": "<uid>",
        "email": "<email>",
        "name": "<name>",
        "role": {
            "id": "<role_id>",
            "role": "<role_name>"
        }
    }
}
```

**400** - _Als een van de velden leeg zijn, dit is meer een failsafe omdat de client deze velden vereist en je niet deze leeg kan sturen._

```json
{
    "status": "error",
    "message": "Gebruikersnaam en wachtwoord zijn vereist"
}
```

**401** - _Als de gebruikersnaam of wachtwoord niet geldig zijn._

```json
{
    "status": "error",
    "message": "Ongeldige inloggegevens"
}
```

## Logout

```http
GET /auth/logout
```

### Request

**Headers:**

```http
"Content-Type": "application/json"
"Authorization": "Bearer <token>"
```

### Responses

**200** - _Successvol uitgelogd._

```json
{
    "status": "ok"
}
```

## Get user profile

```http
GET /user
```

### Request

**Headers:**

```http
"Content-Type": "application/json"
"Authorization": "Bearer <token>"
```

### Responses

**200** - _User object._

```json
{
    "status": "ok",
    "user_object": {
        "id": "<user_id>",
        "email": "<email>",
        "name": "<name>",
        "role": {
            "id": "<role_id>",
            "role": "<role_name>"
        }
    }
}
```

## Get user sessions

```http
GET /user/sessions
```

### Request

**Headers:**

```http
"Content-Type": "application/json"
"Authorization": "Bearer <token>"
```

### Responses

**200** - _session object._

```json
{
    "status": "ok",
    "session_object": [
        {
            "id": "<session_id>",
            "last_seen": "<last_seen>",
            "first_login": "<first_login>",
            "device": "<user_agent>",
            "location": "<geo>",
            "is_this_device": "<is_this_device>"
        },
        ...
    ]
}
```

## Delete user sessions

```http
DELETE /user/sessions/<session_id>
```

### Request

**Headers:**

```http
"Content-Type": "application/json"
"Authorization": "Bearer <token>"
```

### Responses

**200** - _Successvol verwijderd._

```json
{
    "status": "ok"
}
```

## Fetch student subjects

```http
GET /student/subject
```

### Request

**Headers:**

```http
"Content-Type": "application/json"
"Authorization": "Bearer <token>"
```

### Responses

**200** - _Data Opgehaald._

```json
{
    "status": "ok",
    "subjects": {
        "id": "subject ID",
        "name": "subject name"
    }
}
```

### Responses

**404** - _Klas niet gevonden._

```json
{
    "status": "error",
    "message": "Klas kan niet worden gevonden contacteer een beheerder"
}
```

### Responses

**404** - _Vak niet gevonden._

```json
{
    "status": "error",
    "message": "Dit Vak kan niet worden gevonden contacteer een beheerder"
}
```

## Fetch subject

```http
GET /subject/<subjectID>
```

### Request

**Headers:**

```http
"Content-Type": "application/json"
```

### Responses

**200** - _Subject opgehaald._

```json
{
    "status": "ok",
    "subject_object": {
        "id": "subject id",
        "name": "subject name",
        "learning_goals": [
            {
                "id": "id1",
                "title": "title1"
            },
            {
                "id": "id2",
                "title": "title2"
            }
        ]
    }
}
```

## Fetch Learning Goal

```http
GET /subject/<subjectID>/learning-goal/<learning_goalID>
```

### Request

**Headers:**

```http
Content-Type: application/json
Authorization: Bearer <token>
```

**Query Parameters (for teachers only):**

| Parameter | Type   | Description                         |
| --------- | ------ | ----------------------------------- |
| s_id      | string | ID of the student to fetch data for |

### Response

**200 OK** – *Learning goal retrieved successfully.*

```json
{
    "status": "ok",
    "learning_goals_object": {
        "id": "id1",
        "title": "title1"
    },
    "all_snapshots": [
        {
            "id": "snapshotID",
            "date": "snapshotDate",
            "source_id": "sourceID",
            "source_type": [
                {
                    "type": "sourceType",
                    "external_id": "externalID"
                }
            ]
        }
    ],
    "chart_data_object": [
        {
            "date": "snapshotDate",
            "kennen": 0.0,
            "kunnen": 0.0,
            "confidence": 0.0,
            "avg": 0.0
        }
    ]
}
```

## Fetch Teacher Subjects

```http
GET /teacher/subject
```

## Request

**Headers:**

```http
"Content-Type": "application/json"
"Authorization": "Bearer <token>"
```

### Responses

**200** - _Data Opgehaald._

```json
{
    "status": "ok",
    "all_subjects": {
        "id": "subject ID",
        "name": "subject name"
    }
}
```

### Responses

**404** - _Geen vakken gevonden._

```json
{
    "status": "error",
    "message": "Er kunnen geen vakken gevonden worden."
}
```

## Validate class subject

```http
GET /teacher/<classID>/subject/<subjectID>
```

### Request

**Headers:**

```http
"Content-Type": "application/json"
"Authorization": "Bearer <token>"
```

### Responses

**200** - _Class subject valid._

```json
{
    "status": "ok"
}
```

**404** - _Class subject not found._

```json
{
    "status": "error",
    "message": "class_subject not found"
}
```

## Fetch class

```http
GET /class/<classID>
```

### Request

**Headers:**

```http
"Content-Type": "application/json"
```

### Responses

**200** - _Class opgehaald._

```json
{
    "status": "ok",
    "class_object": {
        "id": "classID",
        "name": "class name",
        "students": [
            {
                "id": "studentID1",
                "name": "student name1"
            },
            {
                "id": "studentID2",
                "name": "student name2"
            }
        ]
    }
}
```

**404** - _Class not found._

```json
{
    "status": "error",
    "message": "Class not found"
}
```

## Fetch Weakpoints and Strongpoints for Learning Goal

```http
GET /subject/<subjectID>/learning-goal/<learning_goalID>/weakpoints
```

## Request

**Headers:**

```http
"Content-Type": "application/json"
"Authorization": "Bearer <token>"
```

### Responses

**200** - _Weakpoints en strongpoints van het leerdoel opgehaald._

```json
{
  "status": "ok",
  "weakpoints_object": {
    "id": "learning_goal_id",
    "snapshots_object": [
      {
        "id": "snapshot_id",
        "date": "2025-01-01",
        "student_id": "student_id",
        "scores": [
          {
            "id": "score_id",
            "taxonomy-level": "Analyseren",
            "kennen": 0.3,
            "kunnen": 0.4,
            "confidence": 0.5
          }
        ],
        "source": "source_id"
      }
    ],
    "keywords": [
      {
        "id": "keyword_id",
        "name": "keyword_name"
      }
    ],
    "analyses": {
      "weakpoints": [
        {
          "taxonomy_level": "Onthouden",
          "average_score": 0.1
        }
      ],
      "strongpoints": [
        {
          "taxonomy_level": "Analyseren",
          "average_score": 0.5
        }
      ],
      "taxonomy_scores": {
        "Onthouden": 0.1,
        "Begrijpen": 0.2,
        "Toepassen": 0.8,
        "Analyseren": 0.5
      },
      "overall_average": 0.4,
      "strongpoints_clearance_threshold": 0.0,
      "weakpoints_clearance_threshold": 0.0
    }
  }
}
```

**200** _(No snapshots available)_

```json
{
  "status": "ok",
  "weakpoints_object": {
    "id": "learning_goal_id",
    "snapshots_object": null,
    "keywords": [
      {
        "id": "keyword_id",
        "name": "keyword_name"
      }
    ],
    "analyses": {
      "weakpoints": null,
      "strongpoints": null,
      "taxonomy_scores": null,
      "overall_average": null,
      "strongpoints_clearance_threshold": null,
      "weakpoints_clearance_threshold": null
    }
  }
}
```

## Fetch Class Overview

```http
GET /teacher/<classID>/subject/<subjectID>/class-overview
```

### Request

**Headers:**

```http
"Content-Type: "application/json"
```

### Responses

**200** - _Gemiddelde scores per leerling voor dit vak._

```json
{
  "status: : "ok",
  "students" : [
    "status": "ok",
    "students": [
        {
            "student_id": "studentID",
            "name": "student name",
            "kennen": 0.52,
            "kunnen": 0.48,
            "confidence": 0.6
        }
    ]
}
```

## Fetch Teacher Classes

```http
GET /class
```

### Request

**Headers:**

```http
"Content-Type": "application/json"
"Authorization": "Bearer <token>"
```

### Responses

**200** - _Teacher classes fetched successfully._

```json
{
    "status": "ok",
    "teacher_classes": [
        {
            "id": "classID1",
            "name": "class name1"
        },
        {
            "id": "classID2",
            "name": "class name2"
        }
    ]
}
```

**404** - _No classes found for teacher._

```json
{
    "status": "error",
    "message": "Er kunnen geen vakken gevonden worden."
}
```

**401** - _Unauthorized._

```json
{
    "status": "error",
    "message": "Unauthorized"
}
```

## Fetch Student Subject Class Data

```http
GET /class/<class_id>/subject/<subject_id>/class-overview
```

### Request

**Headers:**

```http
"Content-Type": "application/json"
"Authorization": "Bearer <token>"
```

### Responses

***200*** - _Data_
```json
{
  "status": "ok",
  "students": [
    {
      "student-id" : "studentID",
      "name" : "student name",
      "kennen" : 0.30,
      "kunnen" : 0.48,
      "confidence" : 0.60,
      "overall_avg": 0.40,
      "status": "weak",
      "weak_clearance_threshold": "0.41",
      "strong_clearance_threshold": "0.61"
    },
    {
      "student-id" : "studentID2",
      "name" : "student name2",
      "kennen" : 0.52,
      "kunnen" : 0.70,
      "confidence" : 0.65,
      "overall_avg": 0.65,
      "status": "strong",
      "weak_clearance_threshold": "0.41",
      "strong_clearance_threshold": "0.61"
    },
    {
      "student-id" : "studentID3",
      "name" : "student name3",
      "kennen" : 0.52,
      "kunnen" : 0.58,
      "confidence" : 0.55,
      "overall_avg": 0.55,
      "status": "",
      "weak_clearance_threshold": "0.41",
      "strong_clearance_threshold": "0.61"
    }
  ]
}
```
```

## Fetch Problematic Topics

```http
GET /teacher/<classID>/subject/<subjectID>/problematic-topics
```

## Request

**Headers:**

```http
"Content-Type": "application/json"
```

### Responses

**200** - _Onderwerpen van laagst naar hoogste score._

```json
{
  "status": "ok",
  "topics": [
    {
      "keyword_id": "keywordID",
      "title": "keyword name",
      "kennen": 0.30,
      "kunnen": 0.25,
      "confidence": 0.40,
      "average": 0.32
    }
  ]
}
```
## Fetch Snapshot Scores

```http
GET /subject/snapshot/<snapshot_id>/scores
```

### Request

**Headers:**

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Responses

**200** - _Scores per taxonomieniveau voor een specifieke snapshot._

```json
{
  "status": "ok",
  "scores": [
    {
      "taxonomy_level": "Onthouden",
      "kennen": 0.65,
      "kunnen": 0.60,
      "confidence": 0.80
    },
    {
      "taxonomy_level": "Toepassen",
      "kennen": 0.55,
      "kunnen": 0.50,
      "confidence": 0.70
    }
  ]
}
```

**401** - _Unauthorized._

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

## Fetch learning goals averages
```http
GET /teacher/<classID>/subject/<subjectID>/learning-goal_overview
```

## Requests
```http
"Content-Type": "application/json"
"Authorization": "Bearer <token>"
```

## Responses
**200** - _Gemiddeldes van leerdoelen._

```json
{
  "status": "ok",
  "averages": [
    {
      "learning_goal_id": "learningGoal_id",
      "title": "learning_goal_title",
      "kennen": "avg_kennen",
      "kunnen": "avg_kunnen",
      "confidence": "avg_confidence",
      "overall_average": "(avg_kennen + avg_kunnen + avg_confidence) / 3"
    }
  ]
}
```
**401** - _Unauthorized._

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

## Fetch averages and strong/weak points for all learninggoals/tax. levels

```http
GET /subject/<classId>/subject/<subjectId>/taxonomy_averages
```

### Request

**Headers:**

```http
"Content-Type": "application/json"
```

### Responses

***200*** - _Gemiddeldes en scores van leerdoelen en tax. levels_
```json
{
  "status": "ok",
  "goals": [
    {
      "learning_goal_id": "learning_goal_id",
      "title": "learning_goal_title",
      "scores": [{
        "confidence": "confidence_score",
        "kennen": "kennen_score",
        "kunnen": "kunnen_score",
        "learning_goal_id": "learning_goal_id",
        "score_id": "score_id",
        "snapshot_id": "snapshot_id",
        "student_id": "student_id",
        "taxonomy_level": "taxonomy_level"
      }],
      "weak_strong_averages": [{
        "id": "learning_goal_id",
        "overall_average": "overall_average",
        "strongpoints": [{
          "taxonomy_level": "taxonomy_level",
          "score": "score"
        }],
        "strongpoints_clearance_threshold": "strongpoints_threshold",
        "taxonomy_scores" [{
          "analyseren": "score_analyseren",
          "begrijpen": "score_begrijpen",
          "onthouden": "score_onthouden",
          "toepassen": "score_toepassen"
        }],
        "weakpoints": [{
          "taxonomy_level": "taxonomy_level",
          "score": "score"
        }],
        "weakpoints_clearance_threshold": "weakpoints_threshold"
      }]
    }
  ]
}
```