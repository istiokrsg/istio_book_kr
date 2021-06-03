# Overview




분산 추적을 통해 사용자는 여러 서비스에 분산 된 메시를 통해 요청을 추적 할 수 있습니다. 이를 통해 시각화를 통해 요청 대기 시간, 직렬화 및 병렬 처리에 대해 더 깊이 이해할 수 있습니다.

Istio는 [Envoy의 분산 추적](https://www.envoyproxy.io/docs/envoy/v1.12.0/intro/arch_overview/observability/tracing) 기능을 활용하여 즉시 추적 통합을 제공합니다. 특히 Istio는 다양한 추적 백엔드를 설치하고 자동으로 추적 스팬을 전송하도록 프록시를 구성하는 옵션을 제공합니다. 

이러한 추적 시스템에서 Istio가 작동하는 방식에 대한 작업 문서:
[Zipkin](https://istio.io/v1.7/docs/tasks/observability/distributed-tracing/zipkin/)
[Jaeger](https://istio.io/v1.7/docs/tasks/observability/distributed-tracing/jaeger/)
[Lightstep](https://istio.io/v1.7/docs/tasks/observability/distributed-tracing/lightstep/) 


### 컨텍스트 전파 추적(Trace context propagation)

Istio 프록시는 자동으로 스팬을 보낼 수 있지만 전체 추적을 연결하려면 몇 가지 힌트가 필요합니다. 애플리케이션은 프록시가 스팬 정보를 보낼 때 스팬이 단일 추적으로 올바르게 상호 연관 될 수 있도록 적절한 HTTP 헤더를 전파해야합니다.

이를 위해 애플리케이션은 수신 요청에서 발신 요청으로 다음 헤더를 수집하고 전파해야합니다.:

* `x-request-id`
* `x-b3-traceid`
* `x-b3-spanid`
* `x-b3-parentspanid`
* `x-b3-sampled`
* `x-b3-flags`
* `x-ot-span-context`

또한 [OpenCensus](https://opencensus.io/) \(예 : Stackdriver\) 기반 추적 통합은 다음 헤더를 전파합니다.:

* `x-cloud-trace-context`
* `traceparent`
* `grpc-trace-bin`

예를 들어 샘플 Python`productpage` 서비스를 보면 애플리케이션이 [OpenTracing] (https://opentracing.io/) 라이브러리를 사용하여 HTTP 요청에서 필요한 헤더를 추출하는 것을 볼 수 있습니다.:

```text
def getForwardHeaders(request):
    headers = {}

    # x-b3-*** headers can be populated using the opentracing span
    span = get_current_span()
    carrier = {}
    tracer.inject(
        span_context=span.context,
        format=Format.HTTP_HEADERS,
        carrier=carrier)

    headers.update(carrier)

    # ...

    incoming_headers = ['x-request-id', 'x-datadog-trace-id', 'x-datadog-parent-id', 'x-datadog-sampled']

    # ...

    for ihdr in incoming_headers:
        val = request.headers.get(ihdr)
        if val is not None:
            headers[ihdr] = val

    return headers
```

리뷰 애플리케이션 \(Java\)는`requestHeaders`를 사용하여 유사한 작업을 수행합니다:

```text
@GET
@Path("/reviews/{productId}")
public Response bookReviewsById(@PathParam("productId") int productId, @Context HttpHeaders requestHeaders) {

  // ...

  if (ratings_enabled) {
    JsonObject ratingsResponse = getRatings(Integer.toString(productId), requestHeaders);
```

애플리케이션에서 dowmnstream 호출을 할 때 이러한 헤더를 포함해야합니다.

ref : [https://istio.io/v1.7/docs/tasks/observability/distributed-tracing/overview/](https://istio.io/v1.7/docs/tasks/observability/distributed-tracing/overview/)
