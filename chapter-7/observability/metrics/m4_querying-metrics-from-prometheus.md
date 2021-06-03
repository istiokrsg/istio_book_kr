# [프로메테우스](Prometheus)에서 메트릭 쿼리



이 작업은 [프로메테우스](Prometheus) 를 사용하여 Istio 지표를 쿼리하는 방법을 보여줍니다. 이 작업의 일부로 메트릭 값을 쿼리하기 위해 웹 기반 인터페이스를 사용합니다.

[Bookinfo](https://istio.io/v1.7/docs/examples/bookinfo/) 샘플 애플리케이션은이 태스크 전체에서 예제 애플리케이션으로 사용됩니다.


### 시작하기 전에 - Before you begin

* 클러스터에 [이스티오](Istio) 설치하십시오. - [링크](https://istio.io/v1.7/docs/setup/)
* [Prometheus Addon](https://istio.io/v1.7/docs/ops/integrations/prometheus/#option-1-quick-start)을 설치합니다.
* Bookinfo [샘플](https://istio.io/v1.7/docs/examples/bookinfo/) 애플리케이션을 배포합니다.



### [이스티오](Istio) 메트릭 쿼리

  1. [프로메테우스](prometheus) 서비스가 클러스터에서 실행 중인지 확인합니다.

  [쿠버네티스](Kubernetes) 환경에서 다음 명령을 실행하십시오.

```bash
  $ kubectl -n istio-system get svc prometheus
  NAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
  prometheus   ClusterIP   10.109.160.254   <none>        9090/TCP   4m
```

  2. 메시에 트래픽을 보냅니다.

Bookinfo 샘플의 경우 웹 브라우저에서 `http://$GATEWAY_URL/productpage` 를 방문하거나 다음 명령을 실행하십시오.

```bash
$ curl "http://$GATEWAY_URL/productpage"

```

{% hint style="info" %}
$GATEWAY_URL은 [Bookinfo](https://istio.io/v1.7/docs/examples/bookinfo/) 예제에 설정된 값입니다.
{% endhint %}



  3. [프로메테우스](Prometheus) UI를 엽니다.

  [쿠버네티스](Kubernetes) 환경에서 다음 명령을 실행하십시오.

```bash
$ istioctl dashboard prometheus


```

  헤더에서 [프로메테우스](Prometheus) 오른쪽에있는 **Graph**를 클릭합니다.
    

  4. [프로메테우스](Prometheus) 쿼리를 실행합니다.

  웹 페이지 상단의 "표현식"입력 상자에 텍스트를 입력합니다.

```text
istio_requests_total


```

  그런 다음 **Execute** 버튼을 클릭합니다.

결과는 다음과 유사합니다.

![Prometheus Query Result](https://istio.io/v1.7/docs/tasks/observability/metrics/querying-metrics/prometheus_query_result.png)


**Execute** 버튼 아래의 그래프 탭을 선택하여 쿼리 결과를 그래픽으로 볼 수도 있습니다.


![Prometheus Query Result - Graphical](https://istio.io/v1.7/docs/tasks/observability/metrics/querying-metrics/prometheus_query_result_graphical.png)

다른 시도 할 쿼리 :

* productpage 서비스에 대한 모든 요청의 총계 :

```bash
istio_requests_total{destination_service="productpage.default.svc.cluster.local"}
```

* '리뷰'서비스의 'v3'에 대한 모든 요청의 총 수 :

```text
istio_requests_total{destination_service="reviews.default.svc.cluster.local", destination_version="v3"}
```

  이 쿼리는 리뷰 서비스 v3에 대한 모든 요청의 현재 총 개수를 반환합니다.

* productpage 서비스의 모든 인스턴스에 대한 지난 5 분 동안의 요청 비율 :

```bash
rate(istio_requests_total{destination_service=~"productpage.*", response_code="200"}[5m])

```



### [프로메테우스](Prometheus) 애드온 정보

[프로메테우스](Prometheus) 애드온은 Istio 엔드 포인트를 스크 레이 핑하여 메트릭을 수집하도록 사전 구성된 [프로메테우스](Prometheus) 서버입니다. 영구 저장 및 Istio 메트릭 쿼리를위한 메커니즘을 제공합니다.



[프로메테우스](Prometheus) 쿼리에 대한 자세한 내용은 [querying docs](https://prometheus.io/docs/querying/basics/)를 참조하십시오..  


<<<<<<< HEAD
<<<<<<< Updated upstream

* Remove any istioctl processes that may still be running using control-C or:
=======
* control-C 또는 다음을 사용하여 여전히 실행중인 모든 istioctl 프로세스를 제거합니다.
>>>>>>> Stashed changes
=======
### 정리 - Cleanup

>>>>>>> fbb751e9beb9f9a59badaf2716a2c543b19ac36f

* control-C 또는 다음을 사용하여 여전히 실행중인 모든 istioctl 프로세스를 제거합니다.

```text
$ killall istioctl
```

* 후속 작업을 계속하지 않으려는 경우 [Bookinfo 정리](https://istio.io/v1.7/docs/examples/bookinfo/#cleanup) 지침을 참조하여 응용 프로그램을 종료하십시오.

### [참조](https://istio.io/v1.7/docs/tasks/observability/metrics/querying-metrics/)

### [뒤로 가기](./README.md)