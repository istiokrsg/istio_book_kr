# Istio 메트릭 사용자 지정화 - Customizing Istio Metrics

## Customizing Istio Metrics <a id="title"></a>

이 작업은 Istio가 생성하는 메트릭을 사용자 지정하는 방법을 보여줍니다.

[EN] This task shows you how to customize the metrics that Istio generates.

[이스티오](istio)는 다양한 대시 보드에서 사용하는 원격 분석을 생성하여 메시를 시각화합니다. 예를 들어 [이스티오](istio)를 지원하는 대시 보드에는 다음이 포함됩니다.

[EN] Istio generates telemetry that various dashboards consume to help you visualize your mesh. For example, dashboards that support Istio include:

* [그라파나](Grafana) - [link](https://istio.io/v1.7/docs/tasks/observability/metrics/using-istio-dashboard/)
* [키알리](Kiali) - [link](https://istio.io/v1.7/docs/tasks/observability/kiali/)
* [프로메테우스](Prometheus) - [link](https://istio.io/v1.7/docs/tasks/observability/metrics/querying-metrics/)

기본적으로 [이스티오](Istio)는 표준 메트릭 세트를 정의하고 생성하지만, (예 : requests_total)을 사용자가 지정한 새 메트릭을 만들 수도 있습니다.

[EN] By default, Istio defines and generates a set of standard metrics \(e.g. requests\_total\), but you can also customize them and create new metrics.



### 사용자 맞춤 통계 구성 - Custom statistics configuration

[이스티오](Istio)는 [엔보이](Envoy) 프록시를 사용하여 메트릭을 생성하고, 다음 `manifests/charts/istio-control/istio-discovery/templates/telemetryv2_1.7.yaml` [엔보이필터](EnvoyFilter에)로 구성하여 제공될 수 있습니다. 

[EN] Istio uses the Envoy proxy to generate metrics and provides its configuration in the EnvoyFilter at manifests/charts/istio-control/istio-discovery/templates/telemetryv2\_1.7.yaml.

사용자 지정 통계 구성에는 [엔보이필터](EnvoyFilter)의 두 섹션인 정의 및 메트릭이 포함되어야 합니다. 정의 섹션은 이름, 예상 값 표현식 및 메트릭 유형 `(카운터, 게이지 및 히스토그램 )`별로 새 메트릭 생성을 지원합니다. 메트릭 섹션에서는 메트릭 차원의 값을 표현식으로 제공하고 기존 메트릭 차원을 제거하거나 재정의 할 수 있습니다. `tags_to_remove`를 사용하거나 차원을 다시 정의하여 표준 메트릭 정의를 수정할 수 있습니다. 이러한 구성 설정은 [이스티오시티엘](istioctl) 설치 옵션으로도 제공되므로 게이트웨이 및 사이드카 뿐만 아니라 인바운드 또는 아웃 바운드 방향에 대한 다양한 메트릭을 사용자 지정할 수 있습니다.

더 자세한 정보는 아래 통계 구성 정보를 참고하세요. [링크](https://istio.io/v1.7/docs/reference/config/proxy_extensions/stats/)


### 시작하기 전에 - Before you begin

클러스터에 [이스티오](Istio) 설치 방법 - [링크](https://istio.io/v1.7/docs/setup/)
위의 링크로 애플리케이션을 배포합니다.  또는 [이스티오](Istio) 설치의 일부로 사용자 지정 통계를 설정할 수 있습니다.

[Bookinfo 샘플](https://istio.io/v1.7/docs/examples/bookinfo/)는 이 태스크의 전반에 걸쳐 예제 애플리케이션으로 샘플 애플리케이션이 사용됩니다.


### 사용자 지정 메트릭 활성화 - Enable custom metrics

  1. 기본 원격 분석 v2 [엔보이필터](EnvoyFilter) 구성은 다음 설치 옵션과 동일합니다. 
```bash
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
spec:
  values:
    telemetry:
      v2:
        prometheus:
          configOverride:
            inboundSidecar:
              debug: false
              stat_prefix: istio
            outboundSidecar:
              debug: false
              stat_prefix: istio
            gateway:
              debug: false
              stat_prefix: istio
              disable_host_header_fallback: true

```  

  예를 들어, 인바운드 및 아웃 바운드 방향으로 게이트웨이와 사이드카 모두에서 내 보낸 requests_total 메트릭에 request_host 및 destination_port 차원을 추가하려면 원격 분석 v2 메트릭을 사용자 지정하려면 다음과 같이 설치 옵션을 변경합니다.

```
#info
사용자 정의 지정할 설정에 대한 구성만 지정하면됩니다. 예를 들어 사이드카 인바운드 requests_count 지표만 사용자 정의를 지정하려면 구성에서 outboundSidecar 및 게이트웨이 섹션을 생략할 수 있습니다. 지정되지 않은 설정은 위에 표시된 명시적 설정과 동일한 기본 구성을 유지합니다.
```

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
spec:
  values:
    telemetry:
      v2:
        prometheus:
          configOverride:
            inboundSidecar:
              debug: false
              stat_prefix: istio
              metrics:
                - name: requests_total
                  dimensions:
                    destination_port: string(destination.port)
                    request_host: request.host
            outboundSidecar:
              debug: false
              stat_prefix: istio
              metrics:
                - name: requests_total
                  dimensions:
                    destination_port: string(destination.port)
                    request_host: request.host
            gateway:
              debug: false
              stat_prefix: istio
              disable_host_header_fallback: true
              metrics:
                - name: requests_total
                  dimensions:
                    destination_port: string(destination.port)
                    request_host: request.host
```

  
  2. 다음 명령어를 사용하여 [프로메테우스](Prometheus) 시계열저장소에 추출 할 차원 목록과 함께 삽입 된 모든 [포드](pods)에 다음 [어노테이션](annotation)을 통해 적용합니다.

 ```
 {% hint style="info" %}
 #info
 이 단계는 [디멘젼](dimensions) [DefaultStatTags](https://github.com/istio/istio/blob/release-1.7/pkg/bootstrap/config.go) 목록에 없는 경우에만 필요합니다.
 {% endhint %}
```

```bash
apiVersion: apps/v1
kind: Deployment
spec:
  template: # pod template
    metadata:
      annotations:
        sidecar.istio.io/extraStatTags: destination_port,request_host 
```

### 결과 확인 - Verify the results

메시에 트래픽을 보냅니다. Bookinfo 샘플의 경우 웹 브라우저에서 `http://$GATEWAY_URL /productpage`를 방문하거나 다음 명령을 실행하십시오.

```bash
$ curl "http://$GATEWAY_URL/productpage"
```

{% hint style="info" %}
$GATEWAY_URL은 [Bookinfo](https://istio.io/v1.7/docs/examples/bookinfo/) 예제에 설정된 값입니다.
{% endhint %}

다음 명령을 사용하여 [이스티오](Istio)가 새 [디멘젼](dimensions) 또는 수정된 [디멘젼](dimensions) 대한 데이터를 생성하는지 확인합니다.

```bash
$ kubectl exec "$(kubectl get pod -l app=productpage -o jsonpath='{.items[0].metadata.name}')" -c istio-proxy -- curl 'localhost:15000/stats/prometheus' | grep istio_requests_total

```

예를 들어 출력에서 istio_requests_total 측정 항목을 찾고 여기에 새 측정 기준이 포함되어 있는지 확인합니다.



### 값의 표현식 사용방법 -  Use expressions for values

메트릭 구성의 값은 일반적인 표현식입니다. 즉, JSON에서 문자열을 큰 따옴표로 묶어야합니다 (예 : “‘문자열 값’”. Mixer 표현식 언어와 달리 파이프 (|) 연산자는 지원되지 않지만 has 또는 in 연산자를 사용하여 에뮬레이션 할 수 있습니다. 예를 들면 다음과 같습니다.


```bash
has(request.host) ? request.host : "unknown"
```

자세한 내용은 [Common Expression Language](https://opensource.google/projects/cel)를 참조하십시오.

[이스티오](Istio)는 모든 표준 [Envoy attributes](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/security/rbac_filter#condition)을 노출합니다. 또한 다음과 같은 추가 속성을 사용할 수 있습니다.


| Attribute | Type | Value |
| :---: | :---: | :---: |
| `listener_direction` | int64 | Enumeration value for [listener direction](https://www.envoyproxy.io/docs/envoy/latest/api-v2/api/v2/core/base.proto#envoy-api-enum-core-trafficdirection) |
| `listener_metadata` | [metadata](https://www.envoyproxy.io/docs/envoy/latest/api-v2/api/v2/core/base.proto#core-metadata) | Per-listener metadata |
| `route_metadata` | [metadata](https://www.envoyproxy.io/docs/envoy/latest/api-v2/api/v2/core/base.proto#core-metadata) | Per-route metadata |
| `cluster_metadata` | [metadata](https://www.envoyproxy.io/docs/envoy/latest/api-v2/api/v2/core/base.proto#core-metadata) | Per-cluster metadata |
| `node` | [node](https://www.envoyproxy.io/docs/envoy/latest/api-v2/api/v2/core/base.proto#core-node) | Node description |
| `cluster_name` | string | Upstream cluster name |
| `route_name` | string | Route name |
| `filter_state` | map\[string, bytes\] | Per-filter state blob |
| `plugin_name` | string | Wasm extension name |
| `plugin_root_id` | string | Wasm root instance ID |
| `plugin_vm_id` | string | Wasm VM ID |



자세한 내용은 [configuration reference](https://istio.io/v1.7/docs/reference/config/proxy_extensions/stats/)를 참조하십시오..  


### [참조](https://istio.io/v1.7/docs/tasks/observability/metrics/customize-metrics/)




### [뒤로 가기](./README.md)
