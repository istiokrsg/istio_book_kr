# 시간 초과 \(Timeouts\)

시간 초과 \(timeout\)는 사이드카 프록시\(Envoy Proxy, Sidecar Proxy\)가 지정된 서비스에서 응답을 기다리는 시간으로, 서비스가 응답을 무기한으로 기다리지 않고 호출이 예측 가능한 시간 내에 성공 또는 실패 하도록 합니다. HTTP 요청의 기본 시간 제한 \(default timeout\)은 15초이고 서비스가 15초 내에 응답하지 않으면 호출이 실패 합니다.

일부 어플리케이션 및 서비스의 경우, Istio의 기본 시간 초과\(default timeout\)가 적절하지 않을 수 있습니다. 예를 들어 시간 초과가 너무 길면 서비스 실패로 인한 응답을 기다리는 대기 시간이 지나치게 길어질 수 있으며 시간이 너무 짧으면 여러 서비스가 포함된 작업이 반환 될 때까지 호출이 불필요한 실패를 할 수 있습니다.

최적의 시간 초과 설정으로 사용하기 위하여 Istio를 사용하면 서비스 코드를 수정하지 않고도 Istio 트래픽 제어 관련 가상 서비스 \(Virtual Service\)를 사용하여 서비스별로 쉽게 시간 초과를 동적으로 조정할 수 있는 Istio의 장점을 활용할 수 있습니다.

* 어플리케이션 소스 코드 변경없이 구성 가능 \(Zero Code Change\)
* 정책 기반의 구성 \(Policy Driven\)

다음 예제는 ratings 서비스 대상으로 v1 이라는 하위 집합\(subset\) 대상으로 호출 \(Call\)의 10초 시간 초과 \(timeout\)를 설정하는 가상 서비스입니다.

![\[&#xADF8;&#xB9BC;\] &#xC2DC;&#xAC04;&#xCD08;&#xACFC; \(Timeout\)](../.gitbook/assets/requesttimeouts11.png)

