# Visualizing Metrics with Grafana

ref: [https://istio.io/v1.7/docs/tasks/observability/metrics/using-istio-dashboard/](https://istio.io/v1.7/docs/tasks/observability/metrics/using-istio-dashboard/)



## Visualizing Metrics with Grafana



This task shows you how to setup and use the Istio Dashboard to monitor mesh traffic. As part of this task, you will use the Grafana Istio addon and the web-based interface for viewing service mesh traffic data.

The [Bookinfo](https://istio.io/v1.7/docs/examples/bookinfo/) sample application is used as the example application throughout this task.  


### Before you begin <a id="before-you-begin"></a>

* [Install Istio](https://istio.io/v1.7/docs/setup) in your cluster.
* Install the [Grafana Addon](https://istio.io/v1.7/docs/ops/integrations/grafana/#option-1-quick-start).
* Install the [Prometheus Addon](https://istio.io/v1.7/docs/ops/integrations/prometheus/#option-1-quick-start).
* Deploy the [Bookinfo](https://istio.io/v1.7/docs/examples/bookinfo/) application.



### Viewing the Istio dashboard <a id="viewing-the-istio-dashboard"></a>



  1. Verify that the prometheus service is running in your cluster.

  In Kubernetes environments, execute the following command:

> ```text
> $ kubectl -n istio-system get svc prometheus
> NAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
> prometheus   ClusterIP   10.100.250.202   <none>        9090/TCP   103s
> ```

  2. Verify that the Grafana service is running in your cluster.

  In Kubernetes environments, execute the following command:

> ```text
> $ kubectl -n istio-system get svc grafana
> NAME      TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
> grafana   ClusterIP   10.103.244.103   <none>        3000/TCP   2m25s
> ```

  3. Open the Istio Dashboard via the Grafana UI.

    In Kubernetes environments, execute the following command:

> ```text
> $ istioctl dashboard grafana
>
> ```

    Visit http://localhost:3000/dashboard/db/istio-mesh-dashboard in your web browser.

    The Istio Dashboard will look similar to:

![Istio Dashboard](../../../.gitbook/assets/grafana-istio-dashboard.png)

  4. Send traffic to the mesh.

    For the Bookinfo sample, visit http://$GATEWAY\_URL/productpage in your web browser or issue the following command:

> ```text
> $ curl http://$GATEWAY_URL/productpage
>
> ```

{% hint style="info" %}
`$GATEWAY_URL` is the value set in the [Bookinfo](https://istio.io/v1.7/docs/examples/bookinfo/) example.
{% endhint %}

    Refresh the page a few times \(or send the command a few times\) to generate a small amount of traffic.

    Look at the Istio Dashboard again. It should reflect the traffic that was generated. It will look similar to:

![Istio Dashboard With Traffic](../../../.gitbook/assets/dashboard-with-traffic.png)

    This gives the global view of the Mesh along with services and workloads in the mesh. You can get more details about services and workloads by navigating to their specific dashboards as explained below.

  5. Visualize Service Dashboards.

    From the Grafana dashboard’s left hand corner navigation menu, you can navigate to Istio Service Dashboard or visit http://localhost:3000/dashboard/db/istio-service-dashboard in your web browser.

{% hint style="info" %}
You may need to select a service in the Service dropdown.
{% endhint %}

    The Istio Service Dashboard will look similar to:[  
](https://istio.io/v1.7/docs/tasks/observability/metrics/using-istio-dashboard/istio-service-dashboard.png)

![Istio Service Dashboard](../../../.gitbook/assets/istio-service-dashboard.png)

This gives details about metrics for the service and then client workloads \(workloads that are calling this service\) and service workloads \(workloads that are providing this service\) for that service.

  6. Visualize Workload Dashboards.

    From the Grafana dashboard’s left hand corner navigation menu, you can navigate to Istio Workload Dashboard or visit http://localhost:3000/dashboard/db/istio-workload-dashboard in your web browser.

    The Istio Workload Dashboard will look similar to:

![Istio Workload Dashboard](../../../.gitbook/assets/istio-workload-dashboard.png)

    This gives details about metrics for each workload and then inbound workloads \(workloads that are sending request to this workload\) and outbound services \(services to which this workload send requests\) for that workload.



### About the Grafana dashboards



The Istio Dashboard consists of three main sections:

1. A Mesh Summary View. This section provides Global Summary view of the Mesh and shows HTTP/gRPC and TCP workloads in the Mesh.
2. Individual Services View. This section provides metrics about requests and responses for each individual service within the mesh \(HTTP/gRPC and TCP\). This also provides metrics about client and service workloads for this service.
3. Individual Workloads View: This section provides metrics about requests and responses for each individual workload within the mesh \(HTTP/gRPC and TCP\). This also provides metrics about inbound workloads and outbound services for this workload.

For more on how to create, configure, and edit dashboards, please see the [Grafana documentation](https://docs.grafana.org/).



### Cleanup



* Remove any `kubectl port-forward` processes that may be running:

  ```text
  $ killall kubectl
  ```

* If you are not planning to explore any follow-on tasks, refer to the [Bookinfo cleanup](https://istio.io/v1.7/docs/examples/bookinfo/#cleanup) instructions to shutdown the application.























