---
description: 워낙 필요한 내용이라 (간략하게라도) 추가해야 할 것 같네요
---

# 일반적인 베스트프랙티스

## 배포

### Deploy fewer clusters <a id="deploy-fewer-clusters"></a>

Deploy Istio across a small number of large clusters, rather than a large number of small clusters. Instead of adding clusters to your deployment, the best practice is to use [namespace tenancy](https://istio.io/latest/docs/ops/deployment/deployment-models/#namespace-tenancy) to manage large clusters. Following this approach, you can deploy Istio across one or two clusters per zone or region. You can then deploy a control plane on one cluster per region or zone for added reliability.

### Deploy clusters near your users <a id="deploy-clusters-near-your-users"></a>

Include clusters in your deployment across the globe for **geographic proximity to end-users**. Proximity helps your deployment have low latency.

### Deploy across multiple availability zones <a id="deploy-across-multiple-availability-zones"></a>

Include clusters in your deployment **across multiple availability regions and zones** within each geographic region. This approach limits the size of the failure domains of your deployment, and helps you avoid global failures.

## 트래픽 관리

### Set default routes for services <a id="set-default-routes-for-services"></a>

Although the default Istio behavior conveniently sends traffic from any source to all versions of a destination service without any rules being set, creating a `VirtualService` with a default route for every service, right from the start, is generally considered a best practice in Istio.

Even if you initially have only one version of a service, as soon as you decide to deploy a second version, you need to have a routing rule in place **before** the new version is started, to prevent it from immediately receiving traffic in an uncontrolled way.

Another potential issue when relying on Istio’s default round-robin routing is due to a subtlety in Istio’s destination rule evaluation algorithm. When routing a request, Envoy first evaluates route rules in virtual services to determine if a particular subset is being routed to. If so, only then will it activate any destination rule policies corresponding to the subset. Consequently, Istio only applies the policies you define for specific subsets if you **explicitly** routed traffic to the corresponding subset.

For example, consider the following destination rule as the one and only configuration defined for the _reviews_ service, that is, there are no route rules in a corresponding `VirtualService` definition:

```text
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: reviews
spec:
  host: reviews
  subsets:
  - name: v1
    labels:
      version: v1
    trafficPolicy:
      connectionPool:
        tcp:
          maxConnections: 100
```

Even if Istio’s default round-robin routing calls “v1” instances on occasion, maybe even always if “v1” is the only running version, the above traffic policy will never be invoked.

You can fix the above example in one of two ways. You can either move the traffic policy up a level in the `DestinationRule` to make it apply to any version:

```text
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: reviews
spec:
  host: reviews
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
  subsets:
  - name: v1
    labels:
      version: v1
```

Or, better yet, define a proper route rule for the service in the `VirtualService` definition. For example, add a simple route rule for “reviews:v1”:

```text
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: reviews
spec:
  hosts:
  - reviews
  http:
  - route:
    - destination:
        host: reviews
        subset: v1
```

### Control configuration sharing across namespaces <a id="cross-namespace-configuration"></a>

You can define virtual services, destination rules, or service entries in one namespace and then reuse them in other namespaces, if they are exported to those namespaces. Istio exports all traffic management resources to all namespaces by default, but you can override the visibility with the `exportTo` field. For example, only clients in the same namespace can use the following virtual service:

```text
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: myservice
spec:
  hosts:
  - myservice.com
  exportTo:
  - "."
  http:
  - route:
    - destination:
        host: myservice
```

You can similarly control the visibility of a Kubernetes `Service` using the `networking.istio.io/exportTo` annotation.

Setting the visibility of destination rules in a particular namespace doesn’t guarantee the rule is used. Exporting a destination rule to other namespaces enables you to use it in those namespaces, but to actually be applied during a request the namespace also needs to be on the destination rule lookup path:

1. client namespace
2. service namespace
3. Istio configuration root \(`istio-system` by default\)

For example, consider the following destination rule:

```text
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: myservice
spec:
  host: myservice.default.svc.cluster.local
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
```

Let’s assume you create this destination rule in namespace `ns1`.

If you send a request to the `myservice` service from a client in `ns1`, the destination rule would be applied, because it is in the first namespace on the lookup path, that is, in the client namespace.

If you now send the request from a different namespace, for example `ns2`, the client is no longer in the same namespace as the destination rule, `ns1`. Because the corresponding service, `myservice.default.svc.cluster.local`, is also not in `ns1`, but rather in the `default` namespace, the destination rule will also not be found in the second namespace of the lookup path, the service namespace.

Even if the `myservice` service is exported to all namespaces and therefore visible in `ns2` and the destination rule is also exported to all namespaces, including `ns2`, it will not be applied during the request from `ns2` because it’s not in any of the namespaces on the lookup path.

You can avoid this problem by creating the destination rule in the same namespace as the corresponding service, `default` in this example. It would then get applied to requests from clients in any namespace. You can also move the destination rule to the `istio-system` namespace, the third namespace on the lookup path, although this isn’t recommended unless the destination rule is really a global configuration that is applicable in all namespaces, and it would require administrator authority.

Istio uses this restricted destination rule lookup path for two reasons:

1. Prevent destination rules from being defined that can override the behavior of services in completely unrelated namespaces.
2. Have a clear lookup order in case there is more than one destination rule for the same host.

### Split large virtual services and destination rules into multiple resources <a id="split-virtual-services"></a>

In situations where it is inconvenient to define the complete set of route rules or policies for a particular host in a single `VirtualService` or `DestinationRule` resource, it may be preferable to incrementally specify the configuration for the host in multiple resources. Pilot will merge such destination rules and merge such virtual services if they are bound to a gateway.

Consider the case of a `VirtualService` bound to an ingress gateway exposing an application host which uses path-based delegation to several implementation services, something like this:

```text
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: myapp
spec:
  hosts:
  - myapp.com
  gateways:
  - myapp-gateway
  http:
  - match:
    - uri:
        prefix: /service1
    route:
    - destination:
        host: service1.default.svc.cluster.local
  - match:
    - uri:
        prefix: /service2
    route:
    - destination:
        host: service2.default.svc.cluster.local
  - match:
    ...
```

The downside of this kind of configuration is that other configuration \(e.g., route rules\) for any of the underlying microservices, will need to also be included in this single configuration file, instead of in separate resources associated with, and potentially owned by, the individual service teams. See [Route rules have no effect on ingress gateway requests](https://istio.io/latest/docs/ops/common-problems/network-issues/#route-rules-have-no-effect-on-ingress-gateway-requests) for details.

To avoid this problem, it may be preferable to break up the configuration of `myapp.com` into several `VirtualService` fragments, one per backend service. For example:

```text
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: myapp-service1
spec:
  hosts:
  - myapp.com
  gateways:
  - myapp-gateway
  http:
  - match:
    - uri:
        prefix: /service1
    route:
    - destination:
        host: service1.default.svc.cluster.local
---
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: myapp-service2
spec:
  hosts:
  - myapp.com
  gateways:
  - myapp-gateway
  http:
  - match:
    - uri:
        prefix: /service2
    route:
    - destination:
        host: service2.default.svc.cluster.local
---
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: myapp-...
```

When a second and subsequent `VirtualService` for an existing host is applied, `istio-pilot` will merge the additional route rules into the existing configuration of the host. There are, however, several caveats with this feature that must be considered carefully when using it.

1. Although the order of evaluation for rules in any given source `VirtualService` will be retained, the cross-resource order is UNDEFINED. In other words, there is no guaranteed order of evaluation for rules across the fragment configurations, so it will only have predictable behavior if there are no conflicting rules or order dependency between rules across fragments.
2. There should only be one “catch-all” rule \(i.e., a rule that matches any request path or header\) in the fragments. All such “catch-all” rules will be moved to the end of the list in the merged configuration, but since they catch all requests, whichever is applied first will essentially override and disable any others.
3. A `VirtualService` can only be fragmented this way if it is bound to a gateway. Host merging is not supported in sidecars.

A `DestinationRule` can also be fragmented with similar merge semantic and restrictions.

1. There should only be one definition of any given subset across multiple destination rules for the same host. If there is more than one with the same name, the first definition is used and any following duplicates are discarded. No merging of subset content is supported.
2. There should only be one top-level `trafficPolicy` for the same host. When top-level traffic policies are defined in multiple destination rules, the first one will be used. Any following top-level `trafficPolicy` configuration is discarded.
3. Unlike virtual service merging, destination rule merging works in both sidecars and gateways.

### Avoid 503 errors while reconfiguring service routes <a id="avoid-503-errors-while-reconfiguring-service-routes"></a>

When setting route rules to direct traffic to specific versions \(subsets\) of a service, care must be taken to ensure that the subsets are available before they are used in the routes. Otherwise, calls to the service may return 503 errors during a reconfiguration period.

Creating both the `VirtualServices` and `DestinationRules` that define the corresponding subsets using a single `kubectl` call \(e.g., `kubectl apply -f myVirtualServiceAndDestinationRule.yaml` is not sufficient because the resources propagate \(from the configuration server, i.e., Kubernetes API server\) to the Pilot instances in an eventually consistent manner. If the `VirtualService` using the subsets arrives before the `DestinationRule` where the subsets are defined, the Envoy configuration generated by Pilot would refer to non-existent upstream pools. This results in HTTP 503 errors until all configuration objects are available to Pilot.

To make sure services will have zero down-time when configuring routes with subsets, follow a “make-before-break” process as described below:

* When adding new subsets:
  1. Update `DestinationRules` to add a new subset first, before updating any `VirtualServices` that use it. Apply the rule using `kubectl` or any platform-specific tooling.
  2. Wait a few seconds for the `DestinationRule` configuration to propagate to the Envoy sidecars
  3. Update the `VirtualService` to refer to the newly added subsets.
* When removing subsets:
  1. Update `VirtualServices` to remove any references to a subset, before removing the subset from a `DestinationRule`.
  2. Wait a few seconds for the `VirtualService` configuration to propagate to the Envoy sidecars.
  3. Update the `DestinationRule` to remove the unused subsets.

## 보안

### Use namespaces for isolation <a id="use-namespaces-for-isolation"></a>

If there are multiple service operators \(a.k.a. [SREs](https://en.wikipedia.org/wiki/Site_reliability_engineering)\) deploying different services in a medium- or large-size cluster, we recommend creating a separate [Kubernetes namespace](https://kubernetes.io/docs/tasks/administer-cluster/namespaces-walkthrough/) for each SRE team to isolate their access. For example, you can create a `team1-ns` namespace for `team1`, and `team2-ns` namespace for `team2`, such that both teams cannot access each other’s services.

Let us consider a three-tier application with three services: `photo-frontend`, `photo-backend`, and `datastore`. The photo SRE team manages the `photo-frontend` and `photo-backend` services while the datastore SRE team manages the `datastore` service. The `photo-frontend` service can access `photo-backend`, and the `photo-backend` service can access `datastore`. However, the `photo-frontend` service cannot access `datastore`.

In this scenario, a cluster administrator creates two namespaces: `photo-ns` and `datastore-ns`. The administrator has access to all namespaces and each team only has access to its own namespace. The photo SRE team creates two service accounts to run `photo-frontend` and `photo-backend` respectively in the `photo-ns` namespace. The datastore SRE team creates one service account to run the `datastore` service in the `datastore-ns` namespace. Moreover, we need to enforce the service access control in [Istio Mixer](https://istio.io/v1.6/docs/reference/config/policy-and-telemetry/) such that `photo-frontend` cannot access datastore.

In this setup, Kubernetes can isolate the operator privileges on managing the services. Istio manages certificates and keys in all namespaces and enforces different access control rules to the services.

### Configure third party service account tokens <a id="configure-third-party-service-account-tokens"></a>

To authenticate with the Istio control plane, the Istio proxy will use a Service Account token. Kubernetes supports two forms of these tokens:

* Third party tokens, which have a scoped audience and expiration.
* First party tokens, which have no expiration and are mounted into all pods.

Because the properties of the first party token are less secure, Istio will default to using third party tokens. However, this feature is not enabled on all Kubernetes platforms.

If you are using `istioctl` to install, support will be automatically detected. This can be done manually as well, and configured by passing `--set values.global.jwtPolicy=third-party-jwt` or `--set values.global.jwtPolicy=first-party-jwt`.

To determine if your cluster supports third party tokens, look for the `TokenRequest` API. If this returns no response, then the feature is not supported:

```text
$ kubectl get --raw /api/v1 | jq '.resources[] | select(.name | index("serviceaccounts/token"))'
{
    "name": "serviceaccounts/token",
    "singularName": "",
    "namespaced": true,
    "group": "authentication.k8s.io",
    "version": "v1",
    "kind": "TokenRequest",
    "verbs": [
        "create"
    ]
}
```

While most cloud providers support this feature now, many local development tools and custom installations may not. To enable this feature, please refer to the [Kubernetes documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#service-account-token-volume-projection).

## 관측성

### Using Prometheus for production-scale monitoring <a id="using-prometheus-for-production-scale-monitoring"></a>

The recommended approach for production-scale monitoring of Istio meshes with Prometheus is to use [hierarchical federation](https://prometheus.io/docs/prometheus/latest/federation/#hierarchical-federation) in combination with a collection of [recording rules](https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/).

In default deployments of Istio, a deployment of [Prometheus](http://prometheus.io/) is provided for collecting metrics generated for all mesh traffic. This deployment of Prometheus is intentionally deployed with a very short retention window \(6 hours\). The default Prometheus deployment is also configured to collect metrics from each Envoy proxy running in the mesh, augmenting each metric with a set of labels about their origin \(`instance`, `pod`, and `namespace`\).

While the default configuration is well-suited for small clusters and monitoring for short time horizons, it is not suitable for large-scale meshes or monitoring over a period of days or weeks. In particular, the introduced labels can increase metrics cardinality, requiring a large amount of storage. And, when trying to identify trends and differences in traffic over time, access to historical data can be paramount.[![Architecture for production monitoring of Istio using Prometheus.](https://istio.io/latest/docs/ops/best-practices/observability/production-prometheus.svg)](https://istio.io/latest/docs/ops/best-practices/observability/production-prometheus.svg)Production-scale Istio monitoring with Istio

#### Workload-level aggregation via recording rules <a id="workload-level-aggregation-via-recording-rules"></a>

In order to aggregate metrics across instances and pods, update the default Prometheus configuration with the following recording rules:Plain Prometheus RulesPrometheus Operator Rules CRD

```text
groups:
- name: "istio.recording-rules"
  interval: 5s
  rules:
  - record: "workload:istio_requests_total"
    expr: |
      sum without(instance, namespace, pod) (istio_requests_total)

  - record: "workload:istio_request_duration_milliseconds_count"
    expr: |
      sum without(instance, namespace, pod) (istio_request_duration_milliseconds_count)

  - record: "workload:istio_request_duration_milliseconds_sum"
    expr: |
      sum without(instance, namespace, pod) (istio_request_duration_milliseconds_sum)

  - record: "workload:istio_request_duration_milliseconds_bucket"
    expr: |
      sum without(instance, namespace, pod) (istio_request_duration_milliseconds_bucket)

  - record: "workload:istio_request_bytes_count"
    expr: |
      sum without(instance, namespace, pod) (istio_request_bytes_count)

  - record: "workload:istio_request_bytes_sum"
    expr: |
      sum without(instance, namespace, pod) (istio_request_bytes_sum)

  - record: "workload:istio_request_bytes_bucket"
    expr: |
      sum without(instance, namespace, pod) (istio_request_bytes_bucket)

  - record: "workload:istio_response_bytes_count"
    expr: |
      sum without(instance, namespace, pod) (istio_response_bytes_count)

  - record: "workload:istio_response_bytes_sum"
    expr: |
      sum without(instance, namespace, pod) (istio_response_bytes_sum)

  - record: "workload:istio_response_bytes_bucket"
    expr: |
      sum without(instance, namespace, pod) (istio_response_bytes_bucket)

  - record: "workload:istio_tcp_connections_opened_total"
    expr: |
      sum without(instance, namespace, pod) (istio_tcp_connections_opened_total)

  - record: "workload:istio_tcp_connections_closed_total"
    expr: |
      sum without(instance, namespace, pod) (istio_tcp_connections_closed_total)

  - record: "workload:istio_tcp_sent_bytes_total_count"
    expr: |
      sum without(instance, namespace, pod) (istio_tcp_sent_bytes_total_count)

  - record: "workload:istio_tcp_sent_bytes_total_sum"
    expr: |
      sum without(instance, namespace, pod) (istio_tcp_sent_bytes_total_sum)

  - record: "workload:istio_tcp_sent_bytes_total_bucket"
    expr: |
      sum without(instance, namespace, pod) (istio_tcp_sent_bytes_total_bucket)

  - record: "workload:istio_tcp_received_bytes_total_count"
    expr: |
      sum without(instance, namespace, pod) (istio_tcp_received_bytes_total_count)

  - record: "workload:istio_tcp_received_bytes_total_sum"
    expr: |
      sum without(instance, namespace, pod) (istio_tcp_received_bytes_total_sum)

  - record: "workload:istio_tcp_received_bytes_total_bucket"
    expr: |
      sum without(instance, namespace, pod) (istio_tcp_received_bytes_total_bucket)
```

The recording rules above only aggregate across pods and instances. They still preserve the full set of [Istio Standard Metrics](https://istio.io/latest/docs/reference/config/metrics/), including all Istio dimensions. While this will help with controlling metrics cardinality via federation, you may want to further optimize the recording rules to match your existing dashboards, alerts, and ad-hoc queries.

For more information on tailoring your recording rules, see the section on [Optimizing metrics collection with recording rules](https://istio.io/latest/docs/ops/best-practices/observability/#optimizing-metrics-collection-with-recording-rules).

#### Federation using workload-level aggregated metrics <a id="federation-using-workload-level-aggregated-metrics"></a>

To establish Prometheus federation, modify the configuration of your production-ready deployment of Prometheus to scrape the federation endpoint of the Istio Prometheus.

Add the following job to your configuration:

```text
- job_name: 'istio-prometheus'
  honor_labels: true
  metrics_path: '/federate'
  kubernetes_sd_configs:
  - role: pod
    namespaces:
      names: ['istio-system']
  metric_relabel_configs:
  - source_labels: [__name__]
    regex: 'workload:(.*)'
    target_label: __name__
    action: replace
  params:
    'match[]':
    - '{__name__=~"workload:(.*)"}'
    - '{__name__=~"pilot(.*)"}'
```

If you are using the [Prometheus Operator](https://github.com/coreos/prometheus-operator), use the following configuration instead:

```text
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: istio-federation
  labels:
    app.kubernetes.io/name: istio-prometheus
spec:
  namespaceSelector:
    matchNames:
    - istio-system
  selector:
    matchLabels:
      app: prometheus
  endpoints:
  - interval: 30s
    scrapeTimeout: 30s
    params:
      'match[]':
      - '{__name__=~"workload:(.*)"}'
      - '{__name__=~"pilot(.*)"}'
    path: /federate
    targetPort: 9090
    honorLabels: true
    metricRelabelings:
    - sourceLabels: ["__name__"]
      regex: 'workload:(.*)'
      targetLabel: "__name__"
      action: replace
```

The key to the federation configuration is matching on the job in the Istio-deployed Prometheus that is collecting [Istio Standard Metrics](https://istio.io/latest/docs/reference/config/metrics/) and renaming any metrics collected by removing the prefix used in the workload-level recording rules \(`workload:`\). This will allow existing dashboards and queries to seamlessly continue working when pointed at the production Prometheus instance \(and away from the Istio instance\).

You can also include additional metrics \(for example, envoy, go, etc.\) when setting up federation.

Control plane metrics are also collected and federated up to the production Prometheus.

#### Optimizing metrics collection with recording rules <a id="optimizing-metrics-collection-with-recording-rules"></a>

Beyond just using recording rules to [aggregate over pods and instances](https://istio.io/latest/docs/ops/best-practices/observability/#workload-level-aggregation-via-recording-rules), you may want to use recording rules to generate aggregated metrics tailored specifically to your existing dashboards and alerts. Optimizing your collection in this manner can result in large savings in resource consumption in your production instance of Prometheus, in addition to faster query performance.

For example, imagine a custom monitoring dashboard that used the following Prometheus queries:

* Total rate of requests averaged over the past minute by destination service name and namespace

  ```text
  sum(irate(istio_requests_total{reporter="source"}[1m]))
  by (
      destination_canonical_service,
      destination_workload_namespace
  )
  ```

* P95 client latency averaged over the past minute by source and destination service names and namespace

  ```text
  histogram_quantile(0.95,
    sum(irate(istio_request_duration_milliseconds_bucket{reporter="source"}[1m]))
    by (
      destination_canonical_service,
      destination_workload_namespace,
      source_canonical_service,
      source_workload_namespace,
      le
    )
  )
  ```

The following set of recording rules could be added to the Istio Prometheus configuration, using the `istio` prefix to make identifying these metrics for federation simple.

```text
groups:
- name: "istio.recording-rules"
  interval: 5s
  rules:
  - record: "istio:istio_requests:by_destination_service:rate1m"
    expr: |
      sum(irate(istio_requests_total{reporter="destination"}[1m]))
      by (
        destination_canonical_service,
        destination_workload_namespace
      )
  - record: "istio:istio_request_duration_milliseconds_bucket:p95:rate1m"
    expr: |
      histogram_quantile(0.95,
        sum(irate(istio_request_duration_milliseconds_bucket{reporter="source"}[1m]))
        by (
          destination_canonical_service,
          destination_workload_namespace,
          source_canonical_service,
          source_workload_namespace,
          le
        )
      )
```

The production instance of Prometheus would then be updated to federate from the Istio instance with:

* match clause of `{__name__=~"istio:(.*)"}`
* metric relabeling config with: `regex: "istio:(.*)"`

The original queries would then be replaced with:

* `istio_requests:by_destination_service:rate1m`
* `avg(istio_request_duration_milliseconds_bucket:p95:rate1m)`

A detailed write-up on [metrics collection optimization in production at AutoTrader](https://karlstoney.com/2020/02/25/federated-prometheus-to-reduce-metric-cardinality/) provides a more fleshed out example of aggregating directly to the queries that power dashboards and alerts.



