SCOOTER_PAYLOAD = {
    "number": "T-001",
    "model": "Test Model",
    "status": "available",
    "battery_level": 80,
    "latitude": 55.75,
    "longitude": 37.62,
}


def test_scooters_require_auth(client):
    response = client.get("/api/scooters")
    assert response.status_code == 401


def test_create_and_list_scooter(client, auth_headers):
    create_resp = client.post("/api/scooters", json=SCOOTER_PAYLOAD, headers=auth_headers)
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["number"] == "T-001"

    list_resp = client.get("/api/scooters", headers=auth_headers)
    assert list_resp.status_code == 200
    numbers = [s["number"] for s in list_resp.json()]
    assert "T-001" in numbers


def test_create_scooter_duplicate_number_conflict(client, auth_headers):
    client.post("/api/scooters", json=SCOOTER_PAYLOAD, headers=auth_headers)
    response = client.post("/api/scooters", json=SCOOTER_PAYLOAD, headers=auth_headers)
    assert response.status_code == 409


def test_create_scooter_invalid_battery_level_rejected(client, auth_headers):
    payload = {**SCOOTER_PAYLOAD, "battery_level": 150}
    response = client.post("/api/scooters", json=payload, headers=auth_headers)
    assert response.status_code == 422


def test_filter_scooters_by_status(client, auth_headers):
    client.post("/api/scooters", json=SCOOTER_PAYLOAD, headers=auth_headers)
    client.post(
        "/api/scooters",
        json={**SCOOTER_PAYLOAD, "number": "T-002", "status": "maintenance"},
        headers=auth_headers,
    )

    response = client.get("/api/scooters", params={"status": "maintenance"}, headers=auth_headers)
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 1
    assert results[0]["number"] == "T-002"


def test_search_scooters_by_model(client, auth_headers):
    client.post("/api/scooters", json=SCOOTER_PAYLOAD, headers=auth_headers)
    response = client.get("/api/scooters", params={"search": "test model"}, headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_update_scooter(client, auth_headers):
    created = client.post("/api/scooters", json=SCOOTER_PAYLOAD, headers=auth_headers).json()
    response = client.put(
        f"/api/scooters/{created['id']}",
        json={"battery_level": 42, "status": "offline"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["battery_level"] == 42
    assert body["status"] == "offline"


def test_delete_scooter(client, auth_headers):
    created = client.post("/api/scooters", json=SCOOTER_PAYLOAD, headers=auth_headers).json()
    response = client.delete(f"/api/scooters/{created['id']}", headers=auth_headers)
    assert response.status_code == 204

    get_resp = client.get(f"/api/scooters/{created['id']}", headers=auth_headers)
    assert get_resp.status_code == 404


def test_get_nonexistent_scooter_404(client, auth_headers):
    response = client.get("/api/scooters/00000000-0000-0000-0000-000000000000", headers=auth_headers)
    assert response.status_code == 404
