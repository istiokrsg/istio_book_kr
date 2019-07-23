# [Observability]()

```txt
		
트레이싱      예거, 오픈 트레이스 소개
		    오픈 트레이스 소개
            그라파나, 크알리 소개
메트릭스        
로그 수집		
텔레메트리 애드온 추가		
```

## [overview]()
마이크로 서비스 아키텍처 관리의 관련한 가장 큰 과제 중 하나는 전체 시스템의 개별 구성 요소 간의 관계를 이해하려고 시도하는 것입니다.

[end-user]()의 트랜잭션은 수십 개 또는 수십개 이상의 독립적인 마이크로 서비스를 [pod]()를 통해 배포가 진행될 수 있으며, [Observability]() 통해 성능 병목 현상이 발생한 위치를 발견할 수 있게  유용한 정보를 제공합니다.


## Tracing
마이크로 서비스 아키텍처에 대해 이해해야 할 첫 번째 사항은 구체적으로 어떤 마이크로 서비스가 [end-user]() 트랜잭션과 관련되어 있는지입니다.

만약 많은 팀이 수십 개의 마이크로 서비스를 서로 독립적으로 배포하는 경우, 서비스의 [mesh]()전반에 걸친 의존성을 이해하는 것을 어렵게 만들 수 있습니다.
If many teams are deploying their dozens of microservices, all independently of one another, it is often challenging to understand the dependencies across that“mesh” of services. 

[Istio]()의 [Mixer]()는 배포 된 마이크로 서비스에서 [tracing]() 범위를 가져올 수 있는 기능을 기본적으로 제공합니다. 이것은 [tracing]()이 프로그래밍 언어에 무관하다는 것을 의미하므로 다른 마이크로 서비스가 있는 여러 팀이 서로 다른 프로그래밍 언어와 서로 다른 프레임 워크를 사용하여 여러 언어로 기능을 사용할 수 있는 것을 의미합니다.

Istio’s Mixer comes “out of the box” with the ability to pull tracing spans from your distributed microservices. This means that tracing is programming-language agnostic so that you can use this capability in a polyglot world where different teams, each with its own microservice, can be using different programming languages and frameworks.

[Istio]()는 [Zipkin]()과 [Jaeger]()를 모두 지원하지만 우리는 [Jaeger]()에 중점을 둡니다. [Jaeger]()는 벤더 중립적 추적 [API]() 인 [OpenTracing]()을 구현합니다. [Jaeger]()는 [Uber Technologies]() 팀이 제공 한 독창적 인 오픈 소스 프로그램이었으며 특별히 마이크로 서비스 아키텍처에 중점을 둔 분산형 추적 시스템입니다.
이해해야 할 한 가지 중요한 용어는 [span]()이며, [Jaeger]()는 [span]()을 "시스템에서 작업 이름, 시작 시간 및 지속 기간이 있는 논리적 작업 단위로 정의합니다. [span]()은 중첩되어 인과 관계를 모델링하게 하는 명령의 집합입니다. RPC 호출은 [span]()의 한 예입니다. "

Although Istio supports both Zipkin and Jaeger, for our purposes we focus on
Jaeger, which implements OpenTracing, a vendor neutral tracing API. Jaeger was
original open sourced by the Uber Technologies team and is a distributed tracing
system specifically focused on microservices architecture.
One important term to understand is span, and Jaeger defines span as “a logical
unit of work in the system that has an operation name, the start time of the oper‐
ation, and the duration. Spans can be nested and ordered to model causal rela‐
tionships. An RPC call is an example of a span.”


이해해야 할 또 다른 중요한 용어는 [trace]()이며 Jaeger는 [trace]()을 "시스템을 통한 데이터 / 실행 경로"로 정의하며 범위의 비순환 지시 그래프로 간주 할 수 있습니다.
당시은 다음 명령을 사용하여 Jaeger 콘솔을 실행:
```bash
minishift openshift service jaeger-query --in-browser
```
[Customer]()를 콥보박스에서 선택하고, [Figure 6-1]()처럼 [trace]()를 볼 수 있습니다.

Figure 6-1. Jaeger’s view of the customer-preference-recommendation trace 

기억해야 할 한 가지 중요한 점은 프로그래밍 로직에 모든 외부 호출 시에 [OpenTracing]() 헤더를 함께 전달하는 코드를 작성해야 합니다.
```bash
x-request-id
x-b3-traceid
x-b3-spanid
x-b3-parentspanid
x-b3-sampled
x-b3-flags
x-ot-span-context
```
여러분은 함께 제공되는 샘플 코드에서 [HttpHeader]() [ForwarderHandlerInterceptor]()라는 [Customer]() 클래스에서 해당 개념의 예를 확인 할 수 있습니다.

## Metrics
기본적으로 [Istio]()의 기본 구성으로 서비스 메쉬 전체에서 원격으로 [telemetry]() 데이터를 수집합니다. [Prometheus]()와 [Grafana]()를 설치하기만 하면 이 중요한 서비스 즉, [telemetry]() 데이터 수집을 시작할 수 있습니다. 그러나 많은 다른 백엔드로 [metrics/telemetry]() 수집 서비스를 지원할 수 있습니다.

2 장에서, 여러분은 보았습니다.
다음 네 가지 명령을 사용하여 메트릭 시스템을 설치하고 노출하십시오.
```bash
oc apply -f install/kubernetes/addons/prometheus.yaml
oc apply -f install/kubernetes/addons/grafana.yaml
oc expose svc grafana
oc expose svc prometheus
```

여러분은 아래의 [minishift]() 서비스 명령을 사용하여, [Grafana]() 콘솔을 시작할 수 있습니다.
```bash
open "$(minishift openshift service grafana -u)/dashboard/db/istiodashboard?var-source=All"
```
[Grafana]() 대시 보드의 왼쪽 상단에서 [Istio]() 대시 보드를 선택하면, Figure 6-2 화면처럼 보입니다.
Figure 6-2. e Grafana dashboard—selecting Istio dashboard

이 글을 쓰는 시점에는 필요에 따라 여러분은 [Grafana]() 대쉬 보드 [URL]()에 [?var-source=All]()를 추가 해야 될 수도 있습니다. 이것은 [istio-tutorial]()를 보는 시점에 따라 앞으로 변경 될 수 있습니다.
아래에 예제 [URL]()를 표기 합니다.
```bash
http://grafana-istio-system.192.168.99.101.nip.io/dashboard/db/istio-dashboard?
var-source=All
```
[Figure 6-3]()은 다음을 보여 줍니다. 여러분이 다음의 명령어를 통해 [Prometheus]() 대시 보드를 직접 방문 할 수도 있습니다. (참고로 브라우저에서 [URL]()이 열리며 --in-browser 대신 --url을 사용하면 [URL]() 만 얻을 수 있습니다.)

```bash
minishift openshift service prometheus --in-browser
```

## Metrics
By default, Istio’s default configuration will gather telemetry data across the ser‐
vice mesh. Simply installing Prometheus and Grafana is enough to get started
with this important service, however do keep in mind many other backend met‐
rics/telemetry-collection services are supported. In Chapter Chapter 2, you saw
the following four commands to install and expose the metrics system:

oc apply -f install/kubernetes/addons/prometheus.yaml
oc apply -f install/kubernetes/addons/grafana.yaml
oc expose svc grafana
oc expose svc prometheus

You can then launch the Grafana console using the minishift service command:
open "$(minishift openshift service grafana -u)/dashboard/db/istiodashboard?var-source=All"
Make sure to select Istio Dashboard in the upper left of the Grafana dashboard,
as demonstrated in Figure 6-2.
Figure 6-2. e Grafana dashboard—selecting Istio dashboard
As of this writing, you do need to append ?var-source=All to the Grafana dash‐
board URL. This is likely to change in the future, watch the istio-tutorial for
changes.
Here’s an example URL:
http://grafana-istio-system.192.168.99.101.nip.io/dashboard/db/istio-dashboard?
var-source=All
Figure 6-3 shows the dashboard. You can also visit the Prometheus dashboard
directly at the following (note, this will open the URL in a browser for you; you
could use --url instead of --in-browser to get just the URL):
minishift openshift service prometheus --in-browser
