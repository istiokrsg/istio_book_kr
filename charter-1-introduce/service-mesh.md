# Service Mesh 개념

### Service Mesh 개념

![](../.gitbook/assets/image%20%2822%29.png)

Istio 를 한마디로 정의하면 Service Mesh 라는 단어로 표현 가능할 것 같습니다. MSA 아키텍처 기반으로 설계된 각 서비스들이 네트워크 망에 혼재되어 상호 통신하게 되고, 특히 서비스가 너무 많아지면 복잡성이 증가하하면서 관리의 어려움이 발생합니다. Service Mesh는 네트워크 기능을 비지니스 로직과 분리한 통신 인프라이고, 쿠버네티스, 오픈스택  등 다양한 인프라 환경에서 각 서비스들 간의 통신을 제어하기 위한 다양한 기능을 통합하여 제공하고 있습니다. 이를 위해 Srvice Mesh는 Service Discovery, Service Routing, Failure Discovery, Load Balancing, Security, A/B 테스트 등 각 요소를 통해 서비스의 복잡성을 해결하기 위한 메커니즘을 제공합니다.

![](../.gitbook/assets/image%20%2821%29.png)

### Sidecar Pattern

Istio는 Service Mesh 를 위해 Sidecar Proxy Pattern 을 이용합니다. 동남아 국가에서 흔히 볼 수 있는 오토바이 옆에 사람을 태울 수 있는 형태와 비슷한 개념으로, Istio는 서비스 본체에서 발생하는 모든 in/outbound 트래픽을 모니터링하고 제어하기 위해 Sidecary Proxy\(Envoy\)를 활용합니다. 쿠버네티스 특정 네임스페이스에 Sidecar Pattern 을 적용할 경우 해당 네임스페이스 배포되는 모든 Pod 에 추가로 Sidecar Container\(Envoy\)가 자동으로 배포되고, 해당 Pod에서 발생하는 모든 in/outound 트래픽은 Envoy를 통해서 제어가 되고, 다양한 제어 정책들은 클러스터 관리자가 Control Plane을 통해 적용 가능 합니다. 따라서 대규모 서비스 환경에서 각 개발자의 별도 작업 없이 각 서비스들 간의 연동 상태 확인, 모니터링, 보안, 트래픽 제어를 손쉽게 제어 가능합니다.

![](../.gitbook/assets/image%20%2816%29.png)

### 

