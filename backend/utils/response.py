from flask import make_response


def response(json):
    response = json

    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Content-Type", "application/json")

    return response


def handle_preflight():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response
