# TCP 서비스에 대한 메트릭 수집 [Collecting Metrics for TCP Services]


 이 작업은 메시에서 TCP 서비스에 대한 원격 분석을 자동으로 수집하도록 Istio를 구성하는 방법을 보여줍니다. 이 작업이 끝나면 메시에 대한 기본 TCP 지표를 쿼리 할 수 있습니다.

[EN] This task shows how to configure Istio to automatically gather telemetry for TCP services in a mesh. At the end of this task, you can query default TCP metrics for your mesh.


[Bookinfo](https://istio.io/v1.7/docs/examples/bookinfo/) 샘플 애플리케이션은 이 태스크 전체에서 예제로 사용됩니다.

[EN]The [Bookinfo](https://istio.io/v1.7/docs/examples/bookinfo/) sample application is used as the example throughout this task.


## Before you begin 

 * 클러스터에 [Istio를 설치](https://istio.io/v1.7/docs/setup)하고 애플리케이션을 배포합니다. [Prometheus](https://istio.io/v1.7/docs/ops/integrations/prometheus/)도 설치해야합니다.

 * [EN]Install Istio in your cluster and deploy an application. You must also install Prometheus.

 * 이 작업에서는 Bookinfo 샘플이 기본 네임 스페이스에 배포된다고 가정합니다. 다른 네임 스페이스를 사용하는 경우 예제 구성 및 명령을 업데이트하십시오.

  * [EN]This task assumes that the Bookinfo sample will be deployed in the default namespace. If you use a different namespace, update the example configuration and commands.

## Collecting new telemetry data

1. 몽고DB를 사용하는 Bookinfo 셋업하는 방법 - [EN]Setup Bookinfo to use MongoDB.
   1. ratings 서비스 버전2를 설치합니다. - [EN]Install v2 of the ratings service.
      만약 당신의 클러스터에 자동 사이드카 주입이 켜져 있다면, 다음 kubectl 명령어를 사용하여 서비스를 배포 할 수 있습니다.  
      [EN]If you are using a cluster with automatic sidecar injection enabled, deploy the services using kubectl:  
        
      `bash
      $ kubectl apply -f samples/bookinfo/platform/kube/bookinfo-ratings-v2.yaml`
      *`serviceaccount/bookinfo-ratings-v2 created`*
      *`deployment.apps/ratings-v2 created`*  
  
      만약 당신이 수동 사이드카 주입을 사용하고자 한다면, 다음 명령어로 사용하여 배포 할 수 있습니다.
      [EN]If you are using manual sidecar injection, run the following command instead:
      
      `bash  
      $ kubectl apply -f <(istioctl kube-inject -f samples/bookinfo/platform/kube/bookinfo-ratings-v2.yaml)`

      *`deployment "ratings-v2"configured`*                                              

   2. 몽고디비 서비스를 설치합니다. -[EN]Install the `mongodb` service: 
   
      만약 당신의 클러스터에 자동 사이드카 주입이 켜져 있다면, 다음 kubectl 명령어를 사용하여 서비스를 배포 할 수 있습니다. 
      [EN]If you are using a cluster with automatic sidecar injection enabled, deploy the services using kubectl: 
      
      `bash 
      $ kubectl apply -f samples/bookinfo/platform/kube/bookinfo-db.yaml`
      
      *`service/mongodb created`*
      *`deployment.apps/mongodb-v1 created`*

      만약 당신이 수동 사이드카 주입을 사용하고자 한다면, 다음 명령어로 사용하여 배포 할 수 있습니다.
      [EN]If you are using manual sidecar injection, run the following command instead: 
      
      `bash
      $ kubectl apply -f <(istioctl kube-inject -f samples/bookinfo/platform/kube/bookinfo-db.yaml)`
      
      *`service "mongodb" configured`*
      *`deployment "mongodb-v1" configured`*
   
   3. [EN]The Bookinfo sample deploys multiple versions of each microservice, so begin by creating destination rules that define the service subsets corresponding to each version, and the load balancing policy for each subset.  
      
      `bash  
      $ kubectl apply -f samples/bookinfo/networking/destination-rule-all.yaml`

      [EN]If you enabled mutual TLS, run the following command instead:  
      
      `bash  
      $ kubectl apply -f samples/bookinfo/networking/destination-rule-all-mtls.yaml`

      [EN]To display the destination rules, run the following command:

      `bash  
      $ kubectl get destinationrules -o yaml`

      [EN]Wait a few seconds for destination rules to propagate before adding virtual services that refer to these subsets, because the subset references in virtual services rely on the destination rules.

   4. [EN]Create ratings and reviews virtual services: 

      `bash $ kubectl apply -f samples/bookinfo/networking/virtual-service-ratings-db.yaml`

      *`virtualservice.networking.istio.io/reviews created`*
      *`virtualservice.networking.istio.io/ratings created`*

2. [EN]Send traffic to the sample application.  


   [EN]For the Bookinfo sample, visit `http://$GATEWAY_URL/productpage` in your web browser or use the following command:

   `bash 
   $ curl http://"$GATEWAY_URL/productpage"`

3. [EN]Verify that the TCP metric values are being generated and collected.  
   In a Kubernetes environment, setup port-forwarding for Prometheus by using the following command:

   `bash  
   $ istioctl dashboard prometheus`

   [EN]View the values for the TCP metrics in the Prometheus browser window. Select Graph. Enter the istio\_tcp\_connections\_opened\_total metric or istio\_tcp\_connections\_closed\_total and select Execute. The table displayed in the Console tab includes entries similar to:  

   `  
   istio_tcp_connections_opened_total{
   destination_version="v1",
   instance="172.17.0.18:42422",
   job="istio-mesh",
   canonical_service_name="ratings-v2",
   canonical_service_revision="v2"}
   `

   `
   istio_tcp_connections_closed_total{
   destination_version="v1",
   instance="172.17.0.18:42422",
   job="istio-mesh",
   canonical_service_name="ratings-v2",
   canonical_service_revision="v2"}
   `

## Understanding TCP telemetry collection

[EN]In this task, you used Istio configuration to automatically generate and report metrics for all traffic to a TCP service within the mesh. TCP Metrics for all active connections are recorded every 15s by default and this timer is configurable via tcpReportingDuration. Metrics for a connection are also recorded at the end of the connection.



## TCP attributes

[EN]Several TCP-specific attributes enable TCP policy and control within Istio. These attributes are generated by Envoy Proxies and obtained from Istio using Envoy’s Node Metadata. Envoy forwards Node Metadata to Peer Envoys using ALPN based tunneling and a prefix based protocol. We define a new protocol istio-peer-exchange, that is advertised and prioritized by the client and the server sidecars in the mesh. ALPN negotiation resolves the protocol to istio-peer-exchange for connections between Istio enabled proxies, but not between an Istio enabled proxy and any other proxy. This protocol extends TCP as follows:

1. [EN]TCP client, as a first sequence of bytes, sends a magic byte string and a length prefixed payload.
2. [EN]TCP server, as a first sequence of bytes, sends a magic byte sequence and a length prefixed payload. These payloads are protobuf encoded serialized metadata.
3. [EN]Client and server can write simultaneously and out of order. The extension filter in Envoy then does the further processing in downstream and upstream until either the magic byte sequence is not matched or the entire payload is read.

<figure style="width:100%">
<a href="https://istio.io/">
   <img src="https://istio.io/v1.7/docs/tasks/observability/metrics/tcp-metrics/alpn-based-tunneling-protocol.svg"
         alt="TCP Attribute Flow" title="TCP Attribute Flow"/>
   
</a>
<figcaption>TCP Attribute Flow</figcaption>
</figure>


## Cleanup

 * [EN]Remove the port-forward process: 

   `bash $ killall istioctl`

 * [EN]If you are not planning to explore any follow-on tasks, refer to the [Bookinfo cleanup](https://istio.io/v1.7/docs/examples/bookinfo/#cleanup) instructions to shutdown the application.




### [참고 docs](https://istio.io/v1.7/docs/tasks/observability/metrics/tcp-metrics/)


### [뒤로 가기](./README.md)
### [챕터로가기](../README.md)