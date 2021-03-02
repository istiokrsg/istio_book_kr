# Querying Metrics from Prometheus

ref : [https://istio.io/v1.7/docs/tasks/observability/metrics/querying-metrics/](https://istio.io/v1.7/docs/tasks/observability/metrics/querying-metrics/)

## Querying Metrics from Prometheus <a id="title"></a>



This task shows you how to query for Istio Metrics using Prometheus. As part of this task, you will use the web-based interface for querying metric values.

The [Bookinfo](https://istio.io/v1.7/docs/examples/bookinfo/) sample application is used as the example application throughout this task.  


### Before you begin <a id="before-you-begin"></a>

* [Install Istio](https://istio.io/v1.7/docs/setup) in your cluster.
* Install the [Prometheus Addon](https://istio.io/v1.7/docs/ops/integrations/prometheus/#option-1-quick-start).
* Deploy the [Bookinfo](https://istio.io/v1.7/docs/examples/bookinfo/) application.



### Querying Istio metrics <a id="querying-istio-metrics"></a>

  1. Verify that the prometheus service is running in your cluster.

  In Kubernetes environments, execute the following command:

```text
$ kubectl -n istio-system get svc prometheus
NAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
prometheus   ClusterIP   10.109.160.254   <none>        9090/TCP   4m
```

  2. Send traffic to the mesh.

  For the Bookinfo sample, visit http://$GATEWAY\_URL/productpage in your web browser or issue the following command:

```text
$ curl "http://$GATEWAY_URL/productpage"

```

{% hint style="info" %}
$GATEWAY\_URL is the value set in the Bookinfo example.
{% endhint %}



  3. Open the Prometheus UI.

  In Kubernetes environments, execute the following command:

```text
$ istioctl dashboard prometheus


```

    Click **Graph** to the right of Prometheus in the header.

  4. Execute a Prometheus query.

  In the “Expression” input box at the top of the web page, enter the text:

```text
istio_requests_total


```

  Then, click the Execute button.

The results will be similar to:

![ddd](../../../.gitbook/assets/prometheus_query_result.png)

You can also see the query results graphically by selecting the Graph tab underneath the Execute button.



![Prometheus Query Result - Graphical](../../../.gitbook/assets/prometheus_query_result_graphical.png)

Other queries to try:

* Total count of all requests to the productpage service:

> ```text
>
> ```

* Total count of all requests to `v3` of the `reviews` service:

> ```text
> istio_requests_total{destination_service="reviews.default.svc.cluster.local", destination_version="v3"}
>
> ```

  This query returns the current total count of all requests to the v3 of the `reviews` service.

* Rate of requests over the past 5 minutes to all instances of the productpage service:

> ```text
> rate(istio_requests_total{destination_service=~"productpage.*", response_code="200"}[5m])
>
> ```



### About the Prometheus addon

The Prometheus addon is a Prometheus server that comes preconfigured to scrape Istio endpoints to collect metrics. It provides a mechanism for persistent storage and querying of Istio metrics.



For more on querying Prometheus, please read their [querying docs](https://prometheus.io/docs/querying/basics/).  


### Cleanup



* Remove any istioctl processes that may still be running using control-C or:

> ```text
> $ killall istioctl
>
> ```

* If you are not planning to explore any follow-on tasks, refer to the Bookinfo cleanup instructions to shutdown the application.



### [뒤로 가기](./README.md)