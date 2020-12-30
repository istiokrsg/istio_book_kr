# 재시도 \(Retries\)

재시도 \(retry\) 설정은 초기 호출이 실패 할 경우 사이드카 프록시 \(Envoy proxy, sidecar proxy\)가 서비스에 연결을 시도하는 최대 횟수를 설정합니다. 재시도는 일시적으로 과부하 된 서비스 또는 네트워크와 같은 일시적인 문제로 인해 호출이 영구적으로 실패하지 않도록 하여 서비스 가용성 \(service availability\)과 애플리케이션 성능 \(Application Performance\)을 향상시킬 수 있습니다.

재시도 시간 간격 \(25ms 이상\)은 가변적이며 Istio에 의해 자동으로 결정되므로 호출된 서비스를 과도한 요청을 방지할 수 있고 기본적으로 Envoy 프록시는 서비스 연결을 실패 \(first failure\)하면 서비스를 다시 연결하려고 시도하지 않습니다.

시간 초과 \(timeout\)와 마찬가지로 Istio의 기본 재시도 \(default retry\) 동작은 대기 시간 \(Latency, 서비스에 실패한 서비스를 너무 많은 재시도하면 속도가 느려 질 수 있음\) 또는 가용성 \(Availability\) 측면에서 어플리케이션 요구에 적합하지 않을 수 있습니다.

시간 초과 \(timeout\)와 마찬가지로 서비스 코드를 수정없이 가상 서비스\(Virtual Service\)에서 서비스별로 재시도 \(retry\) 설정을 조정할 수 있고 재시도별 시간 초과 \(per-retry timeout\)를 추가하여 각 재시도가 서비스에 성공적으로 연결할 시간을 설정하여 재시도 동작 \(retry behavior\)을 추가적으로 세분화 할 수 있습니다.

가상 서비스 \(Virtual Service\)에서 HTTP 요청의 최대 재시도 \(Retry\) 횟수를 설정할 수 있으며 재시도에 특정한 시간 초과 \(timeout\)를 제공하여 호출한 서비스가 성공 또는 실패 여부를 예측 가능한 시간 내에 확인할 수 있습니다.

다음 예제는 초기 호출 실패 \(initial call failure\)하면 매 2초의 시간 초과\(timeout\)가 있는 서비스 하위 집합 대상으로 연결하기 위하여 최대 3번의 재시도를 설정한 것입니다.

![\[&#xADF8;&#xB9BC;\] &#xC7AC;&#xC2DC;&#xB3C4; \(Retries\)](https://github.com/istiokrsg/istio_book_kr/tree/50e9e3d699dffedd253f64968a6b6fe18f85539d/.gitbook/assets/requesttimeouts12.png)

```text
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ratings-route
spec:
  hosts:
  - ratings.prod.svc.cluster.local
  http:
  - route:
    - destination:
        host: ratings.prod.svc.cluster.local
        subset: v1
    retries:
      attempts: 3
      perTryTimeout: 2s
      retryOn: gateway-error,connect-failure,refused-stream
```

## 재시도 관련 파라미터

| 파라미 | 데이터타 | 필수여 | 설 |
| :--- | :--- | :--- | :--- |
| attempts | int32 | 필수 | 호출한 요청에 대한 재시도 횟수이고 재시도 간격은 자동으로 결정되며 \(25 ms +\) 시도한 실제 재시도 횟수는 HTTP 경로 \(HTTP route\)의 요청 시간 초과\(timeout\)에 따라 다릅니다. |
| perTryTimeout | Duration | 선택 | 호출한 요청에 대한 재 시도당 시간 초과이고 형식으로는 "1 h/1 m/1 s/1 ms" 으로 1 ms 이상이여야 합니다. |
| retryOn | string | 선택 | 재시도 조건을 설정하는 것으로 코마 "," 구분으로 목록을 사용할 수 있으며 하나 이상의 정책을 설정할 수 있습니다. |

**HTTP 재시도 정책**

| 정책종류 | 설명 |
| :--- | :--- |


<table>
  <thead>
    <tr>
      <th style="text-align:left">5xx</th>
      <th style="text-align:left">
        <p>Envoy&#xB294; &#xC5C5;&#xC2A4;&#xD2B8;&#xB9BC; &#xC11C;&#xBC84;&#xAC00;
          5xx &#xC751;&#xB2F5; &#xCF54;&#xB4DC;&#xB85C; &#xC751;&#xB2F5;&#xD558;&#xAC70;&#xB098;
          &#xC804;&#xD600; &#xC751;&#xB2F5;&#xD558;&#xC9C0; &#xC54A;&#xC73C;&#xBA74;</p>
        <p>(&#xC7AC;&#xC5F0;&#xACB0; / &#xC7AC;&#xC124;&#xC815; / &#xC77D;&#xAE30;
          &#xC2DC;&#xAC04; &#xCD08;&#xACFC;) &#xC7AC;&#xC2DC;&#xB3C4;&#xB97C; &#xC2DC;&#xB3C4;&#xD569;&#xB2C8;&#xB2E4;.</p>
        <p>(&#xC5F0;&#xACB0; &#xC2E4;&#xD328; &#xBC0F; &#xAC70;&#xBD80; &#xC2A4;&#xD2B8;&#xB9BC;
          &#xD3EC;&#xD568;)</p>
      </th>
    </tr>
  </thead>
  <tbody></tbody>
</table>

<table>
  <thead>
    <tr>
      <th style="text-align:left">gateway-error</th>
      <th style="text-align:left">
        <p>&#xC774; &#xC815;&#xCC45;&#xC740; 5xx &#xC815;&#xCC45;&#xACFC; &#xC720;&#xC0AC;&#xD558;&#xC9C0;&#xB9CC;
          502, 503 &#xB610;&#xB294; 504&#xB97C; &#xBC1C;&#xC0DD;&#xC2DC;&#xD0A4;&#xB294;</p>
        <p>&#xC694;&#xCCAD;&#xB9CC; &#xC7AC;&#xC2DC;&#xB3C4;&#xD569;&#xB2C8;&#xB2E4;.</p>
      </th>
    </tr>
  </thead>
  <tbody></tbody>
</table>

<table>
  <thead>
    <tr>
      <th style="text-align:left">reset</th>
      <th style="text-align:left">
        <p>Envoy&#xB294; &#xC5C5;&#xC2A4;&#xD2B8;&#xB9BC; &#xC11C;&#xBC84;&#xAC00;
          &#xC804;&#xD600; &#xC751;&#xB2F5;&#xD558;&#xC9C0; &#xC54A;&#xC73C;&#xBA74;
          &#xC7AC;&#xC2DC;&#xB3C4;&#xD569;&#xB2C8;&#xB2E4;.</p>
        <p>(&#xC5F0;&#xACB0;&#xD574;&#xC81C; / &#xC7AC;&#xC124;&#xC815; / &#xC77D;&#xAE30;
          &#xC2DC;&#xAC04; &#xCD08;&#xACFC;).</p>
      </th>
    </tr>
  </thead>
  <tbody></tbody>
</table>

<table>
  <thead>
    <tr>
      <th style="text-align:left">connect-failure</th>
      <th style="text-align:left">
        <p>Envoy&#xB294; &#xC5C5;&#xC2A4;&#xD2B8;&#xB9BC; &#xC11C;&#xBC84;&#xC5D0;
          &#xB300;&#xD55C; &#xC5F0;&#xACB0; &#xC2E4;&#xD328; (&#xC5F0;&#xACB0; &#xC2DC;&#xAC04;
          &#xCD08;&#xACFC; &#xB4F1;)&#xB85C; &#xC778;&#xD574; &#xC694;&#xCCAD;&#xC774;</p>
        <p>&#xC2E4;&#xD328;&#xD558;&#xBA74; &#xC7AC;&#xC2DC;&#xB3C4;&#xD569;&#xB2C8;&#xB2E4;.
          (5xx&#xC5D0; &#xD3EC;&#xD568;)</p>
      </th>
    </tr>
  </thead>
  <tbody></tbody>
</table>

<table>
  <thead>
    <tr>
      <th style="text-align:left">retriable-4xx</th>
      <th style="text-align:left">
        <p>Envoy&#xB294; &#xC5C5;&#xC2A4;&#xD2B8;&#xB9BC; &#xC11C;&#xBC84;&#xAC00;
          &#xC7AC;&#xC2DC;&#xB3C4; &#xAC00;&#xB2A5;&#xD55C; 4xx &#xC751;&#xB2F5;
          &#xCF54;&#xB4DC;&#xB85C; &#xC751;&#xB2F5;&#xD558;&#xBA74;</p>
        <p>&#xC7AC;&#xC2DC;&#xB3C4;&#xD558;&#xACE0; &#xD604;&#xC7AC; &#xC774; &#xCE74;&#xD14C;&#xACE0;&#xB9AC;&#xC758;
          &#xC720;&#xC77C;&#xD55C; &#xC751;&#xB2F5; &#xCF54;&#xB4DC;&#xB294; 409&#xC785;&#xB2C8;&#xB2E4;.</p>
      </th>
    </tr>
  </thead>
  <tbody></tbody>
</table>

<table>
  <thead>
    <tr>
      <th style="text-align:left">refused-stream</th>
      <th style="text-align:left">
        <p>Envoy&#xB294; &#xC5C5;&#xC2A4;&#xD2B8;&#xB9BC; &#xC11C;&#xBC84;&#xAC00;
          REFUSED_STREAM &#xC624;&#xB958; &#xCF54;&#xB4DC;&#xB85C; &#xC2A4;&#xD2B8;&#xB9BC;&#xC744;</p>
        <p>&#xC7AC;&#xC124;&#xC815;&#xD558;&#xBA74; &#xC7AC;&#xC2DC;&#xB3C4;&#xD558;&#xACE0;
          &#xC774; &#xC7AC;&#xC124;&#xC815; &#xC720;&#xD615;&#xC740; &#xC694;&#xCCAD;&#xC744;
          &#xC7AC;&#xC2DC;&#xB3C4;&#xD574;&#xB3C4; &#xC548;&#xC804;&#xD558;&#xB2E4;&#xB294;
          &#xAC83;&#xC744;</p>
        <p>&#xB098;&#xD0C0;&#xB0C5;&#xB2C8;&#xB2E4;. (5xx&#xC5D0; &#xD3EC;&#xD568;)</p>
      </th>
    </tr>
  </thead>
  <tbody></tbody>
</table>

<table>
  <thead>
    <tr>
      <th style="text-align:left">retriable-status-codes</th>
      <th style="text-align:left">
        <p>Envoy&#xB294; &#xC5C5;&#xC2A4;&#xD2B8;&#xB9BC; &#xC11C;&#xBC84;&#xAC00;
          &#xC7AC;&#xC2DC;&#xB3C4; &#xC815;&#xCC45; &#xB610;&#xB294; x-envoy-retriable-status-codes</p>
        <p>&#xD5E4;&#xB354;&#xC5D0; &#xC815;&#xC758;&#xB41C; &#xC751;&#xB2F5; &#xCF54;&#xB4DC;&#xB85C;
          &#xC751;&#xB2F5;&#xD558;&#xB294; &#xACBD;&#xC6B0; &#xC7AC;&#xC2DC;&#xB3C4;&#xD569;&#xB2C8;&#xB2E4;.</p>
      </th>
    </tr>
  </thead>
  <tbody></tbody>
</table>

* 해당 재시도 정책이 설정되면 다른 재시도 정책을 통해 재 시도 할 수 있는 상태 코드 외에도 재시도 가능한 상태 코드 목록이 재시도 가능한 것으로 간주됩니다.
* 목록은 쉼표로 구분 된 정수 목록으로 "409"는 409를 재시도 할 수 있는 반면 "504,409"는 504와 409를 모두 재시도 할 수 있는 것으로 간주합니다.
* 이 헤더는 내부 클라이언트의 요청에만 적용됩니다.

## gRPC 재시도 정책

다음과 같은 응답 헤더의 gRPC 상태 코드로 설정할 수 있습니다.

* cancelled
* deadline-exceeded
* internal
* resource-exhausted
* unavailable

**참조 URL :**

```http
https://istio.io/docs/reference/config/networking/virtual-service/#HTTPRetry
https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#x-envoy-retry-on
```

