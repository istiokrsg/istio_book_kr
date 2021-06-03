# Envoy의 액세스 로그 가져 오기


가장 간단한 Istio 로깅 유형은 [Envoy의 액세스 로깅] (https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage)입니다. Envoy 프록시는 액세스 정보를 표준 출력으로 인쇄합니다. 그런 다음 Envoy 컨테이너의 표준 출력은`kubectl logs` 명령으로 인쇄 할 수 있습니다.

### 시작하기전에(Before you begin)

* [설치 가이드](https://istio.io/v1.7/docs/setup/)의 지침에 따라 Istio를 설정합니다.`demo` [구성 프로필](https://istio.io/v1.7/docs/setup/additional-setup/config-profiles/)을 설치하면 송신 게이트웨이 및 액세스 로깅이 활성화됩니다.
* 요청 전송을위한 테스트 소스로 사용할 [sleep](https://github.com/istio/istio/tree/release-1.7/samples/sleep) 샘플 앱을 배포합니다. [자동 사이드카 삽입](https://istio.io/v1.7/docs/setup/additional-setup/sidecar-injection/#automatic-sidecar-injection)을 사용 설정 한 경우 다음 명령어를 실행하여 샘플 앱을 배포하세요.:


  ```text
  $ kubectl apply -f samples/sleep/sleep.yaml
  ```

  그렇지 않으면 다음 명령을 사용하여`sleep` 애플리케이션을 배포하기 전에 사이드카를 수동으로 삽입합니다.:

  ```text
  $ kubectl apply -f <(istioctl kube-inject -f samples/sleep/sleep.yaml)
  ```

  `curl`이 설치된 모든 포드를 테스트 소스로 사용할 수 있습니다.

* `SOURCE_POD` 환경 변수를 소스 포드의 이름으로 설정합니다.:

  ```text
  $ export SOURCE_POD=$(kubectl get pod -l app=sleep -o jsonpath={.items..metadata.name})
  ```

* [httpbin](https://github.com/istio/istio/tree/release-1.7/samples/httpbin) 샘플을 시작합니다.

  [자동 사이드카 삽입](https://istio.io/v1.7/docs/setup/additional-setup/sidecar-injection/#automatic-sidecar-injection)을 사용 설정 한 경우 'httpbin'서비스를 배포합니다.:

  ```text
  $ kubectl apply -f samples/httpbin/httpbin.yaml
  ```

  그렇지 않으면`httpbin` 애플리케이션을 배포하기 전에 수동으로 사이드카를 삽입해야합니다.:

  ```text
  $ kubectl apply -f <(istioctl kube-inject -f samples/httpbin/httpbin.yaml)
  ```

### Envoy의 액세스 로깅 활성화(Enable Envoy’s access logging)

`IstioOperator` CR을 사용하여 Istio를 설치 한 경우 다음 필드를 구성에 추가합니다.

```text
spec:
  meshConfig:
    accessLogFile: /dev/stdout
```

그렇지 않으면 원래`istioctl install` 명령에 동등한 설정을 추가합니다. 예를 들면 다음과 같습니다.:

```text
$ istioctl install <flags-you-used-to-install-Istio> --set meshConfig.accessLogFile=/dev/stdout
```

`accessLogEncoding`을`JSON` 또는`TEXT`로 설정하여 JSON과 텍스트 중에서 선택할 수도 있습니다.

'accessLogFormat'을 수정하여 액세스 로그의 [형식](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#format-rules)을 맞춤 설정할 수도 있습니다.

이 세 가지 설정에 대한 자세한 내용은 [글로벌 메시 옵션](https://istio.io/v1.7/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig)을 참조하세요.:

* `meshConfig.accessLogFile`
* `meshConfig.accessLogEncoding`
* `meshConfig.accessLogFormat`

### 액세스 로그 테스트(Test the access log)

1. `sleep`에서`httpbin`으로 요청 보내기:

   ```text
   $ kubectl exec "$SOURCE_POD" -c sleep -- curl -v httpbin:8000/status/418
   ...
   < HTTP/1.1 418 Unknown
   < server: envoy
   ...
       -=[ teapot ]=-

          _...._
        .'  _ _ `.
       | ."` ^ `". _,
       \_;`"---"`|//
         |       ;/
         \_     _/
           `"""`
   ```

2. 'sleep'로그 확인:

   ```text
   $ kubectl logs -l app=sleep -c istio-proxy
   [2019-03-06T09:31:27.354Z] "GET /status/418 HTTP/1.1" 418 - "-" 0 135 11 10 "-" "curl/7.60.0" "d209e46f-9ed5-9b61-bbdd-43e22662702a" "httpbin:8000" "172.30.146.73:80" outbound|8000||httpbin.default.svc.cluster.local - 172.21.13.94:8000 172.30.146.82:60290 -
   ```

3. `httpbin`의 로그 확인:

   ```text
   $ kubectl logs -l app=httpbin -c istio-proxy
   [2019-03-06T09:31:27.360Z] "GET /status/418 HTTP/1.1" 418 - "-" 0 135 5 2 "-" "curl/7.60.0" "d209e46f-9ed5-9b61-bbdd-43e22662702a" "httpbin:8000" "127.0.0.1:80" inbound|8000|http|httpbin.default.svc.cluster.local - 172.30.146.73:80 172.30.146.82:38618 outbound_.8000_._.httpbin.default.svc.cluster.local
   ```

요청에 해당하는 메시지는 각각 소스와 대상인 'sleep'및 'httpbin'의 Istio 프록시 로그에 표시됩니다. 로그에서 HTTP 동사\(`GET`\), HTTP 경로 \(`/ status / 418`\), 응답 코드 \(`418`\) 및 기타 [요청 관련 정보](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#format-rules).

### 정리하기(Cleanup)

[sleep](https://github.com/istio/istio/tree/release-1.7/samples/sleep) 및 [httpbin](https://github.com/istio/istio/tree/release-1.7을 종료합니다. /samples/httpbin) 서비스:

```text
$ kubectl delete -f samples/sleep/sleep.yaml
$ kubectl delete -f samples/httpbin/httpbin.yaml
```

#### Envoy의 액세스 로깅 비활성화(Disable Envoy’s access logging)

Istio 설치 구성에서`meshConfig.accessLogFile` 설정을 제거하거나` ""`로 설정합니다. 아래 예에서`default`를 Istio를 설치할 때 사용한 프로필 이름으로 바꿉니다.

```text
$ istioctl install --set profile=default
✔ Istio core installed
✔ Istiod installed
✔ Ingress gateways installed
✔ Installation complete
```

ref : [https://istio.io/v1.7/docs/tasks/observability/logs/access-log/](https://istio.io/v1.7/docs/tasks/observability/logs/access-log/)

### [뒤로 가기](./README.md)