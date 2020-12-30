# 6. Observability \(BM\)

ref: [https://istio.io/v1.6/docs/concepts/observability/](https://istio.io/v1.6/docs/concepts/observability/)

## Observability

Istio는 메시\[mesh\] 내의 모든 서비스 통신에 대한 상세 원격 분석\[telemetry\]을 생성할 수 있습니다. 이 원격 측정\[telemetry\]은 서비스 동작에 대한 관찰성\[observability\]을 제공하여 운영자가 서비스 개발자에게 추가 부담을 주지 않고 애플리케이션 문제를 해결하고, 유지 관리하고 최적화 할 수 있게 유용한 정보를 제공 받을 수 있게 합니다. Istio를 통해 운영자는 모니터링 되는 서비스가 다른 서비스 및 Istio 구성 요소와 상호 작용하는 방식을 이해할 수 있게 도와 줍니다.

Istio는 전체적인 서비스 메시\[mesh\] 관찰성\[observability\]을 제공하기 위해 다음 유형의 원격 분석\[telemetry\]을 생성합니다.

* Metrics\[link\]: Istio는 4 가지 모니터링\[monitoring\] "골든 신호\[golden signal\]" \(대기 시간\[latency\], 트래픽\[traffic\], 오류\[errors\] 및 포화 상태\[saturation\]\)를 기반으로 서비스 메트릭 세트를 생성합니다. Istio는 메시 컨트롤 플레인\[mesh control plane\]에 대한 자세한 메트릭\[metrics\]도 제공합니다. 이러한 메트릭\[metrics\] 위에 구축 된 기본 메시\[mesh\] 모니터링\[monitoring\] 대시 보드 세트도 제공됩니다.
* Distributed Traces\[link\]: Istio는 각 서비스에 대한 분산 추적 스팬\[distributed trace spans\]을 생성하여 운영자에게 메시\[mesh\] 내 호 흐름 및 서비스 종속성에 대한 자세한 이해를 제공할 수 있습니다.
* Access Logs\[link\]: 트래픽\[traffic\]이 메시\[mesh\] 내의 서비스로 유입되면 Istio는 소스 및 대상 메타 데이터를 포함하여 각 요청에 대한 전체 레코드를 생성 할 수 있습니다. 이 정보를 통해 운영자는 개별 워크로드 인스턴스 수준까지 서비스 동작을 감사 할 수 있습니다.

### 메트릭\[Metrics\]

메트릭\[metrics\]은 전체적으로 동작을 모니터링하고 이해하는 방법을 제공합니다.

서비스 동작을 모니터링하기 위해, Istio는 Istio 서비스 메시\[mesh\]에 들어오고 나가는 모든 서비스 트래픽\[traffic\]에 대한 메트릭\[metrics\]을 생성합니다. 이러한 측정 항목은 전체 트래픽 볼륨, 트래픽 내 오류율, 요청 응답 시간과 같은 동작에 대한 정보를 제공합니다.

메시\[mesh\] 내의 서비스 동작을 모니터링\[monitoring\]하는 것과 더불어, 메시\[mesh\] 자체의 동작을 모니터링\[monitoring\]하는 것도 중요합니다. Istio 구성 요소는 자체 내부 동작에 대한 메트릭\[metrics\]을 내보내 메시 컨트롤 플레인\[mesh control plane\]의 상태와 기능에 대한 통찰력을 제공합니다.

#### 프록시 레벨 메트릭\[Proxy-level metrics\]

Istio 메트릭\[metrics\] 수집은 사이드카 프록시\[sidecar proxies\] \(Envoy\)에서 시작됩니다. 각 프록시\[proxy\]는 프록시\[proxy\]를 통과하는 모든 트래픽\[traffic\] \(인바운드\[inbound\] 및 아웃 바운드\[outbound\] 모두\)에 대한 풍부한 메트릭\[ㅡmetrics\] 세트를 생성합니다. 프록시\[proxy\]는 구성 및 상태 정보를 포함하여 프록시\[proxy\] 자체의 관리 기능에 대한 자세한 통계도 제공합니다.

Envoy에서 생성 된 메트릭\[metrics\]은 Envoy 리소스 \(예 : 리스너 및 클러스터\)의 세부수준 값을 메시\[mesh\] 모니터링\[monitoring\]을 통 제공합니다. 결과적으로 Envoy 메트릭을\[metrics\] 모니터링\[monitoring\]하려면 메시\[mesh\] 서비스와 Envoy 리소스 간의 연결을 이해해야합니다.

운영자는 Istio를 사용하여 각 워크로드 인스턴스\[workload instance\]에서 생성 및 수집되는 Envoy 메트릭\[metrics\]을 선택할 수 있습니다. 기본적으로 Istio는 Envoy가 생성 한 통계의 작은 하위 집합만 활성화하여 과도한 메트릭\[metrics\] 백엔드\[backend\]를 방지하고 메트릭\[metrics\] 수집과 관련된 CPU 오버 헤드를 줄입니다. 그러나 운영자는 필요한 경우 수집 된 프록시 메트릭\[proxy metrics\] 세트를 쉽게 확장 할 수 있습니다. 이를 통해 네트워킹 동작의 대상 디버깅을 가능하게하는 동시에 전체 메시 모니터링\[mesh monitoring\] 비용을 절감 할 수 있습니다.

Envoy 설명서 사이트에는 Envoy 통계 수집에 대한 자세한 개요가 포함되어 있습니다. Envoy Statistics의 운영 가이드는 프록시 수준 메트릭 생성 제어에 대한 자세한 정보를 제공합니다.

프록시 레벨 메트릭 예시 \[Example proxy-level Metrics\]:

```text
envoy_cluster_internal_upstream_rq{response_code_class="2xx",cluster_name="xds-grpc"} 7163

envoy_cluster_upstream_rq_completed{cluster_name="xds-grpc"} 7164

envoy_cluster_ssl_connection_error{cluster_name="xds-grpc"} 0

envoy_cluster_lb_subsets_removed{cluster_name="xds-grpc"} 0

envoy_cluster_internal_upstream_rq{response_code="503",cluster_name="xds-grpc"} 1
```

#### 서비스 레벨 메트릭 \[Service-level metrics\] <a id="service-level-metrics"></a>

프록시 수준 메트릭 외에도 Istio는 서비스 통신 모니터링을 위한 서비스 지향 메트릭\[metrics\] 집합을 제공합니다. 이러한 메트릭\[metrics\]은 지연\[latency\], 트래픽\[traffic\], 오류\[errors\] 및 포화\[saturation\]라는 네 가지 기본 서비스 모니터링 요구 사항을 다룹니다. Istio는 이러한 메트릭\[metrics\]을 기반으로 서비스 동작을 모니터링\[monitoring\]하기 위한 기본 대시 보드 세트와 함께 제공됩니다.

표준 Istio 메트릭\[metrics\]은 기본적으로 프로메테우스\[Prometheus\]로 내보내집니다.

서비스 수준 메트릭\[metrics\]의 사용은 전적으로 선택 사항입니다. 운영자는 개별 요구 사항을 충족하기 위해 이러한 메트릭\[metrics\]의 생성 및 수집을 해제 할 수 있습니다.

서비스 수준 메트릭 \[Example service-level metric\]:

```text
istio_requests_total{
  connection_security_policy="mutual_tls",
  destination_app="details",
  destination_canonical_service="details",
  destination_canonical_revision="v1",
  destination_principal="cluster.local/ns/default/sa/default",
  destination_service="details.default.svc.cluster.local",
  destination_service_name="details",
  destination_service_namespace="default",
  destination_version="v1",
  destination_workload="details-v1",
  destination_workload_namespace="default",
  reporter="destination",
  request_protocol="http",
  response_code="200",
  response_flags="-",
  source_app="productpage",
  source_canonical_service="productpage",
  source_canonical_revision="v1",
  source_principal="cluster.local/ns/default/sa/default",
  source_version="v1",
  source_workload="productpage-v1",
  source_workload_namespace="default"
} 214
```

#### 컨트롤 플레인 메트릭 \[Control plane metrics\]

Istio 컨트롤 플레인\[control plane\]은 자체 모니터링 메트릭\[metrics\] 모음도 제공합니다. 이러한 메트릭\[metrics\]을 사용하면 Istio 자체의 동작을 모니터링\[monitoring\] 할 수 있습니다 \(메시 내의 서비스 동작과 구별됨\).

유지 관리되는 메트릭\[metrics\]에 대한 자세한 내용은 참조 문서\[[https://istio.io/v1.6/docs/reference/commands/pilot-discovery/\#metrics](https://istio.io/v1.6/docs/reference/commands/pilot-discovery/#metrics)\]를 참고 하세요.

### 분산 추적 \[Distributed traces\] <a id="distributed-traces"></a>

분산 추적은 메시를 통과하는 개별 요청을 모니터링하여 동작을 모니터링하고 이해하는 방법을 제공합니다. 트레이스는 메시 운영자가 서비스 메시 내에서 서비스 종속성과 지연의 원인을 이해할 수 있도록 지원합니다

Distributed tracing provides a way to monitor and understand behavior by monitoring individual requests as they flow through a mesh. Traces empower mesh operators to understand service dependencies and the sources of latency within their service mesh.

Istio는 Envoy 프록시를 통해 분산 추적을 지원합니다. 프록시는 프록시하는 애플리케이션을 대신하여 추적 범위를 자동으로 생성하므로 애플리케이션이 적절한 요청 컨텍스트를 전달하기 만하면됩니다.

Istio supports distributed tracing through the Envoy proxies. The proxies automatically generate trace spans on behalf of the applications they proxy, requiring only that the applications forward the appropriate request context.

Istio는 Zipkin, Jaeger, Lightstep 및 Datadog을 비롯한 여러 추적 백엔드를 지원합니다. 운영자는 추적 생성을위한 샘플링 비율 \(즉, 요청 당 추적 데이터가 생성되는 비율\)을 제어합니다. 이를 통해 작업자는 메시에 대해 생성되는 추적 데이터의 양과 속도를 제어 할 수 있습니다.

Istio supports a number of tracing backends, including Zipkin, Jaeger, Lightstep, and Datadog. Operators control the sampling rate for trace generation \(that is, the rate at which tracing data is generated per request\). This allows operators to control the amount and rate of tracing data being produced for their mesh.

Istio를 사용한 분산 추적에 대한 자세한 내용은 분산 추적에 대한 FAQ에서 찾을 수 있습니다.

More information about Distributed Tracing with Istio is found in our FAQ on Distributed Tracing.

단일 요청에 대한 Istio 생성 분산 추적의 예\[Example Istio-generated distributed trace for a single request\]:

![](../.gitbook/assets/istio-tracing-details-zipkin.png)

### 접속 로그 \[Access logs\] <a id="access-logs"></a>

액세스 로그는 개별 워크로드 인스턴스의 관점에서 동작을 모니터링하고 이해하는 방법을 제공합니다.

Access logs provide a way to monitor and understand behavior from the perspective of an individual workload instance.

Istio는 구성 가능한 형식 집합으로 서비스 트래픽에 대한 액세스 로그를 생성하여 운영자에게 로깅 방법, 내용,시기 및 위치를 완벽하게 제어 할 수 있습니다. 자세한 내용은 Envoy의 액세스 로그 가져 오기를 참조하세요.

Istio can generate access logs for service traffic in a configurable set of formats, providing operators with full control of the how, what, when and where of logging. For more information, please refer to Getting Envoy’s Access Logs.

Istio 액세스 로그 예 \[Example Istio access log\]:

```text
[2019-03-06T09:31:27.360Z] "GET /status/418 HTTP/1.1" 418 - "-" 0 135 5 2 "-" "curl/7.60.0" "d209e46f-9ed5-9b61-bbdd-43e22662702a" "httpbin:8000" "127.0.0.1:80" inbound|8000|http|httpbin.default.svc.cluster.local - 172.30.146.73:80 172.30.146.82:38618 outbound_.8000_._.httpbin.default.svc.cluster.local
```

