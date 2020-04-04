# 재시도 \(Retries\)

재시도\(retry\) 설정은 초기 호출이 실패 할 경우 사이드카 프록시\(Envoy proxy, sidecar proxy\)가 서비스에 연결을 시도하는 최대 횟수를 설정합니다. 재시도는 일시적으로 과부하 된 서비스 또는 네트워크와 같은 일시적인 문제로 인해 호출이 영구적으로 실패하지 않도록 하여 서비스 가용성\(service availability\)과 애플리케이션 성능\(Application Performance\)을 향상시킬 수 있습니다.

재시도 시간 간격 \(25ms 이상\)은 가변적이며 Istio에 의해 자동으로 결정되므로 호출된 서비스를 과도한 요청을 방지할 수 있고 기본적으로 Envoy 프록시는 서비스 연결을 실패\(first failure\)하면 서비스를 다시 연결하려고 시도하지 않습니다.

시간 초과\(timeout\)와 마찬가지로 Istio의 기본 재시도 \(default retry\) 동작은 대기 시간 \(Latency, 서비스에 실패한 서비스를 너무 많은 재시도하면 속도가 느려 질 수 있음\) 또는 가용성 \(Availability\) 측면에서 어플리케이션 요구에 적합하지 않을 수 있습니다.

시간 초과 \(timeout\)와 마찬가지로 서비스 코드를 수정없이 가상 서비스\(Virtual Service\)에서 서비스별로 재시도 \(retry\) 설정을 조정할 수 있고 재시도별 시간 초과 \(per-retry timeout\)를 추가하여 각 재시도가 서비스에 성공적으로 연결할 시간을 설정하여 재시도 동작 \(retry behavior\)을 추가적으로 세분화 할 수 있습니다.

가상 서비스 \(Virtual Service\)에서 HTTP 요청의 최대 재시도\(Retry\) 횟수를 설정할 수 있으며 재시도에 특정한 시간 초과\(timeout\)를 제공하여 호출한 서비스가 성공 또는 실패 여부를 예측 가능한 시간 내에 확인할 수 있습니다.

다음 예제는 초기 호출 실패 \(initial call failure\)하면 매 2초의 시간 초과\(timeout\)가 있는 서비스 하위 집합 대상으로 연결하기 위하여 최대 3번의 재시도를 설정한 것입니다.

![\[&#xADF8;&#xB9BC;\] &#xC7AC;&#xC2DC;&#xB3C4; \(Retries\)](../.gitbook/assets/requesttimeouts12.png)

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

#### 재시도 관련 파라미터 

<table>
  <thead>
    <tr>
      <th style="text-align:left">&#xD30C;&#xB77C;&#xBBF8;</th>
      <th style="text-align:left">&#xB370;&#xC774;&#xD130;&#xD0C0;</th>
      <th style="text-align:left">&#xD544;&#xC218;&#xC5EC;</th>
      <th style="text-align:left">&#xC124;</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left">attempts</td>
      <td style="text-align:left">int32</td>
      <td style="text-align:left">&#xD544;&#xC218;</td>
      <td style="text-align:left">
        <p>&#xD638;&#xCD9C;&#xD55C; &#xC694;&#xCCAD;&#xC5D0; &#xB300;&#xD55C; &#xC7AC;&#xC2DC;&#xB3C4;
          &#xD69F;&#xC218;&#xC774;&#xACE0; &#xC7AC;&#xC2DC;&#xB3C4; &#xAC04;&#xACA9;&#xC740;</p>
        <p>&#xC790;&#xB3D9;&#xC73C;&#xB85C; &#xACB0;&#xC815;&#xB418;&#xBA70; (25
          ms +) &#xC2DC;&#xB3C4;&#xD55C; &#xC2E4;&#xC81C; &#xC7AC;&#xC2DC;&#xB3C4;
          &#xD69F;&#xC218;&#xB294;</p>
        <p>HTTP &#xACBD;&#xB85C; (HTTP route)&#xC758; &#xC694;&#xCCAD; &#xC2DC;&#xAC04;
          &#xCD08;&#xACFC;(timeout)&#xC5D0; &#xB530;&#xB77C;</p>
        <p>&#xB2E4;&#xB985;&#xB2C8;&#xB2E4;.</p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left">perTryTimeout</td>
      <td style="text-align:left">Duration</td>
      <td style="text-align:left">&#xC120;&#xD0DD;</td>
      <td style="text-align:left">
        <p>&#xD638;&#xCD9C;&#xD55C; &#xC694;&#xCCAD;&#xC5D0; &#xB300;&#xD55C; &#xC7AC;
          &#xC2DC;&#xB3C4;&#xB2F9; &#xC2DC;&#xAC04; &#xCD08;&#xACFC;&#xC774;&#xACE0;</p>
        <p>&#xD615;&#xC2DD;&#xC73C;&#xB85C;&#xB294; &quot;1 h/1 m/1 s/1 ms&quot;
          &#xC73C;&#xB85C; 1 ms &#xC774;&#xC0C1;&#xC774;&#xC5EC;&#xC57C; &#xD569;&#xB2C8;&#xB2E4;.</p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left">retryOn</td>
      <td style="text-align:left">string</td>
      <td style="text-align:left">&#xC120;&#xD0DD;</td>
      <td style="text-align:left">
        <p>&#xC7AC;&#xC2DC;&#xB3C4; &#xC870;&#xAC74;&#xC744; &#xC124;&#xC815;&#xD558;&#xB294;
          &#xAC83;&#xC73C;&#xB85C; &#xCF54;&#xB9C8; &quot;,&quot; &#xAD6C;&#xBD84;&#xC73C;&#xB85C;
          &#xBAA9;&#xB85D;&#xC744;</p>
        <p>&#xC0AC;&#xC6A9;&#xD560; &#xC218; &#xC788;&#xC73C;&#xBA70; &#xD558;&#xB098;
          &#xC774;&#xC0C1;&#xC758; &#xC815;&#xCC45;&#xC744; &#xC124;&#xC815;&#xD560;
          &#xC218; &#xC788;&#xC2B5;&#xB2C8;&#xB2E4;.</p>
      </td>
    </tr>
  </tbody>
</table>**HTTP 재시도 정책**

<table>
  <thead>
    <tr>
      <th style="text-align:left">&#xC815;&#xCC45;&#xC885;&#xB958;</th>
      <th style="text-align:left">&#xC124;&#xBA85;</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left">5xx</td>
      <td style="text-align:left">
        <p>Envoy&#xB294; &#xC5C5;&#xC2A4;&#xD2B8;&#xB9BC; &#xC11C;&#xBC84;&#xAC00;
          5xx &#xC751;&#xB2F5; &#xCF54;&#xB4DC;&#xB85C; &#xC751;&#xB2F5;&#xD558;&#xAC70;&#xB098;
          &#xC804;&#xD600; &#xC751;&#xB2F5;&#xD558;&#xC9C0; &#xC54A;&#xC73C;&#xBA74;</p>
        <p>(&#xC7AC;&#xC5F0;&#xACB0; / &#xC7AC;&#xC124;&#xC815; / &#xC77D;&#xAE30;
          &#xC2DC;&#xAC04; &#xCD08;&#xACFC;) &#xC7AC;&#xC2DC;&#xB3C4;&#xB97C; &#xC2DC;&#xB3C4;&#xD569;&#xB2C8;&#xB2E4;.</p>
        <p>(&#xC5F0;&#xACB0; &#xC2E4;&#xD328; &#xBC0F; &#xAC70;&#xBD80; &#xC2A4;&#xD2B8;&#xB9BC;
          &#xD3EC;&#xD568;)</p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left">gateway-error</td>
      <td style="text-align:left">
        <p>&#xC774; &#xC815;&#xCC45;&#xC740; 5xx &#xC815;&#xCC45;&#xACFC; &#xC720;&#xC0AC;&#xD558;&#xC9C0;&#xB9CC;
          502, 503 &#xB610;&#xB294; 504&#xB97C; &#xBC1C;&#xC0DD;&#xC2DC;&#xD0A4;&#xB294;</p>
        <p>&#xC694;&#xCCAD;&#xB9CC; &#xC7AC;&#xC2DC;&#xB3C4;&#xD569;&#xB2C8;&#xB2E4;.</p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left">reset</td>
      <td style="text-align:left">
        <p>Envoy&#xB294; &#xC5C5;&#xC2A4;&#xD2B8;&#xB9BC; &#xC11C;&#xBC84;&#xAC00;
          &#xC804;&#xD600; &#xC751;&#xB2F5;&#xD558;&#xC9C0; &#xC54A;&#xC73C;&#xBA74;
          &#xC7AC;&#xC2DC;&#xB3C4;&#xD569;&#xB2C8;&#xB2E4;.</p>
        <p>(&#xC5F0;&#xACB0;&#xD574;&#xC81C; / &#xC7AC;&#xC124;&#xC815; / &#xC77D;&#xAE30;
          &#xC2DC;&#xAC04; &#xCD08;&#xACFC;).</p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left">connect-failure</td>
      <td style="text-align:left">
        <p>Envoy&#xB294; &#xC5C5;&#xC2A4;&#xD2B8;&#xB9BC; &#xC11C;&#xBC84;&#xC5D0;
          &#xB300;&#xD55C; &#xC5F0;&#xACB0; &#xC2E4;&#xD328; (&#xC5F0;&#xACB0; &#xC2DC;&#xAC04;
          &#xCD08;&#xACFC; &#xB4F1;)&#xB85C; &#xC778;&#xD574; &#xC694;&#xCCAD;&#xC774;</p>
        <p>&#xC2E4;&#xD328;&#xD558;&#xBA74; &#xC7AC;&#xC2DC;&#xB3C4;&#xD569;&#xB2C8;&#xB2E4;.
          (5xx&#xC5D0; &#xD3EC;&#xD568;)</p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left">retriable-4xx</td>
      <td style="text-align:left">
        <p>Envoy&#xB294; &#xC5C5;&#xC2A4;&#xD2B8;&#xB9BC; &#xC11C;&#xBC84;&#xAC00;
          &#xC7AC;&#xC2DC;&#xB3C4; &#xAC00;&#xB2A5;&#xD55C; 4xx &#xC751;&#xB2F5;
          &#xCF54;&#xB4DC;&#xB85C; &#xC751;&#xB2F5;&#xD558;&#xBA74;</p>
        <p>&#xC7AC;&#xC2DC;&#xB3C4;&#xD558;&#xACE0; &#xD604;&#xC7AC; &#xC774; &#xCE74;&#xD14C;&#xACE0;&#xB9AC;&#xC758;
          &#xC720;&#xC77C;&#xD55C; &#xC751;&#xB2F5; &#xCF54;&#xB4DC;&#xB294; 409&#xC785;&#xB2C8;&#xB2E4;.</p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left">refused-stream</td>
      <td style="text-align:left">
        <p>Envoy&#xB294; &#xC5C5;&#xC2A4;&#xD2B8;&#xB9BC; &#xC11C;&#xBC84;&#xAC00;
          REFUSED_STREAM &#xC624;&#xB958; &#xCF54;&#xB4DC;&#xB85C; &#xC2A4;&#xD2B8;&#xB9BC;&#xC744;</p>
        <p>&#xC7AC;&#xC124;&#xC815;&#xD558;&#xBA74; &#xC7AC;&#xC2DC;&#xB3C4;&#xD558;&#xACE0;
          &#xC774; &#xC7AC;&#xC124;&#xC815; &#xC720;&#xD615;&#xC740; &#xC694;&#xCCAD;&#xC744;
          &#xC7AC;&#xC2DC;&#xB3C4;&#xD574;&#xB3C4; &#xC548;&#xC804;&#xD558;&#xB2E4;&#xB294;
          &#xAC83;&#xC744;</p>
        <p>&#xB098;&#xD0C0;&#xB0C5;&#xB2C8;&#xB2E4;. (5xx&#xC5D0; &#xD3EC;&#xD568;)</p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left">
        <p></p>
        <p>retriable-status-codes</p>
      </td>
      <td style="text-align:left">
        <p>Envoy&#xB294; &#xC5C5;&#xC2A4;&#xD2B8;&#xB9BC; &#xC11C;&#xBC84;&#xAC00;
          &#xC7AC;&#xC2DC;&#xB3C4; &#xC815;&#xCC45; &#xB610;&#xB294; x-envoy-retriable-status-codes</p>
        <p>&#xD5E4;&#xB354;&#xC5D0; &#xC815;&#xC758;&#xB41C; &#xC751;&#xB2F5; &#xCF54;&#xB4DC;&#xB85C;
          &#xC751;&#xB2F5;&#xD558;&#xB294; &#xACBD;&#xC6B0; &#xC7AC;&#xC2DC;&#xB3C4;&#xD569;&#xB2C8;&#xB2E4;.</p>
      </td>
    </tr>
  </tbody>
</table>* 이 헤더를 설정하면 재시도 가능한 상태 코드 재시도 정책과 함께 사용될 때 재 시도 할 수 있는 상태 코드에 대해 Envoy에 알립니다. 
* 해당 재시도 정책이 설정되면 다른 재시도 정책을 통해 재 시도 할 수 있는 상태 코드 외에도 재시도 가능한 상태 코드 목록이 재시도 가능한 것으로 간주됩니다.
* 목록은 쉼표로 구분 된 정수 목록으로 "409"는 409를 재시도 할 수 있는 반면 "504,409"는 504와 409를 모두 재시도 할 수 있는 것으로 간주합니다.
* 이 헤더는 내부 클라이언트의 요청에만 적용됩니다.

#### gRPC 재시도 정책

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

