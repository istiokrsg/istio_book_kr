# Istio Architecture \(PH\)

이스티오 서비스 매쉬는 논리적으로 데이터 플레인\(data plane\), 제어 플레인\(control plane\)으로 구성되어 있습니다.

## 데이터 플레인

제어 플레인은 지능형 프록시\(엔보이, Envoy\)를 사이드카 패턴\(sidecar pattern\)으로 실제 서비스에 배포합니다. 마이크로서비스들 간의 네트워크 통신을 제어하며, 여기서 발생하는 모든 텔레메트리 정보를 수집합니다.

## 제어 플레인

제어 플레인은 트래픽을 제어하는 프록시를 제어하고 관리하는 역할을 담당합니다. 이를 위해 istiod 안에 있는 Pilot, Citadel, Gallery 각 3개의 모듈로 구성되어 있습니다.

![](../../.gitbook/assets/image%20%2820%29.png)

