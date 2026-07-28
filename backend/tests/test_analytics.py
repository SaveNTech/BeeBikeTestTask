def test_analytics_summary_reflects_scooters_and_rentals(client, auth_headers):
    scooter_a = client.post(
        "/api/scooters",
        json={
            "number": "A-001",
            "model": "Model A",
            "status": "available",
            "battery_level": 80,
            "latitude": 55.75,
            "longitude": 37.62,
        },
        headers=auth_headers,
    ).json()
    client.post(
        "/api/scooters",
        json={
            "number": "A-002",
            "model": "Model B",
            "status": "offline",
            "battery_level": 20,
            "latitude": 55.75,
            "longitude": 37.62,
        },
        headers=auth_headers,
    )

    client.post(
        "/api/rentals",
        json={"scooter_id": scooter_a["id"], "customer_name": "Клиент", "customer_phone": "+79995556677"},
        headers=auth_headers,
    )

    response = client.get("/api/analytics/summary", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()

    assert body["total_scooters"] == 2
    assert body["scooters_by_status"]["in_use"] == 1
    assert body["scooters_by_status"]["offline"] == 1
    assert body["active_rentals"] == 1
    assert body["average_battery_level"] == 50.0


def test_analytics_requires_auth(client):
    response = client.get("/api/analytics/summary")
    assert response.status_code == 401
