from decimal import Decimal

SCOOTER_PAYLOAD = {
    "number": "R-001",
    "model": "Test Model",
    "status": "available",
    "battery_level": 80,
    "latitude": 55.75,
    "longitude": 37.62,
}


def _create_scooter(client, auth_headers, **overrides):
    payload = {**SCOOTER_PAYLOAD, **overrides}
    return client.post("/api/scooters", json=payload, headers=auth_headers).json()


def test_create_rental_sets_scooter_in_use(client, auth_headers):
    scooter = _create_scooter(client, auth_headers)

    response = client.post(
        "/api/rentals",
        json={"scooter_id": scooter["id"], "customer_name": "Иван Иванов", "customer_phone": "+79990001122"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    rental = response.json()
    assert rental["status"] == "active"
    assert rental["customer"]["phone"] == "+79990001122"

    scooter_resp = client.get(f"/api/scooters/{scooter['id']}", headers=auth_headers)
    assert scooter_resp.json()["status"] == "in_use"


def test_create_rental_reuses_existing_customer_by_phone(client, auth_headers):
    scooter1 = _create_scooter(client, auth_headers, number="R-010")
    scooter2 = _create_scooter(client, auth_headers, number="R-011")

    first = client.post(
        "/api/rentals",
        json={"scooter_id": scooter1["id"], "customer_name": "Пётр Петров", "customer_phone": "+79990002233"},
        headers=auth_headers,
    ).json()
    client.post(f"/api/rentals/{first['id']}/complete", headers=auth_headers)

    second = client.post(
        "/api/rentals",
        json={"scooter_id": scooter2["id"], "customer_name": "Пётр Петров", "customer_phone": "+79990002233"},
        headers=auth_headers,
    ).json()

    assert second["customer_id"] == first["customer_id"]


def test_cannot_rent_unavailable_scooter(client, auth_headers):
    scooter = _create_scooter(client, auth_headers, status="maintenance")
    response = client.post(
        "/api/rentals",
        json={"scooter_id": scooter["id"], "customer_name": "Иван Иванов", "customer_phone": "+79990001133"},
        headers=auth_headers,
    )
    assert response.status_code == 400


def test_complete_rental_charges_customer_and_frees_scooter(client, auth_headers):
    scooter = _create_scooter(client, auth_headers, number="R-002")
    rental = client.post(
        "/api/rentals",
        json={
            "scooter_id": scooter["id"],
            "customer_name": "Анна Смирнова",
            "customer_phone": "+79990004455",
        },
        headers=auth_headers,
    ).json()

    complete_resp = client.post(f"/api/rentals/{rental['id']}/complete", headers=auth_headers)
    assert complete_resp.status_code == 200
    completed = complete_resp.json()
    assert completed["status"] == "completed"
    assert completed["end_time"] is not None
    # immediate create->complete rounds up to 1 minute at the default 5.00 RUB/min tariff
    assert Decimal(completed["cost"]) == Decimal("5.00")
    assert Decimal(completed["customer"]["balance"]) == Decimal("-5.00")

    scooter_resp = client.get(f"/api/scooters/{scooter['id']}", headers=auth_headers)
    assert scooter_resp.json()["status"] == "available"


def test_cannot_complete_rental_twice(client, auth_headers):
    scooter = _create_scooter(client, auth_headers, number="R-003")
    rental = client.post(
        "/api/rentals",
        json={"scooter_id": scooter["id"], "customer_name": "Олег Орлов", "customer_phone": "+79990005566"},
        headers=auth_headers,
    ).json()
    client.post(f"/api/rentals/{rental['id']}/complete", headers=auth_headers)
    second = client.post(f"/api/rentals/{rental['id']}/complete", headers=auth_headers)
    assert second.status_code == 400


def test_list_rentals_filtered_by_status(client, auth_headers):
    scooter = _create_scooter(client, auth_headers, number="R-004")
    rental = client.post(
        "/api/rentals",
        json={"scooter_id": scooter["id"], "customer_name": "Ольга Орлова", "customer_phone": "+79990006677"},
        headers=auth_headers,
    ).json()

    active_resp = client.get("/api/rentals", params={"status": "active"}, headers=auth_headers)
    assert any(r["id"] == rental["id"] for r in active_resp.json())

    client.post(f"/api/rentals/{rental['id']}/complete", headers=auth_headers)

    active_resp_after = client.get("/api/rentals", params={"status": "active"}, headers=auth_headers)
    assert all(r["id"] != rental["id"] for r in active_resp_after.json())

    completed_resp = client.get("/api/rentals", params={"status": "completed"}, headers=auth_headers)
    assert any(r["id"] == rental["id"] for r in completed_resp.json())
