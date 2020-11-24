# Envoy

Envoy Proxy 는 Service Mesh 구조에서 특정 서비스에서 발생하는 모든 in/outbound 트래픽을 제어할 수 있는 C++로 개발된 고성능 Proxy 서버 입니다. Istio 는 Sidecar Pattern을 통해 Envoy Proxy 를 특정 서비스에 자동 배포하여 트래픽 제어를 위한 다양한 기능을 제공합니다. 

### Envoy 주요기능

#### Dynamic Service Discovery

![](../../.gitbook/assets/image%20%2810%29.png)

MSA 구조에서 각 서비스 상호간  API 호출을 위해서는 상대방 서비스에 대한 IP 주소를 알아야 합니다. 클라우드 또는 Kubernetes 클러스터와 같은 환경에서는 서비스가 배포될 때마다 IP 가 동적으로 변경될 수 있기 때문에 특정 서비스와의 연동을 위해서는 해당 서비스에 대한 위치 즉, IP를 조회할 수 있는 Service Discovery 기능이 필요합니다.

Istio는 Pilot을 통해 Service Discovery 를 제공합니다. Dynamic Service Discovery 를 위해  Istio Pilot 아키텍처에 대한 이해가 먼저 필요합니다. Kubernetes, Mesos, CloudFoundry 등 클러스터에 배포된 각 서비스들은 다른 서비스들을 호출할때, 상대편의 IP 또는 도메인 URL 정보를 알아야 합니다. envoy 가 특정 서비스의 Endpoint IP 주소를 조회하기 위해, Control Plane의  Pilot은 Service Mesh 에 등록된 모든 서비스에 대한 엔드포인트 정보를 저장/관리하고, 조회할 수 있는 기능을 제공합니다.

![](../../.gitbook/assets/image%20%2815%29.png)

Service Mesh 안에 배포된 각 서비스들은 다른 서비스들을 호출할때, 상대편의 IP 또는 도메인 URL 정보를 알아야 합니다. envoy 가 특정 서비스의 Endpoint IP 주소를 조회하기 위해, Control Plane의  Pilot은 Service Mesh 에 등록된 모든 서비스에 대한 엔드포인트 정보를 저장/관리하고, 조회할 수 있는 기능을 제공합니다. 위 그림과 같이 Service A와 B가 배포되고, 이후 Service Discovery 과정을 거쳐서 상호 통신하는 과정을 살펴보겠습니다.

Service Discovery 과정

1. 새로운 Service B 가 Sidecar Pattern 을 통해 Envoy 와 함께 배포되고, 서비스 실행시 Pilot의 Platform Adapter에게 서비스 등록을 알림
2. Platform Adapter는 서비스 인스턴스를 Abstract Model 에 등록
3. Pilot은 트래픽 제어를 위한 구성과 규칙정보를 Envoy 에게 전송 



MSA 와 같은 분산 환경에서는 서비스 간의 API 호출이 필요합니다. 

#### Load Balancing

#### TLS Termination

#### HTTP/2 and gRPC proxies

#### Circuit Breaker

#### Health checks

#### Staged rollouts with %-based traffic split

#### Fault Injection

#### Rich Metrics



