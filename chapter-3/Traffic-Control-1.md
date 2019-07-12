# 트래픽 컨트롤 1부

## 개요

이스티오의 대표 기능은 트래픽 컨트롤이다. 이제 2장에서 셋팅한 샘플 어플리케이션 [Bookinfo]() 의 트래픽을 제어하며 이스티오의 기능을 경험해보자.

이 장에서는 이스티오 설치때 정의한 [CRDs]() (Custom Resource DefinitionS) 중 [Gateway](), [Virtual Service](), [Destination Rule]() 을 이용하여 트래픽 컨트롤 기능을 간단히 경험해본다. 이후 트래픽 컨트롤을 담당하는 이스티오의 구성요소 [Pilot](), [Envoy]() 에 대해 살펴본다. 마지막으로 트래픽 컨트롤을 활용하여 [Continuous Deploy]() 의 대표적인 방법인 [Canary Deploy](), [Dark Launch](), [A/B Test]() 등의 방식을 어떻게 실현할 수 있는지 알아본다.

## [Traffic Control Hands-on]() (트래픽 컨트롤 핸즈온 )

* [Gateway](), 

## [Concept]() (개념 이해하기)

이스티오의 대표 기능은 트래픽 컨트롤이다. 트래픽 컨트롤은 담당하고 있는 서비스에 대해 내부 및 외부와의 통신등의 제어를 의미한다. 이스티오의 [Pilot](), [Envoy]() 등 두개의 구성요소가 트래픽 컨트롤 제어를 담당하고 있다. 특별한점은 어플리케이션 서비스를 직접 수정하지 않고 [configuration]() 의 수정만으로 트래픽 컨트롤 기능을 제공하고 있다는 점이다. 그리고 [Pilot](), [Envoy]() 이기 때문에 [service discovery](), [traffic routing](), [load balancing]() 등의 특징을 가지게 된다.

자세히 살펴보기 전에 간단히 요약해보면

이스티오의 [Pilot]() 은 트래픽 제어를 담당하고 있는 구성요소이다.
이스티오의 [Envoy]() 는 [Pilot]() 을 통해 설정된 구성과 정책을 수행하는 [Proxy]()이다.

이 두가지에 대해서 좀 더 자세히 살펴보자.

### Pilot

![pilot architecture](./pilot_architecture.png)

위 그림은 이스티오 공식 문서에 나와있다. 그림에서 보면 [Abstract model]() 을 통해 [Kubernetes]() 뿐 아니라 다른 플랫폼 위에서도 트래픽 컨트롤 기능을 제공할 수 있음을 알수 있다.
예를 들어, Kubernetes 어댑터는 Kubernetes API 서버에서 pod 등록 정보 및 서비스 리소스를 변경하는 것을 watch 하는 컨트롤러를 구현했다. Kubernetes 어댑터는 이 데이터를 [Abstract model]() 로 변환한다.

Envoy API 를 통해 Envoy proxy 끼리 서로에 대한 정보를 알도록 하기 위해 [Pilot]() 은 [Abstract model]() 을 사용하여 Envoy-specific configuration 을 생성한다.

Rules API, Network API 등을 사용하여 Pilot 에게 더욱 구체적인 configuration  을 지시하여 세부적으로 제어할 수 있다.

### Envoy proxy

* [Envoy]() 는 L7 Layer 수준의 proxy 를 구현하는 open source 이다.
* ... 블라블라

## 활용하여 Continuous Deploy 구현하기

* [CI/CD pipeline]() 개념에서 [CD]() 를 구현하기 위한 다양한 방식들이 있다. 하지만 결국 중요한점은 서비스중인 어플리케이션과 새로 배포할 어플리케이션을 놓고 사용자의 트래픽을 어디로 보낼것인지 결정할때 서비스의 중단이 없어야 한다는 것이다. 이를 구현하기 위해 [Canary Deploy](), [Dark Launch](), [A/B Test]() 등의 방식이 있다. 이스티오가 나오기전에는 어플리케이션에서 지원하거나 [Spinnaker]() 등의 배포 전용 툴을 사용해야 했다. 여기서는 이스티오의 트래픽 컨트롤을 활용하여 각 배포방식을 어떻게 구현했는지 확인해 본다.

### 스마트 카나리

### 다크 런칭

### A/B 테스트