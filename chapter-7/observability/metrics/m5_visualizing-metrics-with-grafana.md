# Grafana로 메트릭 시각화(Visualizing Metrics with Grafana)


이 작업은 Istio Dashboard를 설정하고 사용하여 메시 트래픽을 모니터링하는 방법을 보여줍니다. 이 작업의 일부로 Grafana Istio 애드온 및 웹 기반 인터페이스를 사용하여 서비스 메시 트래픽 데이터를 확인합니다

[Bookinfo](https://istio.io/v1.7/docs/examples/bookinfo/) 샘플 애플리케이션은이 작업 전체에서 예제 애플리케이션으로 사용됩니다.


### 시작하기전에(Before you begin)

* 클러스터에 [Istio를 설치](https://istio.io/v1.7/docs/setup)합니다.
* [Grafana Addon](https://istio.io/v1.7/docs/ops/integrations/grafana/#option-1-quick-start)을 설치합니다.
* [Prometheus Addon](https://istio.io/v1.7/docs/ops/integrations/prometheus/#option-1-quick-start)을 설치합니다.
* [Bookinfo] https://istio.io/v1.7/docs/examples/bookinfo/) 애플리케이션을 배포합니다.



### Istio 대시 보드보기(Viewing the Istio dashboard)


  1. prometheus 서비스가 클러스터에서 실행 중인지 확인합니다.

  Kubernetes 환경에서 다음 명령을 실행하십시오.

> ```text
> $ kubectl -n istio-system get svc prometheus
> NAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
> prometheus   ClusterIP   10.100.250.202   <none>        9090/TCP   103s
> ```

  2. Grafana 서비스가 클러스터에서 실행 중인지 확인하십시오.

  Kubernetes 환경에서 다음 명령을 실행하십시오.

> ```text
> $ kubectl -n istio-system get svc grafana
> NAME      TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
> grafana   ClusterIP   10.103.244.103   <none>        3000/TCP   2m25s
> ```

  3. Grafana UI를 통해 Istio 대시 보드를 엽니 다.

    Kubernetes 환경에서 다음 명령을 실행하십시오.

> ```text
> $ istioctl dashboard grafana
>
> ```

    웹 브라우저에서 http://localhost:3000/dashboard/db/istio-mesh-dashboard를 방문하십시오.

    Istio 대시 보드는 다음과 유사합니다.

![Istio Dashboard](../../../.gitbook/assets/grafana-istio-dashboard.png)

  4. 메시에 트래픽을 보냅니다.

    Bookinfo 샘플의 경우 웹 브라우저에서 http://$GATEWAY\_URL/productpage를 방문하거나 다음 명령을 실행하십시오. 

> ```text
> $ curl http://$GATEWAY_URL/productpage
>
> ```

{% hint style="info" %}
`$ GATEWAY_URL`은 [Bookinfo](https://istio.io/v1.7/docs/examples/bookinfo/) 예시에서 설정 한 값입니다.
{% endhint %}

    페이지를 몇 번 새로 고치거나 \(또는 명령을 몇 번 보내\) 소량의 트래픽을 생성합니다.
    

    Istio 대시 보드를 다시보십시오. 생성 된 트래픽을 반영해야합니다. 다음과 유사합니다.

![Istio Dashboard With Traffic](../../../.gitbook/assets/dashboard-with-traffic.png)

    이를 통해 메시의 서비스 및 워크로드와 함께 메시의 글로벌보기를 제공합니다. 아래에 설명 된대로 특정 대시 보드로 이동하여 서비스 및 워크로드에 대한 자세한 정보를 얻을 수 있습니다.

  5. 서비스 대시 보드를 시각화합니다.

    Grafana 대시 보드의 왼쪽 모서리 탐색 메뉴에서 Istio Service Dashboard로 이동하거나 웹 브라우저에서 ttp://localhost:3000/dashboard/db/istio-service-dashboard를 방문 할 수 있습니다.
    
{% hint style="info" %}
서비스 드롭 다운에서 서비스를 선택해야 할 수 있습니다.
{% endhint %}

    Istio 서비스 대시 보드는 다음과 유사합니다: [  
](https://istio.io/v1.7/docs/tasks/observability/metrics/using-istio-dashboard/istio-service-dashboard.png)

![Istio Service Dashboard](../../../.gitbook/assets/istio-service-dashboard.png)

그러면 서비스에 대한 메트릭과 해당 서비스에 대한 클라이언트 워크로드 \(이 서비스를 호출하는 워크로드\) 및 서비스 워크로드 \(이 서비스를 제공하는 워크로드\)에 대한 세부 정보가 제공됩니다.


  6. 워크로드 대시 보드를 시각화합니다.

    Grafana 대시 보드의 왼쪽 모서리 탐색 메뉴에서 Istio Workload Dashboard로 이동하거나 웹 브라우저에서 http://localhost:3000/dashboard/db/istio-workload-dashboard를 방문 할 수 있습니다.

    Istio 워크로드 대시 보드는 다음과 유사합니다.:

![Istio Workload Dashboard](../../../.gitbook/assets/istio-workload-dashboard.png)

    그러면 각 워크로드에 대한 메트릭과 그 워크로드에 대한 인바운드 워크로드 \(이 워크로드에 요청을 보내는 워크로드\) 및 아웃 바운드 서비스\(이 워크로드가 요청을 보내는 서비스\)에 대한 세부 정보가 제공됩니다.



### Grafana 대시 보드 정보



Istio 대시 보드는 세 가지 주요 섹션으로 구성됩니다.:

1. 메시 요약보기. 이 섹션에서는 메시의 글로벌 요약보기를 제공하고 메시의 HTTP / gRPC 및 TCP 워크로드를 보여줍니다.
2. 개별 서비스보기. 이 섹션에서는 메시 \(HTTP / gRPC 및 TCP\) 내의 각 개별 서비스에 대한 요청 및 응답에 대한 측정 항목을 제공합니다. 또한이 서비스의 클라이언트 및 서비스 워크로드에 대한 메트릭을 제공합니다.
3. 개별 워크로드보기 :이 섹션에서는 메시 \(HTTP / gRPC 및 TCP\) 내의 각 개별 워크로드에 대한 요청 및 응답에 대한 메트릭을 제공합니다. 또한이 워크로드에 대한 인바운드 워크로드 및 아웃 바운드 서비스에 대한 메트릭을 제공합니다.

대시 보드 생성, 구성 및 편집 방법에 대한 자세한 내용은 [Grafana 문서](https://docs.grafana.org/)를 참조하세요.



### 정리하기(Cleanup)



* 실행중인 모든`kubectl port-forward` 프로세스를 제거합니다.:

  ```text
  $ killall kubectl
  ```

* 후속 작업을 탐색하지 않으려는 경우 [Bookinfo 정리](https://istio.io/v1.7/docs/examples/bookinfo/#cleanup) 지침을 참조하여 애플리케이션을 종료하세요.




### [docs](https://istio.io/v1.7/docs/tasks/observability/metrics/using-istio-dashboard/)

### [뒤로 가기](./README.md)









