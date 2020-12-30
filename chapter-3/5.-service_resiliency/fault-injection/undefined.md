# 네트워크 지연

분산 시스템 환경에서 일어날 수 있는 찾기 어려운 오류 중에 하나는 죽지 않은 서비스로 응답이 매우 느려서, 서비스 네트워크에서 중첩되는 장애를 야기할 수 있다. 만약 SLA\(Service-Level Agreement\)를 제공한다면, 기다리는 고객에게 전달하지 못할 수 오류와 관련 지연을 검증할 수 있을까? 네트워크 지연을 주입하여 중요한 서비스나, 일부 응답을 충분히 지연시켜, 시스템이 어떻게 반응하는지 살펴볼 수 있다. 오류코드 쥬입과 비슷하게 RouteRoule 을 이용한다. 다음 YAML 은 recommendation 서비스에서 50% 응답에 7초간의 지연을 주입한다.

```yaml
apiVersion: config.istio.io/v1alpha2
kind: RouteRule metadata:
name: recommendation-delay
spec:
  destination:
    namespace: tutorial
    name: recommendation
  precedence: 2
  route:
  - labels:
      app: recommendation
  httpFault:
    delay:
      percent: 50
      fixedDelay: 7s
```

Use the istioctl create command to apply the new RouteRule:

```bash
istioctl create -f istiofiles/route-rule-recommendation-delay.yml \
  -n tutorial
```

Then, send a few requests at the customer endpoint and notice the “time” com‐ mand at the front. This command will output the elapsed time for each response to the curl command, allowing you to see that seven-second delay.

```bash
#!/bin/bash
while true do
 time curl customer-tutorial.$(minishift ip).nip.io
 sleep .1
done
```

Notice that many requests to the customer end point now have a delay. If you are monitoring the logs for recommendation v1 and v2, you will also see the delay happens before the recommendation service is actually called. The delay is in the Istio proxy \(Envoy\), not in the actual endpoint.

```bash
stern recommendation -n tutorial
```

Clean up:

```bash
istioctl delete -f istiofiles/route-rule-recommendation-delay.yml -n tutorial
```

