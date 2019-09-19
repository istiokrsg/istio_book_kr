# Traffic Management
 29 MINUTE READ

* Overview and terminology: Learn about Pilot, Istio’s core traffic management component and Envoy proxies and how they enable service discovery and traffic control for services in the mesh.

`개요 및 용어 : Istio의 핵심 트래픽 관리 구성 요소 인 파일럿 및 Envoy 프록시와 이들이 메시의 서비스에 대한 서비스 검색 및 트래픽 제어를 가능하게하는 방법에 대해 알아 봅니다.`

* Traffic routing and configuration: Learn about the Istio features and resources needed to configure routing and control the ingress and egress of traffic for the mesh.

`트래픽 라우팅 및 구성 : 라우팅을 구성하고 메시의 트래픽 수신 및 송신을 제어하는 ​​데 필요한 Istio 기능 및 리소스에 대해 알아 봅니다`

* Network resilience and testing: Learn about Istio’s dynamic failure recovery features that you can configure to test and build tolerance for failing nodes, and to prevent cascading failures to other nodes.

`네트워크 탄력성 및 테스트 : 장애가 발생한 노드에 대한 내성을 테스트 및 구축하고 다른 노드에 대한 계단식 장애를 방지하도록 구성 할 수있는 Istio의 동적 장애 복구 기능에 대해 알아 봅니다.`

## Overview and terminology

With Istio, you can manage service discovery, traffic routing, and load balancing for your service mesh without having to update your services. Istio simplifies configuration of service-level properties like timeouts and retries, and makes it straightforward to set up tasks like staged rollouts with percentage-based traffic splits.

`Istio를 사용하면 서비스를 업데이트하지 않고도 서비스 메시에 대한 서비스 검색, 트래픽 라우팅 및로드 밸런싱을 관리 할 수 ​​있습니다. Istio는 시간 초과 및 재시 도와 같은 서비스 수준 속성 구성을 단순화하고 비율 기반 트래픽 분할을 통한 단계적 출시와 같은 작업을 간단하게 설정합니다.`

Istio’s traffic management model relies on the following two components:

`Istio의 트래픽 관리 모델은 다음 두 가지 구성 요소에 의존합니다.`

* Pilot, the core traffic management component.
`파일럿, 핵심 트래픽 관리 구성 요소`

* Envoy proxies, which enforce configurations and policies set through Pilot.
`Envoy 프록시 : Pilot을 통해 설정된 구성 및 정책을 시행합니다.`

These components enable the following Istio traffic management features:

`이러한 구성 요소를 통해 다음과 같은 Istio 트래픽 관리 기능을 사용할 수 있습니다.`

* Service discovery
* Load balancing
* Traffic routing and control

### Pilot: Core traffic management

The following diagram shows the Pilot architecture:

![Pilot architecture](./images/pilot-arch.svg)
Pilot architecture

As the diagram illustrates, Pilot maintains an abstract model of all the services in the mesh. Platform-specific adapters in Pilot translate the abstract model appropriately for your platform. For example, the Kubernetes adapter implements controllers to watch the Kubernetes API server for changes to pod registration information and service resources. The Kubernetes adapter translates this data for the abstract model.

`다이어그램에서 알 수 있듯이 Pilot은 메시에있는 모든 서비스의 추상 모델을 유지합니다. Pilot의 플랫폼 별 어댑터는 플랫폼에 맞게 추상 모델을 적절하게 변환합니다. 예를 들어 Kubernetes 어댑터는 컨트롤러를 구현하여 Kubernetes API 서버에서 포드 등록 정보 및 서비스 리소스가 변경되었는지 확인합니다. Kubernetes 어댑터는이 데이터를 추상 모델로 변환합니다.`

Pilot uses the abstract model to generate appropriate Envoy-specific configurations to let Envoy proxies know about one another in the mesh through the Envoy API.

`파일럿은 추상 모델을 사용하여 Envoy 프록시가 Envoy API를 통해 메시에서 서로에 대해 알 수 있도록 적절한 Envoy 관련 구성을 생성합니다.`

You can use Istio’s Traffic Management API to instruct Pilot to refine the Envoy configuration to exercise more granular control over the traffic in your service mesh.

`Istio의 트래픽 관리 API를 사용하여 파일럿에게 Envoy 구성을 세분화하여 서비스 메시의 트래픽을보다 세밀하게 제어하도록 지시 할 수 있습니다.`

### Envoy proxies

Traffic in Istio is categorized as data plane traffic and control plane traffic. Data plane traffic refers to the data that the business logic of the workloads manipulate. Control plane traffic refers to configuration and control data sent between Istio components to program the behavior of the mesh. Traffic management in Istio refers exclusively to data plane traffic.

`Istio의 트래픽은 데이터 플레인 트래픽 및 컨트롤 플레인 트래픽으로 분류됩니다. 데이터 평면 트래픽은 워크로드의 비즈니스 논리가 조작하는 데이터를 말합니다. 제어 평면 트래픽은 메시의 동작을 프로그래밍하기 위해 Istio 구성 요소간에 전송되는 구성 및 제어 데이터를 말합니다. Istio의 트래픽 관리는 전적으로 데이터 플레인 트래픽을 말합니다.`

Envoy proxies are the only Istio components that interact with data plane traffic. Envoy proxies route the data plane traffic across the mesh and enforce the configurations and traffic rules without the services having to be aware of them. Envoy proxies mediate all inbound and outbound traffic for all services in the mesh. Envoy proxies are deployed as sidecars to services, logically augmenting the services with traffic management features:

`Envoy 프록시는 데이터 평면 트래픽과 상호 작용하는 유일한 Istio 구성 요소입니다. Envoy 프록시는 데이터 플레인 트래픽을 메시를 통해 라우팅하고 서비스가 알 필요없이 구성 및 트래픽 규칙을 시행합니다. Envoy 프록시는 메시의 모든 서비스에 대한 모든 인바운드 및 아웃 바운드 트래픽을 중재합니다. Envoy 프록시는 서비스에 대한 사이드카로 배포되어 트래픽 관리 기능으로 서비스를 논리적으로 보강합니다.`

* service discovery and load balancing
* traffic routing and configuration
* network resilience and testing

Some of the features and tasks enabled by Envoy proxies include:

`Envoy 프록시가 지원하는 일부 기능 및 작업은 다음과 같습니다.`

* Traffic control features: enforce fine-grained traffic control with rich routing rules for HTTP, gRPC, WebSocket, and TCP traffic.

`트래픽 제어 기능 : HTTP, gRPC, WebSocket 및 TCP 트래픽에 대한 풍부한 라우팅 규칙으로 세분화 된 트래픽 제어를 시행합니다.`

* Network resiliency features: setup retries, failovers, circuit breakers, and fault injection.

`네트워크 복원 기능 : 설정 재시도, 장애 조치, 회로 차단기 및 오류 주입.`

* Security and authentication features: enforce security policies and enforce access control and rate limiting defined through the configuration API.

`보안 및 인증 기능 : 보안 정책을 시행하고 구성 API를 통해 정의 된 액세스 제어 및 속도 제한을 시행합니다.`

#### Service discovery and load balancing

Istio service discovery leverages the service discovery features provided by platforms like Kubernetes for container-based applications. Service discovery works in a similar way regardless of what platform you’re using:

`Istio 서비스 검색은 컨테이너 기반 애플리케이션을 위해 Kubernetes와 같은 플랫폼에서 제공하는 서비스 검색 기능을 활용합니다. 서비스 검색은 사용중인 플랫폼에 관계없이 비슷한 방식으로 작동합니다.`

1. The platform starts a new instance of a service which notifies its platform adapter.

`플랫폼은 플랫폼 어댑터에 알리는 새로운 서비스 인스턴스를 시작합니다.`

1. The platform adapter registers the instance with the Pilot abstract model.

`플랫폼 어댑터는 인스턴스를 파일럿 추상 모델에 등록합니다.`

1. Pilot distributes traffic rules and configurations to the Envoy proxies to account for the change.

`파일럿은 트래픽 규칙과 구성을 Envoy 프록시에 배포하여 변경 사항을 설명합니다.`

The following diagram shows how the platform adapters and Envoy proxies interact.

`다음 다이어그램은 플랫폼 어댑터와 Envoy 프록시가 상호 작용하는 방식을 보여줍니다.`

![Service discovery](./images/discovery.svg)
Service discovery

Because the service discovery feature is platform-independent, a service mesh can include services across multiple platforms.

`서비스 검색 기능은 플랫폼 독립적이므로 서비스 메시는 여러 플랫폼에 걸친 서비스를 포함 할 수 있습니다.`

Using the abstract model, Pilot configures the Envoy proxies to perform load balancing for service requests, replacing any underlying platform-specific load balancing feature. In the absence of more specific routing rules, Envoy will distribute the traffic across the instances in the calling service’s load balancing pool, according to the Pilot abstract model and load balancer configuration.

`파일럿은 추상 모델을 사용하여 Envoy 프록시가 서비스 요청에 대한로드 밸런싱을 수행하도록 구성하여 기본 플랫폼 별로드 밸런싱 기능을 대체합니다. 보다 구체적인 라우팅 규칙이 없으면 Envoy는 파일럿 추상 모델 및로드 밸런서 구성에 따라 호출 서비스의로드 밸런싱 풀에있는 인스턴스에 트래픽을 분산시킵니다.`

Istio supports the following load balancing methods:

`Istio는 다음과 같은로드 밸런싱 방법을 지원합니다.`

* Round robin: Requests are forwarded to instances in the pool in turn, and the algorithm instructs the load balancer to go back to the top of the pool and repeat.

`라운드 로빈 : 요청은 차례로 풀의 인스턴스로 전달되고 알고리즘은로드 밸런서가 풀의 맨 위로 돌아가 반복하도록 지시합니다.`

* Random: Requests are forwarded at random to instances in the pool.

`무작위 : 요청이 무작위로 풀의 인스턴스로 전달됩니다.`

* Weighted: Requests are forwarded to instances in the pool according to a specific percentage.

`가중 : 요청이 특정 백분율에 따라 풀의 인스턴스로 전달됩니다.`

* Least requests: Requests are forwarded to instances with the least number of requests. See the Envoy load balancing documentation for more information.

`최소 요청 : 요청 수가 가장 적은 인스턴스로 요청이 전달됩니다. 자세한 내용은 Envoy로드 밸런싱 설명서를 참조하십시오.`

You can also choose to prioritize your load balancing pools based on geographic location. Visit the operations guide for more information on the locality load balancing feature.

`지리적 위치에 따라로드 밸런싱 풀의 우선 순위를 정할 수도 있습니다. 로컬로드 밸런싱 기능에 대한 자세한 정보는 운영 안내서를 참조하십시오.`

In addition to basic service discovery and load balancing, Istio provides a rich set of traffic routing and control features, which are described in the following sections.

`기본적인 서비스 검색 및로드 밸런싱 외에도 Istio는 다음 섹션에서 설명하는 다양한 트래픽 라우팅 및 제어 기능을 제공합니다.`

## Traffic routing and configuration

The Istio traffic routing and configuration model relies on the following Istio traffic management API resources:

`Istio 트래픽 라우팅 및 구성 모델은 다음 Istio 트래픽 관리 API 리소스를 사용합니다.`

* Virtual services

Use a virtual service to configure an ordered list of routing rules to control how Envoy proxies route requests for a service within an Istio service mesh.

`가상 서비스를 사용하여 Envoy가 Istio 서비스 메시 내에서 서비스에 대한 요청을 라우팅하는 방법을 제어하기 위해 정렬 된 라우팅 규칙 목록을 구성하십시오.`

* Destination rules

Use destination rules to configure the policies you want Istio to apply to a request after enforcing the routing rules in your virtual service.

`대상 규칙을 사용하여 가상 서비스에서 라우팅 규칙을 적용한 후 Istio가 요청에 적용 할 정책을 구성하십시오`

* Gateways

Use gateways to configure how the Envoy proxies load balance HTTP, TCP, or gRPC traffic.

`게이트웨이를 사용하여 Envoy 프록시가 HTTP, TCP 또는 gRPC 트래픽의 부하를 분산시키는 방법을 구성하십시오.`

* Service entries

Use a service entry to add an entry to Istio’s abstract model that configures external dependencies of the mesh.

`서비스 항목을 사용하여 메시의 외부 종속성을 구성하는 항목을 Istio의 추상 모델에 추가하십시오.`

* Sidecars

Use a sidecar to configure the scope of the Envoy proxies to enable certain features, like namespace isolation.

`네임 스페이스 격리와 같은 특정 기능을 사용하도록 Envoy 프록시의 범위를 구성하려면 사이드카를 사용하십시오.`

You can use these resources to configure fine-grained traffic control for a range of use cases:

`이러한 리소스를 사용하여 다양한 사용 사례에 대한 세분화 된 트래픽 제어를 구성 할 수 있습니다.`

* Configure ingress traffic, enforce traffic policing, perform a traffic rewrite.

`수신 트래픽 구성, 트래픽 정책 시행, 트래픽 재 작성 수행`

`TLS 설정 및 이상 값 감지를 구성하십시오.`

* Set up load balancers and define service subsets as destinations in the mesh.

* Set up canary rollouts, circuit breakers, timeouts, and retries to test network resilience.

`네트워크 탄력성을 테스트하기 위해 카나리아 롤아웃, 회로 차단기, 시간 초과 및 재 시도를 설정하십시오.`

* Configure TLS settings and outlier detection.

`로드 밸런서를 설정하고 서비스 하위 세트를 메시의 대상으로 정의하십시오.`

The next section walks through some common use cases and describes how Istio supports them. Following sections describe each of the traffic management API resources in more detail.

`다음 섹션에서는 일반적인 사용 사례를 살펴보고 Istio가이를 지원하는 방법을 설명합니다. 다음 섹션에서는 각 트래픽 관리 API 리소스에 대해 자세히 설명합니다.`

### Traffic routing use cases

You might use all or only some of the Istio traffic management API resources, depending on your use case. Istio handles basic traffic routing by default, but configurations for advanced use cases might require the full range of Istio traffic routing features.

`사용 사례에 따라 Istio 트래픽 관리 API 리소스의 전부 또는 일부만 사용할 수 있습니다. Istio는 기본적으로 기본 트래픽 라우팅을 처리하지만 고급 사용 사례 구성에는 모든 범위의 Istio 트래픽 라우팅 기능이 필요할 수 있습니다.`

#### Routing traffic to multiple versions of a service

Typically, requests sent to services use a service’s hostname or IP address, and clients sending requests don’t distinguish between different versions of the service.

`일반적으로 서비스로 전송 된 요청은 서비스의 호스트 이름 또는 IP 주소를 사용하며 요청을 보내는 클라이언트는 서로 다른 버전의 서비스를 구분하지 않습니다.`

With Istio, because the Envoy proxy intercepts and forwards all requests and responses between the clients and the services, you can use routing rules with service subsets in a virtual service to configure the routing rules for multiple versions of a service.

`Envoy 프록시는 클라이언트와 서비스 간의 모든 요청과 응답을 가로 채 전달하기 때문에 Istio를 사용하면 가상 서비스의 서비스 하위 집합과 함께 라우팅 규칙을 사용하여 여러 버전의 서비스에 대한 라우팅 규칙을 구성 할 수 있습니다.`

Service subsets are used to label all instances that correspond to a specific version of a service. Before you configure routing rules, the Envoy proxies use round-robin load balancing across all service instances, regardless of their subset. After you configure routing rules for traffic to reach specific subsets, the Envoy proxies route traffic to the subset according to the rule but again use round-robin to route traffic across the instances of each subset.

`서비스 서브 세트는 특정 버전의 서비스에 해당하는 모든 인스턴스에 레이블을 지정하는 데 사용됩니다. 라우팅 규칙을 구성하기 전에 Envoy 프록시는 하위 집합에 관계없이 모든 서비스 인스턴스에서 라운드 로빈 부하 분산을 사용합니다. 트래픽이 특정 하위 집합에 도달하도록 라우팅 규칙을 구성한 후 Envoy 프록시는 규칙에 따라 트래픽을 하위 집합으로 라우팅하지만 라운드 로빈을 사용하여 각 하위 집합의 인스턴스에서 트래픽을 라우팅합니다`

This configuration method provides the following advantages:

`이 구성 방법은 다음과 같은 장점을 제공합니다.`

* Decouples the application code from the evolution of the application’s dependent services.

`응용 프로그램 종속 서비스의 진화에서 응용 프로그램 코드를 분리합니다.`

* Provides monitoring benefits. For details, see Mixer policies and telemetry.

`모니터링 이점을 제공합니다. 자세한 내용은 믹서 정책 및 원격 분석을 참조하십시오.`

For example, in A/B testing we often want to configure traffic routes based on percentages. With Istio, you can use a virtual service to specify a routing rule that sends 25% of requests to instances in the v2 subset, and sends the remaining 75% of requests to instances in the v1 subset. The following configuration accomplishes our example for the reviews service.

`예를 들어 A / B 테스트에서는 비율을 기준으로 트래픽 경로를 구성하려는 경우가 많습니다. Istio를 사용하면 가상 서비스를 사용하여 요청의 25 %를 v2 하위 집합의 인스턴스로 보내고 나머지 75 %의 요청을 v1 하위 집합의 인스턴스로 보내는 라우팅 규칙을 지정할 수 있습니다. 다음 구성은 리뷰 서비스에 대한 예제를 완성합니다.`

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: reviews
spec:
  hosts:
  - reviews
  http:
  - route:
    - destination:
        host: reviews
        subset: v1
      weight: 75
    - destination:
        host: reviews
        subset: v2
      weight: 25
```

#### Canary rollouts with autoscaling

Canary rollouts allow you to test a new version of a service by sending a small amount of traffic to the new version. If the test is successful, you can gradually increase the percentage of traffic sent to the new version until all the traffic is moved. If anything goes wrong along the way, you can abort the rollout and return the traffic to the old version.

`카나리아 롤아웃을 사용하면 소량의 트래픽을 새 버전으로 보내 새로운 버전의 서비스를 테스트 할 수 있습니다. 테스트에 성공하면 모든 트래픽이 이동 될 때까지 새 버전으로 전송되는 트래픽의 비율을 점차적으로 증가시킬 수 있습니다. 문제가 발생하면 롤아웃을 중단하고 트래픽을 이전 버전으로 되돌릴 수 있습니다.`

Container orchestration platforms like Docker or Kubernetes support canary rollouts, but they use instance scaling to manage traffic distribution, which quickly becomes complex, especially in a production environment that requires autoscaling.

`Docker 또는 Kubernetes와 같은 컨테이너 오케스트레이션 플랫폼은 카나리아 롤아웃을 지원하지만, 인스턴스 스케일링을 사용하여 트래픽 분배를 관리합니다. 특히 자동 스케일링이 필요한 프로덕션 환경에서 빠르게 복잡해집니다.`

With Istio, you can configure traffic routing and instance deployment as independent functions. The number of instances implementing the services can scale up and down based on traffic load without referring to version traffic routing at all. This makes managing a canary version that includes autoscaling a much simpler problem. For details, see the Canary Deployments blog post.

`Istio를 사용하면 트래픽 라우팅 및 인스턴스 배포를 독립적 인 기능으로 구성 할 수 있습니다. 서비스를 구현하는 인스턴스 수는 버전 트래픽 라우팅을 전혀 참조하지 않고도 트래픽로드에 따라 확장 및 축소 할 수 있습니다. 이렇게하면 자동 확장이 포함 된 카나리아 버전 관리가 훨씬 간단 해집니다. 자세한 내용은 Canary Deployments 블로그 게시물을 참조하십시오.`

## Virtual services

A virtual service is a resource you can use to configure how Envoy proxies route requests to a service within an Istio service mesh. Virtual services let you finely configure traffic behavior. For example, you can use virtual services to direct HTTP traffic to use a different version of the service for a specific user.

`가상 서비스는 Envoy 프록시가 요청을 Istio 서비스 메시 내의 서비스로 라우팅하는 방법을 구성하는 데 사용할 수있는 리소스입니다. 가상 서비스를 통해 트래픽 동작을 미세하게 구성 할 수 있습니다. 예를 들어 가상 서비스를 사용하여 특정 사용자에 대해 다른 버전의 서비스를 사용하도록 HTTP 트래픽을 지시 할 수 있습니다.`

Istio and your platform provide basic connectivity and discovery for your services. With virtual services, you can add a configuration layer to set up complex traffic routing. You can map user-addressable destinations to real workloads in the mesh, for example. Or, you can configure more advanced traffic routes to specific services or subsets in the mesh.

`Istio와 플랫폼은 서비스에 대한 기본 연결 및 검색 기능을 제공합니다. 가상 서비스를 사용하면 구성 계층을 추가하여 복잡한 트래픽 라우팅을 설정할 수 있습니다. 예를 들어 사용자가 주소를 지정할 수있는 대상을 메시의 실제 워크로드에 매핑 할 수 있습니다. 또는 메시의 특정 서비스 또는 서브 세트에 대한 고급 트래픽 경로를 구성 할 수 있습니다.`

Your mesh can require multiple virtual services or none depending on your use case. You can add gateways to route traffic in or out of your mesh, or combine virtual services with destination rules to configure the behavior of the traffic. You can use a service entry to add external dependencies to the mesh and combine them with virtual services to configure the traffic to these dependencies. The following diagrams show some example virtual service configurations:

`메시에는 여러 가상 서비스가 필요하거나 사용 사례에 따라 필요하지 않을 수 있습니다. 게이트웨이를 추가하여 트래픽을 메시 안팎으로 라우팅하거나 가상 서비스를 대상 규칙과 결합하여 트래픽 동작을 구성 할 수 있습니다. 서비스 항목을 사용하여 외부 종속성을 메시에 추가하고 가상 서비스와 결합하여 이러한 종속성에 대한 트래픽을 구성 할 수 있습니다. 다음 다이어그램은 일부 가상 서비스 구성을 보여줍니다.`

* 1:1 relationship: Virtual service A configures routing rules for traffic to reach service X.

![1 : 1 relationship](./images/virtual-services-1.svg)
1 : 1 relationship

* 1:many relationship:

  * Virtual service B configures routing rules for traffic to reach services Y and Z.

![1 : multiple services](./images/virtual-services-2.svg)
1 : multiple services

  * Virtual service C configures routing rules for traffic to reach different versions of service W.

![1 : multiple versions](./images/virtual-services-3.svg)
1 : multiple versions

You can use virtual services to perform the following types of tasks:

* Configure each application service version as a subset and add a corresponding destination rule to determine the set of pods or VMs belonging to these subsets.

`각 응용 프로그램 서비스 버전을 하위 집합으로 구성하고 해당 대상 규칙을 추가하여 이러한 하위 집합에 속하는 포드 또는 VM 집합을 결정하십시오.`

* Configure traffic rules in combination with gateways to control ingress and egress traffic

`게이트웨이와 결합하여 트래픽 규칙을 구성하여 수신 및 송신 트래픽을 제어`

* Add multiple match conditions to a virtual service configuration to eliminate redundant rules.

`중복 규칙을 제거하기 위해 가상 서비스 구성에 여러 개의 일치 조건을 추가하십시오.`

* Configure traffic routes to your application services using DNS names. These DNS names support wildcard prefixes or CIDR prefixes to create a single rule for all matching services.

`DNS 이름을 사용하여 응용 프로그램 서비스에 대한 트래픽 경로를 구성하십시오. 이러한 DNS 이름은 와일드 카드 접두사 또는 CIDR 접두사를 지원하여 일치하는 모든 서비스에 대한 단일 규칙을 만듭니다.`

* Address one or more application services through a single virtual service. If your mesh uses Kubernetes, for example, you can configure a virtual service to handle all services in a specific namespace.

`단일 가상 서비스를 통해 하나 이상의 애플리케이션 서비스를 처리하십시오. 예를 들어 메시가 Kubernetes를 사용하는 경우 특정 네임 스페이스의 모든 서비스를 처리하도록 가상 서비스를 구성 할 수 있습니다`

### Route requests to a subset

The following example configures the my-vtl-svc virtual service to route requests to the v1 subset of the my-svc service:

apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: my-vtl-svc
spec:
  hosts:
  - "*.my-co.org"
  http:
  - route:
    - destination:
        host: my-svc
        subset: v1

In the example, under spec, hosts lists the virtual service’s hosts. In this case, the hosts are *.my-co.org, where * is a wildcard prefix indicating that this virtual service handles routing for any DNS name ending with .my-co.org.

You can specify user-addressable hosts by using any DNS name or an internal mesh service name as long as the name resolves, implicitly or explicitly, to one or more fully qualified domain names (FQDN). To specify multiple hosts, you can use wildcards.

Also, note that under route, which specifies the routing rule’s configuration, and destination, which specifies the routing rule’s destination, host: my-svc specifies the destination’s host. If you are running on Kubernetes, then my-svc is the name of a Kubernetes service.

You use the destination’s host to specify where you want the traffic to be sent. The destination’s host must exist in the service registry. To use external services as destinations, use service entries to add those services to the registry.

Istio doesn’t provide DNS resolution. Applications can try to resolve the FQDN by using the DNS service present in their platform of choice, for example kube-dns.
The following diagram shows the configured rule:

Configurable traffic route to send traffic to a specific subset
Configurable traffic route to send traffic to a specific subset

### Route requests to services in a Kubernetes namespace

When you specify the host field for the destination of a route in a virtual service using a short name like svc-1, Istio expands the short name into a fully qualified domain name. To perform the expansion, Istio adds a domain suffix based on the namespace of the virtual service that contains the routing rule. For example, if the virtual service is defined in the my-namespace namespace, Istio adds the my-namespace.svc.cluster.local suffix to the abbreviated destination resulting in the actual destination: svc-1.my-namespace.svc.cluster.local.

While this approach is very convenient and commonly used to simplify examples, it can easily lead to misconfigurations. Therefore we do not recommend it for production deployments.

The following example shows a virtual service configuration with fully qualified traffic routes for two services in the my-namespace Kubernetes namespace. The configuration relies on the URI prefixes of the two services to distinguish them.

apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: my-namespace
spec:
  hosts:
  - my-namespace.com
  http:
  - match:
    - uri:
        prefix: /svc-1
    route:
    - destination:
        host: svc-1.my-namespace.svc.cluster.local
  - match:
    - uri:
        prefix: /svc-2
    route:
    - destination:
        host: svc-2.my-namespace.svc.cluster.local

Using fully qualified hosts in the routing rules also provides more flexibility. If you use short names, the destinations must be in the same namespace as the virtual service. If you use fully qualified domain names, the destinations can be in any namespace.

### Routing rules

A virtual service consists of an ordered list of routing rules to define the paths that requests follow within the mesh. You use virtual services to configure the routing rules. A routing rule consists of a destination and zero or more conditions, depending on your use case. You can also use routing rules to perform some actions on the traffic, for example:

Append or remove headers.

Rewrite the URL.

Set a retry policy.

To learn more about the actions available, see the virtual service reference documentation.

#### Routing rule for HTTP traffic

The following example shows a virtual service that specifies two HTTP traffic routing rules. The first rule includes a match condition with a regular expression to check if the username “jason” is in the request’s cookie. If the request matches this condition, the rule sends traffic to the v2 subset of the my-svc service. Otherwise, the second rule sends traffic to the v1 subset of the my-svc service.

apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: my-vtl-svc
spec:
  hosts:
  - "*"
  http:
  - match:
    - headers:
        cookie:
          regex: "^(.*?;)?(user=jason)(;.*)?$"
    route:
    - destination:
        host: my-svc
        subset: v2
  - route:
    - destination:
        host: my-svc
        subset: v1

In the preceding example, there are two routing rules in the http section, indicated by a leading - in front of the first field of each rule.

The first routing rule begins with the match field:

match Lists the routing rule’s matching conditions.

headers Specifies to look for a match in the header of the request.

cookie Specifies to look for a match in the header’s cookie.

regex Specifies the regular expression used to determine a match.

route Specifies where to route the traffic matching the condition. In this case, that traffic is HTTP traffic with the username jason in the cookie of the request’s header.

destination Specifies the route destination for the traffic matching the rule conditions.

host Specifies the destination’s host, my-svc.

subset Specifies the destination’s subset for the traffic matching the conditions, v2 in this case.

The configuration of the second routing rule in the example begins with the route field with a leading -. This rule applies to all traffic that doesn’t match the conditions specified in the first routing rule.

route Specifies where to route all traffic except for HTTP traffic matching the condition of the previous rule.

destination Specifies the routing rule’s destination.

host Specifies the destination’s host, my-svc.

subset Specifies the destination’s subset, v1 in this case.

The following diagram shows the configured traffic routes for the matched traffic and for all other traffic:

Configurable traffic route based on the namespace of two application services
Configurable traffic route based on the namespace of two application services
Routing rules are evaluated in a specific order. For details, refer to Precedence.

#### Match a condition

You can set routing rules that only apply to requests matching a specific condition. For example, the following configuration sets up a rule that only applies to an incoming request that includes a custom end-user header containing the exact value jason:

apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: reviews
spec:
  hosts:
  - reviews
  http:
  - match:
    - headers:
        end-user:
          exact: jason
    route:
    ...

You can specify more than one header in a rule. All corresponding headers must match.

#### Match request URI

The following routing rule is based on the request’s URI: it only applies to a request if the URI path starts with /api/v1:

apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: productpage
spec:
  hosts:
  - productpage
  http:
  - match:
    - uri:
        prefix: /api/v1
    route:
    ...

#### Multiple match conditions

Conditions can have multiple matches simultaneously. In such cases, you use the nesting of the conditions in the routing rule to specify whether AND or OR semantics apply. To specify AND semantics, you nest multiple conditions in a single section of match.

For example, the following rule applies only to requests for a URL that begins with /api/v1 and that include the custom end-user header that contains the exact value jason:

apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: productpage
spec:
  hosts:
  - productpage
  http:
  - match:
    - uri:
        prefix: /api/v1
      headers:
        end-user:
          exact: jason
    route:
    ...

To specify OR conditions, you place multiple conditions in separate sections of match. Only one of the conditions applies. For example, the following rule applies to requests for a URL that begins with /api/v1 or to requests with the custom end-user header containing the exact value jason:

apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: productpage
spec:
  hosts:
  - productpage
  http:
  - match:
    - uri:
        prefix: /api/v1
    - headers:
        end-user:
          exact: jason
    route:
    ...

In the two examples, above, the only difference between AND behavior and OR behavior is an extra - character in front of the headers field. The - in the YAML representation, indicates two separate matches as opposed to one match with multiple conditions.

### Routing rule precedence

Multiple rules for a given destination in a configuration file are evaluated in the order they appear. The first rule on the list has the highest priority.

Rules with no match condition that direct all or weighted percentages of traffic to destination services are called weight-based rules to distinguish them from other match-based rules. When routing for a particular service is purely weight-based, you can specify it in a single rule.

When you use other conditions to route traffic, such as requests from a specific user, you must use more than one rule to specify the routing.

It’s important to ensure that your routing rules are evaluated in the right order.

A best practice pattern to specify routing rules is as follows:

Provide one or more higher priority rules that match various conditions.

Provide a single weight-based rule with no match condition last. This rule provides the weighted distribution of traffic for all other cases.

#### Precedence example with 2 rules

The following virtual service configuration file includes two rules. The first rule sends all requests for the reviews service that include the Foo header with the bar value to the v2 subset. The second rule sends all remaining requests to the v1 subset:

apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: reviews
spec:
  hosts:
  - reviews
  http:
  - match:
    - headers:
        Foo:
          exact: bar
    route:
    - destination:
        host: reviews
        subset: v2
  - route:
    - destination:
        host: reviews
        subset: v1

In this example, the header-based rule has the higher priority because it comes first in the configuration file. If the match-based rule came second, these rules wouldn’t work as expected. Istio would evaluate the weight-based rule first and route all traffic to the instances in the v1 subset, even requests including the matching Foo header.

## Destination rules

You specify the path for traffic with routing rules, and then you use destination rules to configure the set of policies that Envoy proxies apply to a request at a specific destination.

Destination rules are applied after the routing rules are evaluated. Therefore, destination rules are matched against the destination in the routing rules, not the host of the virtual service itself. You can use wildcard prefixes in a destination rule to specify a single rule for multiple services.

You can use destination rules to specify service subsets, that is, to group all the instances of your service with a particular version together. You then configure routing rules that route traffic to your subsets to send certain traffic to particular service versions.

You specify explicit routing rules to service subsets. This model allows you to:

Cleanly refer to a specific service version across different virtual services.

Simplify the stats that the Istio proxies emit.

Encode subsets in Server Name Indication (SNI) headers.

### Load balancing 3 subsets

The following example destination rule configures three different subsets with different load balancing policies for the my-svc destination service:

apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: my-destination-rule
spec:
  host: my-svc
  trafficPolicy:
    loadBalancer:
      simple: RANDOM
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
    trafficPolicy:
      loadBalancer:
        simple: ROUND_ROBIN
  - name: v3
    labels:
      version: v3

As shown above, you can specify multiple policies in a single destination rule. In this example, the default policy, defined above the subsets field, sets a simple random load balancer for the v1 and v3 subsets. A v2 specific policy, a round robin load balancer, is defined in the corresponding subset’s field.

See our destination rules reference documentation to review all the enabled keys and values.

### Service subsets

Service subsets subdivide and label the instances of a service. To define the divisions and labels, use the subsets section in destination rules. For example, you can use subsets to configure the following traffic routing scenarios:

Use subsets to route traffic to different versions of a service.

Use subsets to route traffic to the same service in different environments.

You use service subsets in the routing rules of virtual services to control the traffic to your services. You can also use subsets to customize Envoy’s traffic policies when calling particular versions of a service.

Understanding service subsets in Istio allows you to configure the communication to services with multiple versions within your mesh and configure the following common use cases:

Splitting traffic between versions for A/B testing

Canary rollout

To learn how you can use service subsets to configure failure handling use cases, visit our Network resilience and testing concept.

## Gateways

You use a gateway to manage inbound and outbound traffic for your mesh. You can manage multiple types of traffic with a gateway.

Gateway configurations apply to Envoy proxies that are running at the edge of the mesh, which means that the Envoy proxies are not running as service sidecars. To configure a gateway means configuring an Envoy proxy to allow or block certain traffic from entering or leaving the mesh.

Your mesh can have any number of gateway configurations, and multiple gateway workload implementations can co-exist within your mesh. You might use multiple gateways to have one gateway for private traffic and another for public traffic, so you can keep all private traffic inside a firewall, for example.

You can use a gateway to configure workload labels for your existing network tasks, including:

Firewall functions
Caching
Authentication
Network address translation
IP address management
Gateways are primarily used to manage ingress traffic, but you can also use a gateway to configure an egress gateway. You can use egress gateways to configure a dedicated exit node for the traffic leaving the mesh and configure each egress gateway to use its own policies and telemetry.

You can use egress gateways to limit which services can or should access external networks, or to enable secure control of egress traffic to add security to your mesh, for example. The following diagram shows the basic model of a request flowing through a service mesh with an ingress gateway and an egress gateway.

Request flow
Request flow
All traffic enters the mesh through an ingress gateway workload. To configure the traffic, use an Istio gateway and a virtual service. You bind the virtual service to the gateway to use standard Istio routing rules to control HTTP requests and TCP traffic entering the mesh.

### Configure a gateway for external HTTPS traffic

The following example shows a possible gateway configuration for external HTTPS ingress traffic:

apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: ext-host-gwy
spec:
  selector:
    app: my-gateway-controller
  servers:
  - port:
      number: 443
      name: https
      protocol: HTTPS
    hosts:
    - ext-host
    tls:
      mode: SIMPLE
      serverCertificate: /tmp/tls.crt
      privateKey: /tmp/tls.key

This gateway configuration lets HTTPS traffic from ext-host into the mesh on port 443, but doesn’t specify any routing for the traffic.

#### Bind a gateway to a virtual service

To specify routing and for the gateway to work as intended, you must also bind the gateway to a virtual service. You do this using the virtual service’s gateways field, as shown in the following example:

apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: virtual-svc
spec:
  hosts:
  - ext-svc
  gateways:
    - ext-host-gwy

You can then configure the virtual service with routing rules for the external traffic.

For more information:

Refer to the gateways reference documentation to review all the enabled keys and values.

Refer to the Ingress task topic for instructions on how to configure an Istio gateway for ingress traffic.

Refer to the Egress gateway task to learn how to configure egress traffic using a gateway resource.

## Service entries

A service entry is used to add an entry to Istio’s abstract model, or service registry, that Istio maintains internally. After you add the service entry, the Envoy proxies can send traffic to the service as if it was a service in your mesh. Configuring service entries allows you to manage traffic for services running outside of the mesh:

Redirect and forward traffic for external destinations, such as APIs consumed from the web, or traffic to services in legacy infrastructure.

Define retry, timeout, and fault injection policies for external destinations.

Add a service running in a Virtual Machine (VM) to the mesh to expand your mesh.

Logically add services from a different cluster to the mesh to configure a multicluster Istio mesh on Kubernetes.

You don’t need to add a service entry for every external service that you want your mesh services to use. By default, Istio configures the Envoy proxies to passthrough requests to unknown services, although you can’t use Istio features to control the traffic to destinations that are not registered in the mesh.

You can use service entries to perform the following configurations:

Access secure external services over plain text ports, to configure Envoy to perform TLS Origination.
Ensure, together with an egress gateway, that all external services are accessed through a single exit point.
Refer to the Egress task topic for details.

## Add an external dependency securely

The following example mesh-external service entry adds the ext-resource external dependency to Istio’s service registry:

apiVersion: networking.istio.io/v1alpha3
kind: ServiceEntry
metadata:
  name: svc-entry
spec:
  hosts:
  - ext-resource.com
  ports:
  - number: 443
    name: https
    protocol: HTTPS
  location: MESH_EXTERNAL
  resolution: DNS

You must specify the external resource using the hosts key. You can qualify it fully or use a wildcard domain name. The value represents the set of one or more services outside the mesh that services in the mesh can access.

Configuring a service entry can be enough to call an external service, but typically you configure either, or both, a virtual service or destination rule to control traffic in a more granular way. You can configure traffic for a service entry in the same way you configure traffic for a service in the mesh.

### Secure the connection with mutual TLS

The following destination rule configures the traffic route to use mutual TLS to secure the connection to the ext-resource external service we configured using the service entry:

apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: ext-res-dr
spec:
  host: ext-resource.com
  trafficPolicy:
    tls:
      mode: MUTUAL
      clientCertificate: /etc/certs/myclientcert.pem
      privateKey: /etc/certs/client_private_key.pem
      caCertificates: /etc/certs/rootcacerts.pem

Together, the svc-entry service entry and the ext-res-dr destination rule configure a connection for traffic to the ext-resource external dependency using port 443 and mutual TLS.

See the service entries reference documentation to review all the enabled keys and values.

## Sidecars

By default, Istio configures every Envoy proxy to accept traffic on all the ports of its associated workload, and to reach every workload in the mesh when forwarding traffic. You can use a sidecar configuration to do the following:

Fine-tune the set of ports and protocols that an Envoy proxy accepts.

Limit the set of services that the Envoy proxy can reach.

Limiting sidecar reachability reduces memory usage, which can become a problem for large applications in which every sidecar is configured to reach every other service in the mesh.

A Sidecar resource can be used to configure one or more sidecar proxies selected using workload labels, or to configure all sidecars in a particular namespace.

### Enable namespace isolation

For example, the following Sidecar configures all services in the bookinfo namespace to only reach services running in the same namespace thanks to the ./* value of the hosts: field:

apiVersion: networking.istio.io/v1alpha3
kind: Sidecar
metadata:
  name: default
  namespace: bookinfo
spec:
  egress:
  - hosts:
    - "./*"

Sidecars have many uses. Refer to the sidecar reference for details.

## Network resilience and testing

Istio provides opt-in failure recovery features that you can configure dynamically at runtime through the Istio traffic management rules. With these features, the service mesh can tolerate failing nodes and Istio can prevent localized failures from cascading to other nodes:

## Timeouts and retries

A timeout is the amount of time that Istio waits for a response to a request. A retry is an attempt to complete an operation multiple times if it fails. You can set defaults and specify request-level overrides for both timeouts and retries or for one or the other.

Circuit breakers

Circuit breakers prevent your application from stalling as it waits for an upstream service to respond. You can configure a circuit breaker based on a number of conditions, such as connection and request limits.

Fault injection

Fault injection is a testing method that introduces errors into a system to ensure that it can withstand and recover from error conditions. You can inject faults at the application layer, rather than the network layer, to get more relevant results.

Fault tolerance

You can use Istio failure recovery features to complement application-level fault tolerance libraries in situations where their behaviors don’t conflict.

While Istio failure recovery features improve the reliability and availability of services in the mesh, applications must handle the failure or errors and take appropriate fallback actions. For example, when all instances in a load balancing pool have failed, Envoy returns an HTTP 503 code. The application must implement any fallback logic needed to handle the HTTP 503 error code from an upstream service.
Timeouts and retries
You can use Istio’s traffic management resources to set defaults for timeouts and retries per service and subset that apply to all callers.

### Override default timeout setting

The default timeout for HTTP requests is 15 seconds. You can configure a virtual service with a routing rule to override the default, for example:

apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ratings
spec:
  hosts:
  - ratings
  http:
  - route:
    - destination:
        host: ratings
        subset: v1
    timeout: 10s

### Set number and timeouts for retries

You can specify the maximum number of retries for an HTTP request in a virtual service, and you can provide specific timeouts for the retries to ensure that the calling service gets a response, either success or failure, within a predictable time frame.

Envoy proxies automatically add variable jitter between your retries to minimize the potential impact of retries on an overloaded upstream service.

The following virtual service configures three attempts with a 2-second timeout:

apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ratings
spec:
  hosts:
  - ratings
  http:
  - route:
    - destination:
        host: ratings
        subset: v1
    retries:
      attempts: 3
      perTryTimeout: 2s

Consumers of a service can also override timeout and retry defaults with request-level overrides through special HTTP headers. The Envoy proxy implementation makes the following headers available:

Timeouts: x-envoy-upstream-rq-timeout-ms

Retries: X-envoy-max-retries

## Circuit breakers

As with timeouts and retries, you can configure a circuit breaker pattern without changing your services. While retries let your application recover from transient errors, a circuit breaker pattern prevents your application from stalling as it waits for an upstream service to respond. By configuring a circuit breaker pattern, you allow your application to fail fast and handle the error appropriately, for example, by triggering an alert. You can configure a simple circuit breaker pattern based on a number of conditions such as connection and request limits.

### Limit connections to 100

The following destination rule sets a limit of 100 connections for the reviews service workloads of the v1 subset:

apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: reviews
spec:
  host: reviews
  subsets:
  - name: v1
    labels:
      version: v1
    trafficPolicy:
      connectionPool:
        tcp:
          maxConnections: 100

See the circuit-breaking task for detailed instructions on how to configure a circuit breaker pattern.

## Fault injection

You can use fault injection to test the end-to-end failure recovery capability of the application as a whole. An incorrect configuration of the failure recovery policies could result in unavailability of critical services. Examples of incorrect configurations include incompatible or restrictive timeouts across service calls.

With Istio, you can use application-layer fault injection instead of killing pods, delaying packets, or corrupting packets at the TCP layer. You can inject more relevant failures at the application layer, such as HTTP error codes, to test the resilience of an application.

You can inject faults into requests that match specific conditions, and you can restrict the percentage of requests Istio subjects to faults.

You can inject two types of faults:

Delays: Delays are timing failures. They mimic increased network latency or an overloaded upstream service.

Aborts: Aborts are crash failures. They mimic failures in upstream services. Aborts usually manifest in the form of HTTP error codes or TCP connection failures.

You can configure a virtual service to inject one or more faults while forwarding HTTP requests to the rule’s corresponding request destination. The faults can be either delays or aborts.

### Introduce a 5 second delay in 10% of requests

You can configure a virtual service to introduce a 5 second delay for 10% of the requests to the ratings service.

apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ratings
spec:
  hosts:
  - ratings
  http:
  - fault:
      delay:
        percentage:
          value: 0.1
        fixedDelay: 5s
    route:
    - destination:
        host: ratings
        subset: v1

### Return an HTTP 400 error code for 10% of requests

You can configure an abort instead to terminate a request and simulate a failure.

apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ratings
spec:
  hosts:
  - ratings
  http:
  - fault:
      abort:
        percentage:
          value: 0.1
        httpStatus: 400
    route:
    - destination:
        host: ratings
        subset: v1

### Combine delay and abort faults

You can use delay and abort faults together. The following configuration introduces a delay of 5 seconds for all requests to the v1 subset of the ratings service and an abort for 10% of them:

apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ratings
spec:
  hosts:
  - ratings
  http:
  - fault:
      delay:
        fixedDelay: 5s
      abort:
        percentage:
          value: 0.1
        httpStatus: 400
    route:
    - destination:
        host: ratings
        subset: v1

For detailed instructions on how to configure delays and aborts, visit our fault injection task.

## Compatibility with application-level fault handling
Istio failure recovery features are completely transparent to the application. Applications don’t know if an Envoy sidecar proxy is handling failures for a called upstream service, before returning a response.

When you use application-level fault tolerance libraries and Envoy proxy failure recovery policies at the same time, you need to keep in mind that both work independently, and therefore might conflict.

For example: Suppose you can have two timeouts, one configured in a virtual service and another in the application. The application sets a 2 second timeout for an API call to a service. However, you configured a 3 second timeout with 1 retry in your virtual service. In this case, the application’s timeout kicks in first, so your Envoy timeout and retry attempt has no affect.

