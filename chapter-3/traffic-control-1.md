# 트래픽 컨트롤 1부

## 개요

이스티오의 대표 기능은 트래픽 컨트롤입니다. 이제 2장에서 셋팅한 샘플 어플리케이션 [Bookinfo](traffic-control-1.md) 의 트래픽을 제어하며 이스티오의 기능을 경험해보겠습니다. dkdkdk

이 장에서는 이스티오 설치때 정의한 [CRDs](traffic-control-1.md) \(Custom Resource DefinitionS\) 중 [Gateway](traffic-control-1.md), [Virtual Service](traffic-control-1.md), [Destination Rule](traffic-control-1.md) 을 이용하여 트래픽 컨트롤 기능을 간단히 실행해보겠습니다. 이후 트래픽 컨트롤을 담당하는 이스티오의 구성요소 [Pilot](traffic-control-1.md), [Envoy](traffic-control-1.md) 에 대해 살펴봅니다. 마지막으로 트래픽 컨트롤을 활용하여 [Continuous Deploy](traffic-control-1.md) 의 대표적인 방법인 [Canary Deploy](traffic-control-1.md), [Dark Launch](traffic-control-1.md), [A/B Test](traffic-control-1.md) 등의 방식을 어떻게 실현할 수 있는지 알아보겠습니다.

## [Traffic Control Hands-on](traffic-control-1.md) \(트래픽 컨트롤 핸즈온 \)

### 준비

* istio install

```bash
$ istio install ...
```

* Bookinfo install

```bash
$ kubectl apply -f {ISTIO_HOME}/samples/bookinfo/platform/kube/bookinfo.yaml
```

### Gateway, Virtual Service install

```bash
$ kubectl apply -f {ISTIO_HOME}/samples/bookinfo/networking/bookinfo-gateway.yaml
```

### Virtual Service

```bash
$ kubectl ...
```

### Destination Rule

```bash
$ kubectl ...
```

### 트래픽 변경 적용

```bash
$ kubectl ...
```

## [Concept](traffic-control-1.md) \(개념 이해하기\)

이스티오의 대표 기능은 트래픽 컨트롤이다. 트래픽 컨트롤은 담당하고 있는 서비스에 대해 내부 및 외부와의 통신등의 제어를 의미한다. 이스티오의 [Pilot](traffic-control-1.md), [Envoy](traffic-control-1.md) 등 두개의 구성요소가 트래픽 컨트롤 제어를 담당하고 있다. 특별한점은 어플리케이션 서비스를 직접 수정하지 않고 [configuration](traffic-control-1.md) 의 수정만으로 트래픽 컨트롤 기능을 제공하고 있다는 점이다. 그리고 [Pilot](traffic-control-1.md), [Envoy](traffic-control-1.md) 이기 때문에 [service discovery](traffic-control-1.md), [traffic routing](traffic-control-1.md), [load balancing](traffic-control-1.md) 등의 특징을 가지게 된다.

자세히 살펴보기 전에 간단히 요약해보면

이스티오의 [Pilot](traffic-control-1.md) 은 트래픽 제어를 담당하고 있는 구성요소이다. 이스티오의 [Envoy](traffic-control-1.md) 는 [Pilot](traffic-control-1.md) 을 통해 설정된 구성과 정책을 수행하는 [Proxy](traffic-control-1.md)이다.

이 두가지에 대해서 좀 더 자세히 살펴보자.

### Pilot

![pilot architecture](../.gitbook/assets/pilot_architecture.png)

위 그림은 이스티오 공식 문서에 나와있다. 그림에서 보면 [Abstract model](traffic-control-1.md) 을 통해 [Kubernetes](traffic-control-1.md) 뿐 아니라 다른 플랫폼 위에서도 트래픽 컨트롤 기능을 제공할 수 있음을 알수 있다. 예를 들어, Kubernetes 어댑터는 Kubernetes API 서버에서 pod 등록 정보 및 서비스 리소스를 변경하는 것을 watch 하는 컨트롤러를 구현했다. Kubernetes 어댑터는 이 데이터를 [Abstract model](traffic-control-1.md) 로 변환한다.

Envoy API 를 통해 Envoy proxy 끼리 서로에 대한 정보를 알도록 하기 위해 [Pilot](traffic-control-1.md) 은 [Abstract model](traffic-control-1.md) 을 사용하여 Envoy-specific configuration 을 생성한다.

Rules API, Network API 등을 사용하여 Pilot 에게 더욱 구체적인 configuration 을 지시하여 세부적으로 제어할 수 있다.

### Envoy proxy

* [Envoy](traffic-control-1.md) 는 L7 Layer 수준의 proxy 를 구현하는 open source 이다.
* Istio 의 트래픽은 데이터 플레인 트래픽 및 컨트롤 플레인 트래픽으로 분류된다.
  * 데이터 플레인 트래픽은 워크로드의 비즈니스 로직이 조작하는 데이터를 말합니다.
  * 컨트롤 플레인 트래픽은 메시의 동작을 프로그래밍하기 위해 Istio 구성 요소간에 전송되는 구성 및 제어 데이터를 말합니다.
  * Istio의 트래픽 관리는 전적으로 데이터 플레인 트래픽을 말합니다.
* Envoy 프록시는 데이터 평면 트래픽과 상호 작용하는 유일한 Istio 구성 요소입니다. Envoy 프록시는 데이터 플레인 트래픽을 메시를 통해 라우팅하고 서비스가 알 필요없이 구성 및 트래픽 규칙을 시행합니다. Envoy 프록시는 메시의 모든 서비스에 대한 모든 인바운드 및 아웃 바운드 트래픽을 중재합니다.
* ... 블라블라

## 활용하여 Continuous Deploy 구현하기

* [CI/CD pipeline](traffic-control-1.md) 개념에서 [CD](traffic-control-1.md) 를 구현하기 위한 다양한 방식들이 있다. 하지만 결국 중요한점은 서비스중인 어플리케이션과 새로 배포할 어플리케이션을 놓고 사용자의 트래픽을 어디로 보낼것인지 결정할때 서비스의 중단이 없어야 한다는 것이다. 이를 구현하기 위해 [Canary Deploy](traffic-control-1.md), [Dark Launch](traffic-control-1.md), [A/B Test](traffic-control-1.md) 등의 방식이 있다. 이스티오가 나오기전에는 어플리케이션에서 지원하거나 [Spinnaker](traffic-control-1.md) 등의 배포 전용 툴을 사용해야 했다. 여기서는 이스티오의 트래픽 컨트롤을 활용하여 각 배포방식을 어떻게 구현했는지 확인해 본다.

### 스마트 카나리

### 다크 런칭

### A/B 테스트

