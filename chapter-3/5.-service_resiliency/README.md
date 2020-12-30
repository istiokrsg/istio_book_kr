# Service Resiliency \(SW\)

{% embed url="https://istio.io/docs/concepts/traffic-management/\#network-resilience-and-testing" caption="" %}

Istio는 트래픽 관리 규칙 \(Traffic Management Rule\)을 통하여 메시 트래픽\(mesh traffic\)을 직접 제어할 뿐만 아니라 실행 중에도 동적으로 구성 할 수 있는 명시적 장애 복구 \(opt-in failure recovery\) 및 결함 주입 기능\(fault injection features\)을 제공합니다. 이러한 기능을 통하여 어플리케이션\(Application\)을 안정적으로 운영하고 또한 서비스 메시 \(Service Mesh\)는 장애 발생한 노드\(failing node\)가 내결함성\(fault tolerance\)을 가질 수 있도록 하고 특정 지역 노드에서 발생한 장애 \(Localized Failure\)가 도미노 같이 다른 노드까지 연쇄적으로 장애가 발생하는 것을 방지할 수 있는 서비스 복원력\(Service Resiliency\)을 다음과 같은 기능으로 제공합니다.

![No Domino Effect](https://github.com/istiokrsg/istio_book_kr/tree/50e9e3d699dffedd253f64968a6b6fe18f85539d/.gitbook/assets/no_domino_effect.jpg)

* 시간 초과 및 재시도 \(Timeouts and retries\)
* 전송 경로 차단기 \(써킷 브레이커, Circuit breakers\)
* 결함 주입 \(Fault injection\)
* 내결함성 \(Fault tolerance\)

서비스 복원력\(service resiliency\)은 바다의 풍랑속에 있는 선박 또는 외줄타기 하는 사람처럼 다양한 장애 요인 및 환경에서도 어플리케이션의 안정적인 개발 및 운영이 될 수 있도록 합니다.

![service resiliency](https://github.com/istiokrsg/istio_book_kr/tree/50e9e3d699dffedd253f64968a6b6fe18f85539d/.gitbook/assets/resilience_ship.png)

![](https://github.com/istiokrsg/istio_book_kr/tree/50e9e3d699dffedd253f64968a6b6fe18f85539d/.gitbook/assets/requesttimeouts10.png)



