# Istio Architecture \(PH\)



Istio 는 Service Mesh 를 제공하기 위해 논리적으로  Data Plane, Control Plane 을 제공합니다.

#### Data Plane

Data Plane은 Sidecar Pattern 으로 배포된 Envoy Proxy로 구성되어 있습니다. 각 마이크로서비스들 간의 Mesh Traffic을 제어하고, 여기서 발생하는 모든 Telemetry 정보를 수집합니다.

#### Control Plane

Control Plane은  Envoy Proxy를 제어하기 위한 각 설정정보 및 정책을 통해 트랙픽을 제어하는 역할을 담당합니다. 이를 위해 istiod 안에 있는 Pilot, Citadel, Gallery 각 3개의 모듈로 구성되어 있습니다.

![](../../.gitbook/assets/image%20%2820%29.png)



