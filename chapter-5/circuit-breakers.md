# 전송 경로 차단기 \(회로 차단기, Circuit breakers\)

전송 경로 차단기\(회로 차단기, circuit breaker\)는 탄력적인 마이크로 서비스 기반 애플리케이션을 생성하기 위해 Istio가 제공하는 또 다른 유용한 메커니즘입니다.

전송 경로 차단기\(회로 차단기, circuit breaker\)에서는 동시 연결 수 또는 이 호스트에 대한 호출이 실패한 횟수와 같이 서비스 내의 개별 호스트에 대한 호출 제한을 설정합니다. 이 한계에 도달하면 전송 경로 차단기\(회로 차단기, circuit breaker\)가 개폐\(trip\)되고 해당 호스트에 대한 추가적으로 발생한 연결이 중단됩니다. 전송 경로 차단기\(회로 차단기, circuit breaker\) 패턴을 사용하면 클라이언트가 과부하 되거나 장애가 발생한 호스트\(failing host\)에 연결하지 않고 빠른 장애\(fast failure\)를 발생시킬 수 있습니다.

전송 경로 차단\(회로 차단, circuit breaking\) 를 로드 밸런싱 풀의 "실제" 메시 대상에 적용하려면 서비스의 개별 호스트에 대하여 Istio의 대상 규칙\(Destination Rule\) 설정으로 전송 경로 차단기\(회로 차단기, circuit breaker\) 임계값\(threshold\)을 구성합니다.

다음 예제는 샘플 서비스인 Reviews에 있는 v1 하위집합의 작업 부하\(workload\)에 대하여 동시 연결 수\(concurrent connections\)를 100으로 제한합니다.

![\[&#xADF8;&#xB9BC;\] &#xC804;&#xC1A1; &#xACBD;&#xB85C; &#xCC28;&#xB2E8;&#xAE30; \(&#xD68C;&#xB85C; &#xCC28;&#xB2E8;&#xAE30;, Circuit breakers\)](../.gitbook/assets/circuit_breaker_ex.png)

### 

