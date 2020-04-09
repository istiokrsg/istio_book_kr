# 써킷 브레이커 \(Circuit Breakers\)

집과 공장 등에서도 서비스 복원성 \(Service Resiliency\)를 제공해주기 위한 것들이 있습니다. 집안에서는 과전압으로 인한 가전기기 손상이나 화재를 예방하기 위해서 과전압이 발생하면 집안에 전력 공급을 차단하는 써킷 브레이커\(Circuit Breaker\), 일명 두꺼비집 및 퓨즈\(Fuse\)가 있고 공장에서는 파이프내의 압력 증가 등으로 인하여 발생할 수 있는 폭발 위험으로 부터 공장 전체를 보호하기 위하여 압력등을 배출할 수 있는 안전밸브\(Safety Valve\) 및 파열 \(Rupture Disc\) 등이 있습니다. 

![\(&#xC88C;\) &#xAC00;&#xC815;&#xB0B4;&#xC758; &#xC368;&#xD0B7; &#xBE0C;&#xB808;&#xC774;&#xCEE4;, \(&#xC6B0;\) &#xACF5;&#xC7A5;&#xB0B4;&#xC5D0; &#xC124;&#xCE58;&#xB418;&#xC5B4; &#xC788;&#xB294; &#xC548;&#xC804;&#xBC38;&#xBE0C; &#xBC0F; &#xD30C;&#xC5F4;&#xAD00;](../.gitbook/assets/20200408_203529.png)

지금 부터 설명하려고 하는 써킷 브레이커 \(circuit breaker\)는 여러 가지의 시스템 장애 요인으로 부터 안정적이고 탄력적인 마이크로 서비스를 제공하는 애플리케이션을 개발 하기 위하여 서비스 메시 \(Service Mesh\) 인 Istio가 제공해주는 또 다른 유용한 메커니즘입니다.

써킷 브레이커 \(circuit breaker\)에서는 동시 연결 수 또는 이 호스트에 대한 호출이 실패한 횟수와 같이 서비스 내에서 개별 호스트에 대한 호출 한계를 설정합니다. 이 한계에 도달하면 써킷 브레이커 \(circuit breaker\)가 개폐\(trip\)되고 해당 호스트에 대하여 추가적으로 발생하는 연결이 중단됩니다. 써킷 브레이커 \(circuit breaker\) 패턴을 사용하면 클라이언트가 과부하 되거나 장애가 발생한 호스트 \(failing host\)에 연결하지 않고 빠른 장애\(fast failure\)를 발생시킬 수 있습니다.

써킷 브레이커 \(circuit breaking\) 를 로드 밸런싱 풀의 "실제" 메시 대상으로 적용하기 위하여 서비스의 개별 호스트에 대한 Istio의 대상 규칙 \(Destination Rule\) 설정하여 써킷 브레이커 \(circuit breaker\) 를 구성합니다.

다음 예제는 샘플 서비스인 Reviews에 있는 v1 하위집합의 작업 부하 \(workload\)에 대하여 동시 연결 수\(concurrent connections\)를 100개로 제한합니다.

![\[&#xADF8;&#xB9BC;\] &#xC368;&#xD0B7; &#xBE0C;&#xB808;&#xC774;&#xCEE4; \(Circuit Breakers\)](../.gitbook/assets/circuit_breaker_ex.png)

### 

