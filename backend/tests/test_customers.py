from decimal import Decimal


def _create_customer_via_rental(client, auth_headers, phone="+79991112233"):
    scooter = client.post(
        "/api/scooters",
        json={
            "number": "C-001",
            "model": "Test Model",
            "status": "available",
            "battery_level": 80,
            "latitude": 55.75,
            "longitude": 37.62,
        },
        headers=auth_headers,
    ).json()
    rental = client.post(
        "/api/rentals",
        json={"scooter_id": scooter["id"], "customer_name": "Тестовый Клиент", "customer_phone": phone},
        headers=auth_headers,
    ).json()
    return rental["customer"]


def test_topup_increases_balance(client, auth_headers):
    customer = _create_customer_via_rental(client, auth_headers)

    response = client.post(
        f"/api/customers/{customer['id']}/topup",
        json={"amount": 300, "simulate_failure": False},
        headers=auth_headers,
    )
    assert response.status_code == 200
    new_balance = Decimal(response.json()["balance"])
    assert new_balance == Decimal(customer["balance"]) + Decimal("300")


def test_topup_simulated_failure_does_not_change_balance(client, auth_headers):
    customer = _create_customer_via_rental(client, auth_headers, phone="+79991112244")

    response = client.post(
        f"/api/customers/{customer['id']}/topup",
        json={"amount": 300, "simulate_failure": True},
        headers=auth_headers,
    )
    assert response.status_code == 402

    list_resp = client.get("/api/customers", params={"search": customer["phone"]}, headers=auth_headers)
    assert Decimal(list_resp.json()[0]["balance"]) == Decimal(customer["balance"])


def test_topup_rejects_non_positive_amount(client, auth_headers):
    customer = _create_customer_via_rental(client, auth_headers, phone="+79991112255")
    response = client.post(
        f"/api/customers/{customer['id']}/topup",
        json={"amount": 0, "simulate_failure": False},
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_search_customers(client, auth_headers):
    _create_customer_via_rental(client, auth_headers, phone="+79993334455")
    response = client.get("/api/customers", params={"search": "+79993334455"}, headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
