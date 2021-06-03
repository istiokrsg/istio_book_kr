# Example Visualizing Your Mesh



## Visualizing Your Mesh <a id="title"></a>

This task shows you how to visualize different aspects of your Istio mesh.

As part of this task, you install the [Kiali](https://www.kiali.io/) addon and use the web-based graphical user interface to view service graphs of the mesh and your Istio configuration objects. Lastly, you use the Kiali Developer API to generate graph data in the form of consumable JSON.This task does not cover all of the features provided by Kiali. To learn about the full set of features it supports, see the [Kiali website](http://kiali.io/documentation/latest/features/).

This task uses the [Bookinfo](https://istio.io/v1.7/docs/examples/bookinfo/) sample application as the example throughout. This task assumes the Bookinfo application is installed in the `bookinfo` namespace.

### Before you begin <a id="before-you-begin"></a>

Follow the [Kiali installation](https://istio.io/v1.7/docs/ops/integrations/kiali/#installation) documentation to deploy Kiali into your cluster.

### Generating a service graph <a id="generating-a-service-graph"></a>

1. To verify the service is running in your cluster, run the following command:

   ```text
   $ kubectl -n istio-system get svc kiali
   ```

2. To determine the Bookinfo URL, follow the instructions to determine the [Bookinfo ingress `GATEWAY_URL`](https://istio.io/v1.7/docs/examples/bookinfo/#determine-the-ingress-ip-and-port).
3. To send traffic to the mesh, you have three options
   * Visit `http://$GATEWAY_URL/productpage` in your web browser
   * Use the following command multiple times:

     ```text
     $ curl http://$GATEWAY_URL/productpage
     ```

   * If you installed the `watch` command in your system, send requests continually with:

     ```text
     $ watch -n 1 curl -o /dev/null -s -w %{http_code} $GATEWAY_URL/productpage
     ```
4. To open the Kiali UI, execute the following command in your Kubernetes environment:

   ```text
   $ istioctl dashboard kiali
   ```

5. View the overview of your mesh in the **Overview** page that appears immediately after you log in. The **Overview** page displays all the namespaces that have services in your mesh. The following screenshot shows a similar page:[![Example Overview](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-overview.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-overview.png)Example Overview
6. To view a namespace graph, click on the `bookinfo` graph icon in the Bookinfo namespace card. The graph icon is in the lower left of the namespace card and looks like a connected group of circles. The page looks similar to:[![Example Graph](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-graph.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-graph.png)Example Graph
7. To view a summary of metrics, select any node or edge in the graph to display its metric details in the summary details panel on the right.
8. To view your service mesh using different graph types, select a graph type from the **Graph Type** drop down menu. There are several graph types to choose from: **App**, **Versioned App**, **Workload**, **Service**.
   * The **App** graph type aggregates all versions of an app into a single graph node. The following example shows a single **reviews** node representing the three versions of the reviews app.[![Example App Graph](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-app.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-app.png)Example App Graph
   * The **Versioned App** graph type shows a node for each version of an app, but all versions of a particular app are grouped together. The following example shows the **reviews** group box that contains the three nodes that represents the three versions of the reviews app.[![Example Versioned App Graph](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-versionedapp.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-versionedapp.png)Example Versioned App Graph
   * The **Workload** graph type shows a node for each workload in your service mesh. This graph type does not require you to use the `app` and `version` labels so if you opt to not use those labels on your components, this is the graph type you will use.[![Example Workload Graph](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-workload.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-workload.png)Example Workload Graph
   * The **Service** graph type shows a node for each service in your mesh but excludes all apps and workloads from the graph.[![Example Service Graph](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-service-graph.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-service-graph.png)Example Service Graph

### Examining Istio configuration <a id="examining-istio-configuration"></a>

1. To view detailed information about Istio configuration, click on the **Applications**, **Workloads**, and **Services** menu icons on the left menu bar. The following screenshot shows information for the Bookinfo application:[![Example Details](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-services.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-services.png)Example Details

### Creating weighted routes <a id="creating-weighted-routes"></a>

You can use the Kiali weighted routing wizard to define the specific percentage of request traffic to route to two or more workloads.

1. View the **Versioned app graph** of the `bookinfo` graph.

   * Make sure you have selected **Requests percentage** in the **Display** drop down menu to see the percentage of traffic routed to each workload.
   * Make sure you have selected the **Service Nodes** check box in the **Display** drop down menu to view the service nodes in the graph.

   [![Bookinfo Graph Options](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-wiz0-graph-options.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-wiz0-graph-options.png)Bookinfo Graph Options

2. Focus on the `ratings` service within the `bookinfo` graph by clicking on the `ratings` service \(triangle\) node. Notice the `ratings` service traffic is evenly distributed to the two `ratings` workloads `v1` and `v2` \(50% of requests are routed to each workload\).[![Graph Showing Percentage of Traffic](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-wiz1-graph-ratings-percent.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-wiz1-graph-ratings-percent.png)Graph Showing Percentage of Traffic
3. Click the **ratings** link found in the side panel to go to the service view for the `ratings` service.
4. From the **Action** drop down menu, select **Create Weighted Routing** to access the weighted routing wizard.[![Service Action Menu](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-wiz2-ratings-service-action-menu.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-wiz2-ratings-service-action-menu.png)Service Action Menu
5. Drag the sliders to specify the percentage of traffic to route to each workload. For `ratings-v1`, set it to 10%; for `ratings-v2` set it to 90%.[![Weighted Routing Wizard](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-wiz3-weighted-routing-wizard.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-wiz3-weighted-routing-wizard.png)Weighted Routing Wizard
6. Click the **Create** button to create the new routing.
7. Click **Graph** in the left hand navigation bar to return to the `bookinfo` graph.
8. Send requests to the `bookinfo` application. For example, to send one request per second, you can execute this command if you have `watch` installed on your system:

   ```text
   $ watch -n 1 curl -o /dev/null -s -w %{http_code} $GATEWAY_URL/productpage
   ```

9. After a few minutes you will notice that the traffic percentage will reflect the new traffic route, thus confirming the fact that your new traffic route is successfully routing 90% of all traffic requests to `ratings-v2`.[![90% Ratings Traffic Routed to ratings-v2](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-wiz4-ratings-weighted-route-90-10.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-wiz4-ratings-weighted-route-90-10.png)90% Ratings Traffic Routed to ratings-v2

### Validating Istio configuration <a id="validating-istio-configuration"></a>

Kiali can validate your Istio resources to ensure they follow proper conventions and semantics. Any problems detected in the configuration of your Istio resources can be flagged as errors or warnings depending on the severity of the incorrect configuration. See the [Kiali validations page](https://kiali.io/documentation/latest/validations/) for the list of all validation checks Kiali performs.Istio 1.4 introduces `istioctl analyze` which lets you perform similar analysis in a way that can be used in a CI pipeline.

Force an invalid configuration of a service port name to see how Kiali reports a validation error.

1. Change the port name of the `details` service from `http` to `foo`:

   ```text
   $ kubectl patch service details -n bookinfo --type json -p '[{"op":"replace","path":"/spec/ports/0/name", "value":"foo"}]'
   ```

2. Navigate to the **Services** list by clicking **Services** on the left hand navigation bar.
3. Select `bookinfo` from the **Namespace** drop down menu if it is not already selected.
4. Notice the error icon displayed in the **Configuration** column of the `details` row.[![Services List Showing Invalid Configuration](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-validate1-list.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-validate1-list.png)Services List Showing Invalid Configuration
5. Click the **details** link in the **Name** column to navigate to the service details view.
6. Hover over the error icon to display a tool tip describing the error.[![Service Details Describing the Invalid Configuration](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-validate2-errormsg.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-validate2-errormsg.png)Service Details Describing the Invalid Configuration
7. Change the port name back to `http` to correct the configuration and return `bookinfo` back to its normal state.

   ```text
   $ kubectl patch service details -n bookinfo --type json -p '[{"op":"replace","path":"/spec/ports/0/name", "value":"http"}]'
   ```

   [![Service Details Showing Valid Configuration](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-validate3-ok.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-validate3-ok.png)Service Details Showing Valid Configuration

### Viewing and editing Istio configuration YAML <a id="viewing-and-editing-istio-configuration-yaml"></a>

Kiali provides a YAML editor for viewing and editing Istio configuration resources. The YAML editor will also provide validation messages when it detects incorrect configurations.

1. Create Bookinfo destination rules:

   ```text
   $ kubectl apply -f samples/bookinfo/networking/destination-rule-all.yaml
   ```

2. Click `Istio Config` on the left hand navigation bar to navigate to the Istio configuration list.
3. Select `bookinfo` from the **Namespace** drop down menu if it is not already selected.
4. Notice the error messages and the error and warning icons that alert you to several configuration problems.[![Istio Config List Incorrect Configuration Messages](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-istioconfig0-errormsgs.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-istioconfig0-errormsgs.png)Istio Config List Incorrect Configuration Messages
5. Hover over the error icon in the **Configuration** column of the `details` row to see additional messages.[![Istio Config List Incorrect Configuration Tool Tips](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-istioconfig1-tooltip.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-istioconfig1-tooltip.png)Istio Config List Incorrect Configuration Tool Tips
6. Click the **details** link in the **Name** column to navigate to the `details` destination rule view.
7. Notice the messages and icons that alert you to several validation rules that failed.[![Istio Configuration Details View Showing Errors](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-istioconfig2-details-errormsgs.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-istioconfig2-details-errormsgs.png)Istio Configuration Details View Showing Errors
8. Click the **YAML** tab to view the YAML for this Istio destination rule resource.
9. Notice the color highlights and icons on the rows that have failed validation checks.[![YAML Editor Showing Validation Errors and Warnings](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-istioconfig3-details-yaml1.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-istioconfig3-details-yaml1.png)YAML Editor Showing Validation Errors and Warnings
10. Hover over the yellow icon to view the tool tip message that informs you of the validation check that triggered the warning. For more details on the cause of the warning and how to resolve it, look up the validation warning message on the [Kiali Validations page](https://kiali.io/documentation/latest/validations/).[![YAML Editor Showing Warning Tool Tip](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-istioconfig3-details-yaml2.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-istioconfig3-details-yaml2.png)YAML Editor Showing Warning Tool Tip
11. Hover over the red icon to view the tool tip message that informs you of the validation check that triggered the error. For more details on the cause of the error and how to resolve it, look up the validation error message on the [Kiali Validations page](https://kiali.io/documentation/latest/validations/).[![YAML Editor Showing Error Tool Tip](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-istioconfig3-details-yaml3.png)](https://istio.io/v1.7/docs/tasks/observability/kiali/kiali-istioconfig3-details-yaml3.png)YAML Editor Showing Error Tool Tip
12. Delete the destination rules to return `bookinfo` back to its original state.

    ```text
    $ kubectl delete -f samples/bookinfo/networking/destination-rule-all.yaml
    ```

### About the Kiali Developer API <a id="about-the-kiali-developer-api"></a>

To generate JSON files representing the graphs and other metrics, health, and configuration information, you can access the [Kiali Developer API](https://www.kiali.io/api). For example, point your browser to `$KIALI_URL/api/namespaces/graph?namespaces=bookinfo&graphType=app` to get the JSON representation of your graph using the `app` graph type.

The Kiali Developer API is built on top of Prometheus queries and depends on the standard Istio metric configuration. It also makes Kubernetes API calls to obtain additional details about your services. For the best experience using Kiali, use the metadata labels `app` and `version` on your application components. As a template, the Bookinfo sample application follows this convention.

Please note the Kiali Developer API can change from version to version with no guarantee of backward compatibility.

### Additional Features <a id="additional-features"></a>

Kiali has more features than reviewed in this task, such as an [integration with Jaeger tracing](https://kiali.io/documentation/latest/features/#_detail_traces).

For more details on these additional features, see the [Kiali documentation](https://kiali.io/documentation/latest/features/).

### Cleanup <a id="cleanup"></a>

If you are not planning any follow-up tasks, remove the Bookinfo sample application and Kiali from your cluster.

1. To remove the Bookinfo application, refer to the [Bookinfo cleanup](https://istio.io/v1.7/docs/examples/bookinfo/#cleanup) instructions.
2. To remove Kiali from a Kubernetes environment:

```text
$ kubectl delete -f https://raw.githubusercontent.com/istio/istio/release-1.7/samples/addons/kiali.yaml
```

### [뒤로 가기](./README.md)

ref : [https://istio.io/v1.7/docs/tasks/observability/kiali/](https://istio.io/v1.7/docs/tasks/observability/kiali/)
