# 요청 또는 응답을 기반으로 메트릭 분류 \(Experimental\)


메시의 서비스에서 처리하는 요청 및 응답 유형을 기반으로 원격 분석을 시각화하는 것이 유용합니다. 예를 들어 서점은 리뷰가 요청 된 횟수를 추적합니다. 리뷰 요청의 구조는 다음과 같습니다.

```text
GET /reviews/{review_id}
```

검토 요청 수를 계산할 때는 제한되지 않은 'review_id'요소를 고려해야합니다. `GET / reviews / 1` 다음에`GET / reviews / 2`가 오는 2 개의 리뷰 요청으로 계산되어야합니다. 

Istio를 사용하면 요청을 고정 된 수의 논리적 작업으로 그룹화하는 [AttributeGen 플러그인] (https://istio.io/v1.7/docs/reference/config/proxy_extensions/attributegen/)을 사용하여 분류 규칙을 만들 수 있습니다. 예를 들어 [`Open API Spec operationId`] (https://swagger.io/docs/specification/paths-and-operations/)를 사용하여 작업을 식별하는 일반적인 방법 인`GetReviews`라는 작업을 만들 수 있습니다. ). 이 정보는 `GetReviews`와 동일한 값을 갖는 `istio_operationId`속성으로 요청 처리에 삽입됩니다. 이 속성을 Istio 표준 메트릭의 차원으로 사용할 수 있습니다. 마찬가지로 `ListReviews`및 `CreateReviews`와 같은 다른 작업을 기반으로 측정 항목을 추적 할 수 있습니다.


자세한 내용은 [참조 콘텐츠](https://istio.io/v1.7/docs/reference/config/proxy_extensions/attributegen/)를 참조하세요.  

Istio는 Envoy 프록시를 사용하여 측정 항목을 생성하고  `EnvoyFilter`에 [`manifests/charts/istio-control/istio-discovery/templates/telemetryv2_1.6.yaml`](https://github.com/istio/istio/blob/release-1.7/manifests/charts/istio-control/istio-discovery/templates/telemetryv2_1.6.yaml). 결과적으로 분류 규칙 작성에는`EnvoyFilter`에 속성 추가가 포함됩니다.  


### 요청별로 메트릭 분류(Classify metrics by request)

유형에 따라 요청을 분류 할 수 있습니다 (예: `ListReview`, `GetReview`, `CreateReview`).

1. 예를 들어 파일을 만듭니다.
`attribute_gen_service.yaml`을 작성하고 다음 내용으로 저장합니다. 이것은`istio.attributegen` 플러그인을`EnvoyFilter`에 추가합니다. 또한`istio_operationId` 속성을 생성하고이를 측정 항목으로 계산할 카테고리 값으로 채웁니다.

   요청 경로는 일반적으로 서비스별로 다르기 때문에이 구성은 서비스별로 다릅니다.

   ```text
   apiVersion: networking.istio.io/v1alpha3
   kind: EnvoyFilter
   metadata:
     name: istio-attributegen-filter
   spec:
     workloadSelector:
       labels:
         app: reviews
     configPatches:
     - applyTo: HTTP_FILTER
       match:
         context: SIDECAR_INBOUND
         proxy:
           proxyVersion: '1\.6.*'
         listener:
           filterChain:
             filter:
               name: "envoy.http_connection_manager"
               subFilter:
                 name: "istio.stats"
       patch:
         operation: INSERT_BEFORE
         value:
           name: istio.attributegen
           typed_config:
             "@type": type.googleapis.com/udpa.type.v1.TypedStruct
             type_url: type.googleapis.com/envoy.extensions.filters.http.wasm.v3.Wasm
             value:
               config:
                 configuration: |
                   {
                     "attributes": [
                       {
                         "output_attribute": "istio_operationId",
                         "match": [
                           {
                             "value": "ListReviews",
                             "condition": "request.url_path == '/reviews' && request.method == 'GET'"
                           },
                           {
                             "value": "GetReview",
                             "condition": "request.url_path.matches('^/reviews/[[:alnum:]]*$') && request.method == 'GET'"
                           },
                           {
                             "value": "CreateReview",
                             "condition": "request.url_path == '/reviews/' && request.method == 'POST'"
                           }
                         ]
                       }
                     ]
                   }
                 vm_config:
                   runtime: envoy.wasm.runtime.null
                   code:
                     local: { inline_string: "envoy.wasm.attributegen" }

   ```

  2. 다음 명령을 사용하여 변경 사항을 적용하십시오.

```text
$ kubectl -n istio-system apply -f attribute_gen_service.yaml

```



  3. 다음 명령어를 사용하여`istio-system` 네임 스페이스에서`stats-filter-1.6`, `EnvoyFilter` 리소스를 찾습니다.

```text
kubectl -n istio-system get envoyfilter | grep ^stats-filter-1.6
stats-filter-1.6                    2d
```



  4. 다음 명령을 사용하여`EnvoyFilter` 구성의 로컬 파일 시스템 복사본을 만듭니다.

```text
$ kubectl -n istio-system get envoyfilter stats-filter-1.6 -o yaml > stats-filter-1.6.yaml
```



  5. 텍스트 편집기로 `stats-filter-1.6.yaml`을 열고 `name : istio.stats` 확장 구성을 찾습니다. `requests_total`표준 측정 항목의 `request_operation`측정 기준을 `istio_operationId`속성에 매핑하도록 업데이트하세요. 업데이트 된 구성 파일 섹션은 다음과 같아야합니다.

```text
name: istio.stats
typed_config:
  '@type': type.googleapis.com/udpa.type.v1.TypedStruct
  type_url: type.googleapis.com/envoy.extensions.filters.http.wasm.v3.Wasm
  value:
    config:
      configuration: >
        {
          "debug": "true",
          "stat_prefix": "istio",
          "metrics": [
           {
             "name": "requests_total",
             "dimensions": {
               "request_operation": "istio_operationId"
             }
           }]
        }

```

  6. `stats-filter-1.6.yaml`을 저장하고 다음 명령어를 사용하여 구성을 적용합니다.

```text
$ kubectl -n istio-system apply -f stats-filter-1.6.yaml
```

  7. 애플리케이션에 트래픽을 전송하여 메트릭을 생성합니다.

  8. 변경 사항이 적용된 후 Prometheus를 방문하여 새 차원 또는 변경된 차원 (예 :`istio_requests_total`)을 찾으십시오.

### 응답으로 메트릭 분류(Classify metrics by response)


요청과 유사한 프로세스를 사용하여 응답을 분류 할 수 있습니다.

  1. 예를 들어`attribute_gen_service.yaml`과 같은 파일을 만들고 다음 내용으로 저장합니다. 이렇게하면 `istio.attributegen` 플러그인이 `EnvoyFilter`에 추가되고 통계 플러그인에서 사용하는 `istio_responseClass` 속성이 생성됩니다. 이 예에서는 `200`범위의 모든 응답 코드를 `2xx`측정 기준으로 그룹화하는 등 다양한 응답을 분류합니다.

```text
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: istio-attributegen-filter
spec:
  workloadSelector:
    labels:
      app: productpage
  configPatches:
  - applyTo: HTTP_FILTER
    match:
      context: SIDECAR_INBOUND
      proxy:
        proxyVersion: '1\.6.*'
      listener:
        filterChain:
          filter:
            name: "envoy.http_connection_manager"
            subFilter:
              name: "istio.stats"
    patch:
      operation: INSERT_BEFORE
      value:
        name: istio.attributegen
        typed_config:
          "@type": type.googleapis.com/udpa.type.v1.TypedStruct
          type_url: type.googleapis.com/envoy.extensions.filters.http.wasm.v3.Wasm
          value:
            config:
              configuration: >
                {
                  "attributes": [
                    {
                      "output_attribute": "istio_responseClass",
                      "match": [
                        {
                          "value": "2xx",
                          "condition": "response.code >= 200 && response.code <= 299"
                        },
                        {
                          "value": "3xx",
                          "condition": "response.code >= 300 && response.code <= 399"
                        },
                        {
                          "value": "404",
                          "condition": "response.code == 404"
                        },
                        {
                          "value": "429",
                          "condition": "response.code == 429"
                        },
                        {
                          "value": "503",
                          "condition": "response.code == 503"
                        },
                        {
                          "value": "5xx",
                          "condition": "response.code >= 500 && response.code <= 599"
                        },
                        {
                          "value": "4xx",
                          "condition": "response.code >= 400 && response.code <= 499"
                        }
                      ]
                    }
                  ]
                }
              vm_config:
                runtime: envoy.wasm.runtime.null
                code:
                  local: { inline_string: "envoy.wasm.attributegen" }

```



  2. 다음 명령을 사용하여 변경 사항을 적용하십시오.

```text
$ kubectl -n istio-system apply -f attribute_gen_service.yaml

```

  3. 다음 명령어를 사용하여`istio-system` 네임 스페이스에서 `stats-filter-1.6` `EnvoyFilter` 리소스를 찾습니다.

```text
$ kubectl -n istio-system get envoyfilter | grep ^stats-filter-1.6
stats-filter-1.6                    2d
```

  4. 다음 명령을 사용하여 `EnvoyFilter` 구성의 로컬 파일 시스템 복사본을 만듭니다.

```text
$ kubectl -n istio-system get envoyfilter stats-filter-1.6 -o yaml > stats-filter-1.6.yaml


```

  5. 텍스트 편집기로`stats-filter-1.6.yaml`을 열고`name : istio.stats` 확장 구성을 찾습니다. `requests_total`표준 측정 항목의 `response_code`측정 기준을 `istio_responseClass`속성에 매핑하도록 업데이트하세요. 업데이트 된 구성 파일 섹션은 다음과 같아야합니다.


```text
name: istio.stats
typed_config:
  '@type': type.googleapis.com/udpa.type.v1.TypedStruct
  type_url: type.googleapis.com/envoy.extensions.filters.http.wasm.v3.Wasm
  value:
    config:
      configuration: >
        {
          "debug": "true",
          "stat_prefix": "istio",
          "metrics": [
           {
             "name": "requests_total",
             "dimensions": {
               "response_code": "istio_responseClass"
             }
           }]
        }

```

  6. `stats-filter-1.6.yaml`을 저장하고 다음 명령어를 사용하여 구성을 적용합니다.

```text
$ kubectl -n istio-system apply -f stats-filter-1.6.yaml


```



### 결과 확인(Verify the results)


  1. 애플리케이션에 트래픽을 전송하여 메트릭을 생성합니다.

  2. Prometheus를 방문하여 새 치수 또는 변경된 치수 (예 : 2xx)를 찾으십시오. 또는 다음 명령을 사용하여 Istio가 새 차원에 대한 데이터를 생성하는지 확인합니다.

```text
$ kubectl exec pod-name -c istio-proxy -- curl 'localhost:15000/stats/prometheus' | grep istio_

```

    출력에서 측정 항목 \ (예 :`istio_requests_total` \)을 찾고 새 측정 기준 또는 변경된 측정 기준이 있는지 확인합니다.



### 문제해결(Troubleshooting)


예상대로 분류되지 않으면 다음과 같은 잠재적 인 원인과 해결 방법을 확인하십시오.

구성 변경을 적용한 서비스가있는 포드의 Envoy 프록시 로그를 검토합니다. 다음 명령을 사용하여 분류를 구성한 \(pod-name\) 포드의 Envoy 프록시 로그에 서비스에서보고 한 오류가 없는지 확인합니다.


```text
$ kubectl logs pod-name -c istio-proxy | grep -e "Config Error" -e "envoy wasm"

```


또한 다음 명령의 출력에서 재시작 징후를 찾아 Envoy 프록시 충돌이 없는지 확인합니다.

```text
$ kubectl get pods pod-name


```

### [docs](https://istio.io/v1.7/docs/tasks/observability/metrics/classify-metrics/)
### [뒤로 가기](./README.md)


