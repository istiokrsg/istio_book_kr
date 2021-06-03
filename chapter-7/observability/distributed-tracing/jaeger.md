# Jaeger



이 작업을 완료하면 애플리케이션을 빌드하는 데 사용하는 언어, 프레임 워크 또는 플랫폼에 관계없이 [Jaeger](https://www.jaegertracing.io/)를 사용하여 애플리케이션이 추적에 참여하도록하는 방법을 이해하게됩니다.

이 작업에서는 [Bookinfo](https://istio.io/v1.7/docs/examples/bookinfo/) 샘플을 예제 애플리케이션으로 사용합니다.

Istio가 추적을 처리하는 방법을 알아 보려면이 작업의 [개요](https://istio.io/v1.7/docs/tasks/observability/distributed-tracing/overview/)를 참조하세요.

### 시작하기전에(Before you begin)

1. [Jaeger 설치](https://istio.io/v1.7/docs/ops/integrations/jaeger/#installation) 문서에 따라 Jaeger를 클러스터에 배포합니다.
2. 추적을 활성화하면 Istio가 추적에 사용하는 샘플링 속도를 설정할 수 있습니다. 설치 중에`values.pilot.traceSampling` 옵션을 사용하여 샘플링 속도를 설정합니다. 기본 샘플링 비율은 1 %입니다.
3. [Bookinfo](https://istio.io/v1.7/docs/examples/bookinfo/#deploying-the-application) 샘플 애플리케이션을 배포합니다.

### 대시 보드에 액세스(Accessing the dashboard)

[Remotely Accessing Telemetry Addons](https://istio.io/v1.7/docs/tasks/observability/gateways)는 게이트웨이를 통해 Istio 애드온에 대한 액세스를 구성하는 방법을 자세히 설명합니다.

\( 임시 액세스 \) 테스트를 위해 포트 포워딩을 사용할 수도 있습니다. Jaeger를 `istio-system` 네임 스페이스에 배포했다고 가정하고 다음을 사용합니다.

```text
$ istioctl dashboard jaeger
```

### Bookinfo 샘플을 사용하여 추적 생성(Generating traces using the Bookinfo sample)

1. Bookinfo 애플리케이션이 실행 중이면`http://$GATEWAY_URL/productpage`에 한 번 이상 액세스하여 추적 정보를 생성합니다.

   추적 데이터를 보려면 서비스에 요청을 보내야합니다. 요청 수는 Istio의 샘플링 속도에 따라 다릅니다. Istio를 설치할 때이 속도를 설정합니다. 기본 샘플링 비율은 1 %입니다. 첫 번째 추적이 표시되기 전에 최소 100 개의 요청을 보내야합니다. `productpage` 서비스에 100 개의 요청을 보내려면 다음 명령어를 사용하세요.:

   ```text
   $ for i in $(seq 1 100); do curl -s -o /dev/null "http://$GATEWAY_URL/productpage"; done
   ```

2. 대시 보드의 왼쪽 창에서 **서비스** 드롭 다운 목록에서`productpage.default`를 선택하고 **추적 찾기** :[![Tracing Dashboard](https://istio.io/v1.7/docs/tasks/observability/distributed-tracing/jaeger/istio-tracing-list.png)](https://istio.io/v1.7/docs/tasks/observability/distributed-tracing/jaeger/istio-tracing-list.png)추적 대시 보드

3. `/productpage`에 대한 최근 요청에 해당하는 세부 정보를 보려면 상단의 가장 최근 추적을 클릭하세요.:[![Detailed Trace View](https://istio.io/v1.7/docs/tasks/observability/distributed-tracing/jaeger/istio-tracing-details.png)](https://istio.io/v1.7/docs/tasks/observability/distributed-tracing/jaeger/istio-tracing-details.png)자세한 추적 뷰

4. 추적은 일련의 범위로 구성되며 각 범위는 `/productpage`요청 실행 중에 호출되는 Bookinfo 서비스에 해당하거나 내부 Istio 구성 요소 (예 : 'istio-ingressgateway')에 해당합니다.

### 정리하기(Cleanup)

1. control-C를 사용하여 여전히 실행 중일 수있는 모든`istioctl` 프로세스를 제거하거나:

   ```text
   $ killall istioctl
   ```

2. 후속 작업을 탐색하지 않으려는 경우 [Bookinfo 정리](https://istio.io/v1.7/docs/examples/bookinfo/#cleanup) 지침을 참조하여 애플리케이션을 종료하세요.





ref : [https://istio.io/v1.7/docs/tasks/observability/distributed-tracing/jaeger/](https://istio.io/v1.7/docs/tasks/observability/distributed-tracing/jaeger/)
